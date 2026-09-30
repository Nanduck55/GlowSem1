<?php
require_once __DIR__ . '/config/bootstrap.php';
require_once __DIR__ . '/lib/helpers.php';

$pdo = get_db();
$user = require_auth($pdo);
$userId = $user['id'];

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET':
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
            $stmt = $pdo->prepare(
                'INSERT INTO products (user_id, product_name, category, is_custom)
                 VALUES (:uid, :name, :category, 1)'
            );
            $stmt->execute(['uid' => $userId, 'name' => $name, 'category' => $category]);
            $id = (int) $pdo->lastInsertId();

            set_product_actives($pdo, $id, $actives);
            set_product_time_of_day($pdo, $userId, $id, $timeOfDay);
            $pdo->commit();
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            throw $e;
        }

        json_out(load_products($pdo, $userId, $id)[0], 201);
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
        $timeOfDay = (string) ($data['timeOfDay'] ?? 'Both');
        $actives = is_array($data['actives'] ?? null) ? $data['actives'] : [];

        if ($name === '' || $category === '') {
            json_error('Product name and category are required.');
        }

        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare(
                'UPDATE products SET product_name = :name, category = :category
                 WHERE product_id = :id AND user_id = :uid'
            );
            $stmt->execute(['name' => $name, 'category' => $category, 'id' => $id, 'uid' => $userId]);

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

        $stmt = $pdo->prepare('DELETE FROM products WHERE product_id = :id AND user_id = :uid');
        $stmt->execute(['id' => $id, 'uid' => $userId]);
        // product_ingredients / routine_products / routine_logs rows for this
        // product are removed automatically (ON DELETE CASCADE).
        json_out(['ok' => true]);
        break;
    }

    default:
        json_error('Method not allowed.', 405);
}
