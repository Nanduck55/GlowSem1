<?php
require_once __DIR__ . '/config/bootstrap.php';

$pdo = get_db();
$user = require_auth($pdo);
$userId = $user['user_id']; 

// Helper to fetch normalized ingredients from your junction table
function get_product_actives(PDO $pdo, int $productId): array {
    $stmt = $pdo->prepare('
        SELECT ai.ingredient_name 
        FROM product_ingredients pi
        JOIN active_ingredients ai ON pi.ingredient_id = ai.ingredient_id
        WHERE pi.product_id = :pid
    ');
    $stmt->execute(['pid' => $productId]);
    return $stmt->fetchAll(PDO::FETCH_COLUMN);
}

function row_to_product(array $row, array $actives): array
{
    return [
        'id'         => (int) $row['product_id'], 
        'name'       => $row['product_name'], 
        'category'   => $row['category'],
        'timeOfDay'  => 'Both', // disabled cause wrong table!
        'actives'    => $actives,
    ];
}

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET':
        $stmt = $pdo->prepare('SELECT * FROM products WHERE user_id = :uid ORDER BY product_id');
        $stmt->execute(['uid' => $userId]);
        
        $products = [];
        foreach ($stmt->fetchAll() as $row) {
            $actives = get_product_actives($pdo, $row['product_id']);
            $products[] = row_to_product($row, $actives);
        }
        json_out($products);
        break;

    case 'POST': {
        $data = body();
        $name = trim($data['name'] ?? '');
        $category = trim($data['category'] ?? '');
        $brand = trim($data['brand'] ?? 'Custom');
        $actives = is_array($data['actives'] ?? null) ? $data['actives'] : [];

        if ($name === '' || $category === '') {
            json_error('Product name and category are required.');
        }

        $pdo->beginTransaction();
        try {
            // Insert core product matching your ERD columns
            $stmt = $pdo->prepare(
                'INSERT INTO products (user_id, product_name, category, brand, is_custom)
                 VALUES (:uid, :name, :category, :brand, 1)'
            );
            $stmt->execute([
                'uid' => $userId,
                'name' => $name,
                'category' => $category,
                'brand' => $brand
            ]);
            $productId = (int) $pdo->lastInsertId();

            // Insert into product_ingredients junction table
            $getIng = $pdo->prepare('SELECT ingredient_id FROM active_ingredients WHERE ingredient_name = :name');
            $insIng = $pdo->prepare('INSERT INTO active_ingredients (ingredient_name) VALUES (:name)');
            $insJunc = $pdo->prepare('INSERT INTO product_ingredients (product_id, ingredient_id) VALUES (:pid, :iid)');

            foreach ($actives as $activeName) {
                $getIng->execute(['name' => $activeName]);
                $ingId = $getIng->fetchColumn();
                
                if (!$ingId) {
                    $insIng->execute(['name' => $activeName]);
                    $ingId = $pdo->lastInsertId();
                }
                $insJunc->execute(['pid' => $productId, 'iid' => $ingId]);
            }

            $pdo->commit();

            $get = $pdo->prepare('SELECT * FROM products WHERE product_id = :id');
            $get->execute(['id' => $productId]);
            json_out(row_to_product($get->fetch(), $actives), 201);
        } catch (Exception $e) {
            $pdo->rollBack();
            json_error('Failed to create product: ' . $e->getMessage(), 500);
        }
        break;
    }

    case 'PUT': {
        $data = body();
        $id = (int) ($data['id'] ?? 0);
        if (!$id) json_error('Product id is required.');

        $own = $pdo->prepare('SELECT product_id FROM products WHERE product_id = :id AND user_id = :uid');
        $own->execute(['id' => $id, 'uid' => $userId]);
        if (!$own->fetch()) json_error('Product not found.', 404);

        $name = trim($data['name'] ?? '');
        $category = trim($data['category'] ?? '');
        $actives = is_array($data['actives'] ?? null) ? $data['actives'] : [];

        if ($name === '' || $category === '') {
            json_error('Product name and category are required.');
        }

        $pdo->beginTransaction();
        try {
            // Update the core product
            $stmt = $pdo->prepare(
                'UPDATE products SET product_name = :name, category = :category
                 WHERE product_id = :id AND user_id = :uid'
            );
            $stmt->execute(['name' => $name, 'category' => $category, 'id' => $id, 'uid' => $userId]);

            // Wipe old junction connections and re-insert the new ones
            $pdo->prepare('DELETE FROM product_ingredients WHERE product_id = :id')->execute(['id' => $id]);

            $getIng = $pdo->prepare('SELECT ingredient_id FROM active_ingredients WHERE ingredient_name = :name');
            $insIng = $pdo->prepare('INSERT INTO active_ingredients (ingredient_name) VALUES (:name)');
            $insJunc = $pdo->prepare('INSERT INTO product_ingredients (product_id, ingredient_id) VALUES (:pid, :iid)');

            foreach ($actives as $activeName) {
                $getIng->execute(['name' => $activeName]);
                $ingId = $getIng->fetchColumn();
                
                if (!$ingId) {
                    $insIng->execute(['name' => $activeName]);
                    $ingId = $pdo->lastInsertId();
                }
                $insJunc->execute(['pid' => $id, 'iid' => $ingId]);
            }

            $pdo->commit();

            $get = $pdo->prepare('SELECT * FROM products WHERE product_id = :id');
            $get->execute(['id' => $id]);
            json_out(row_to_product($get->fetch(), $actives));
        } catch (Exception $e) {
            $pdo->rollBack();
            json_error('Failed to update product: ' . $e->getMessage(), 500);
        }
        break;
    }

    case 'DELETE': {
        $id = (int) ($_GET['id'] ?? 0);
        if (!$id) json_error('Product id is required.');
        
        $pdo->beginTransaction();
        try {
            // Manually delete junction table records first to avoid foreign key constraint errors
            $stmt = $pdo->prepare('DELETE FROM product_ingredients WHERE product_id = :id');
            $stmt->execute(['id' => $id]);

            // Delete the product itself
            $stmt = $pdo->prepare('DELETE FROM products WHERE product_id = :id AND user_id = :uid');
            $stmt->execute(['id' => $id, 'uid' => $userId]);
            
            $pdo->commit();
            json_out(['ok' => true]);
        } catch (Exception $e) {
            $pdo->rollBack();
            json_error('Failed to delete product: ' . $e->getMessage(), 500);
        }
        break;
    }

    default:
        json_error('Method not allowed.', 405);
}