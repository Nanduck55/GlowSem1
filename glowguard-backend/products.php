<?php
require_once __DIR__ . '/config/bootstrap.php';
require_once __DIR__ . '/lib/helpers.php';

$pdo = get_db();
$user = require_auth($pdo);
$userId = $user['id'];

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET':
        // Load products mapped through user_products junction table
        json_out(load_products($pdo, $userId));
        break;

    case 'POST': {
        $data = body();
        $name = trim($data['name'] ?? '');
        $category = trim($data['category'] ?? '');
        $timeOfDay = (string) ($data['timeOfDay'] ?? 'Both');
        $actives = is_array($data['actives'] ?? null) ? $data['actives'] : [];

        if ($name === '' || $category === '') {
            json_error('Product name and category are required.');
        }

        $pdo->beginTransaction();
        try {
            // 1. Insert product into master catalog
            $stmt = $pdo->prepare(
                'INSERT INTO products (product_name, category, is_custom)
                 VALUES (:name, :category, 1)'
            );
            $stmt->execute(['name' => $name, 'category' => $category]);
            $productId = (int) $pdo->lastInsertId();

            // 2. Link product to user's shelf in user_products
            $userProdStmt = $pdo->prepare(
                'INSERT INTO user_products (user_id, product_id)
                 VALUES (:uid, :pid)'
            );
            $userProdStmt->execute(['uid' => $userId, 'pid' => $productId]);

            set_product_actives($pdo, $productId, $actives);
            set_product_time_of_day($pdo, $userId, $productId, $timeOfDay);
            $pdo->commit();
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            throw $e;
        }

        json_out(load_products($pdo, $userId, $productId)[0], 201);
        break;
    }

    case 'PUT': {
        $data = body();
        $id = (int) ($data['id'] ?? 0);
        if (!$id) json_error('Product id is required.');

        // Verify user owns this item via user_products
        $own = $pdo->prepare('SELECT product_id FROM user_products WHERE product_id = :id AND user_id = :uid');
        $own->execute(['id' => $id, 'uid' => $userId]);
        if (!$own->fetch()) json_error('Product not found.', 404);

        $name = trim($data['name'] ?? '');
        $category = trim($data['category'] ?? '');
        $timeOfDay = (string) ($data['timeOfDay'] ?? 'Both');
        $actives = is_array($data['actives'] ?? null) ? $data['actives'] : [];

        if ($name === '' || $category === '') {
            json_error('Product name and category are required.');
        }

        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare(
                'UPDATE products SET product_name = :name, category = :category WHERE product_id = :id'
            );
            $stmt->execute(['name' => $name, 'category' => $category, 'id' => $id]);

            set_product_actives($pdo, $id, $actives);
            set_product_time_of_day($pdo, $userId, $id, $timeOfDay);
            $pdo->commit();
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            throw $e;
        }

        json_out(load_products($pdo, $userId, $id)[0]);
        break;
    }

    case 'DELETE': {
        $id = (int) ($_GET['id'] ?? 0);
        if (!$id) json_error('Product id is required.');

        // Deleting from user_products removes it from user's shelf.
        // ON DELETE CASCADE takes care of cascading rows automatically.
        $stmt = $pdo->prepare('DELETE FROM user_products WHERE product_id = :id AND user_id = :uid');
        $stmt->execute(['id' => $id, 'uid' => $userId]);

        json_out(['ok' => true]);
        break;
    }

    default:
        json_error('Method not allowed.', 405);
}