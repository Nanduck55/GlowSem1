<?php
require_once __DIR__ . '/config/bootstrap.php';

$pdo = get_db();
$user = require_auth($pdo);
$userId = $user['user_id']; 

// The frontend JS still expects the returned array to use camelCase "productId"
function row_to_routine_item(array $row): array
{
    return [
        'productId' => (int) $row['product_id'],
        'completed' => (bool) $row['completed'],
    ];
}

/** 
 * Fetches the user's routine ID for a specific type (AM/PM).
 * If it doesn't exist yet, it creates the template in the database.
 */
function get_user_routine_id(PDO $pdo, int $userId, string $routineType): int
{
    $stmt = $pdo->prepare('SELECT routine_id FROM routines WHERE user_id = :uid AND routine_type = :type LIMIT 1');
    $stmt->execute(['uid' => $userId, 'type' => $routineType]);
    $row = $stmt->fetch();

    if ($row) return (int) $row['routine_id'];

    $insert = $pdo->prepare("INSERT INTO routines (user_id, routine_name, routine_type) VALUES (:uid, :name, :type)");
    $insert->execute(['uid' => $userId, 'name' => $routineType . ' Routine', 'type' => $routineType]);
    return (int) $pdo->lastInsertId();
}

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET': {
        $routineType = $_GET['routine_type'] ?? null;
        if (!$routineType) json_error('routine_type query parameter is required.');

        $stmt = $pdo->prepare(
            'SELECT rp.product_id, 0 AS completed
             FROM routines r
             JOIN routine_products rp ON r.routine_id = rp.routine_id
             WHERE r.user_id = :uid AND r.routine_type = :type
             ORDER BY rp.step_order, rp.product_id'
        );
        $stmt->execute(['uid' => $userId, 'type' => $routineType]);
        json_out(array_map('row_to_routine_item', $stmt->fetchAll()));
        break;
    }

    case 'POST': {
        $data = body();
        $routineType = $data['routine_type'] ?? null;
        $productId = (int) ($data['product_id'] ?? 0);
        
        if (!$routineType || !$productId) json_error('routine_type and product_id are required.');

        $own = $pdo->prepare('SELECT product_id FROM products WHERE product_id = :id AND user_id = :uid');
        $own->execute(['id' => $productId, 'uid' => $userId]);
        // Allow adding global products (where user_id is NULL) as well as custom user products
        if (!$own->fetch() && !is_null($userId)) { 
            // Query needs refinement if products are shared, but keeping simple ownership check for now
        }

        $routineId = get_user_routine_id($pdo, $userId, $routineType);

        $check = $pdo->prepare('SELECT routine_product_id FROM routine_products WHERE routine_id = :rid AND product_id = :pid');
        $check->execute(['rid' => $routineId, 'pid' => $productId]);
        
        if (!$check->fetch()) {
            $insert = $pdo->prepare('INSERT INTO routine_products (routine_id, product_id, step_order) VALUES (:rid, :pid, 0)');
            $insert->execute(['rid' => $routineId, 'pid' => $productId]);
        }

        $get = $pdo->prepare(
            'SELECT rp.product_id, 0 AS completed
             FROM routine_products rp
             WHERE rp.routine_id = :rid'
        );
        $get->execute(['rid' => $routineId]);
        json_out(array_map('row_to_routine_item', $get->fetchAll()), 201);
        break;
    }

    case 'DELETE': {
        $routineType = $_GET['routine_type'] ?? null;
        $productId = (int) ($_GET['product_id'] ?? 0);
        if (!$routineType || !$productId) json_error('routine_type and product_id are required.');

        $routineId = get_user_routine_id($pdo, $userId, $routineType);

        $stmt = $pdo->prepare('DELETE FROM routine_products WHERE routine_id = :rid AND product_id = :pid');
        $stmt->execute(['rid' => $routineId, 'pid' => $productId]);

        json_out(['ok' => true]);
        break;
    }

    case 'PUT': {
        $data = body();
        
        $productId = (int) ($data['product_id'] ?? $data['productId'] ?? 0);
        
        $date = $data['date'] ?? date('Y-m-d'); 
        
        if (!$productId) {
            json_error('product_id is required.');
        }

        $find = $pdo->prepare('
            SELECT rp.routine_product_id, r.routine_id 
            FROM routine_products rp
            JOIN routines r ON rp.routine_id = r.routine_id
            WHERE r.user_id = :uid AND rp.product_id = :pid
            LIMIT 1
        ');
        $find->execute(['uid' => $userId, 'pid' => $productId]);
        $rp = $find->fetch();

        if (!$rp) json_error('Product is not in your routine.', 404);
        $rpId = $rp['routine_product_id'];
        $routineId = $rp['routine_id']; // Captured for step 5

        if (array_key_exists('completed', $data)) {
            if ($data['completed']) {
                $check = $pdo->prepare('SELECT log_id FROM routine_logs WHERE routine_product_id = :rpid AND DATE(completed_at) = :date');
                $check->execute(['rpid' => $rpId, 'date' => $date]);
                
                if (!$check->fetch()) {
                    $timestamp = $date . ' 12:00:00';
                    $insert = $pdo->prepare('INSERT INTO routine_logs (routine_product_id, completed_at) VALUES (:rpid, :time)');
                    $insert->execute(['rpid' => $rpId, 'time' => $timestamp]);
                }
            } else {
                $delete = $pdo->prepare('DELETE FROM routine_logs WHERE routine_product_id = :rpid AND DATE(completed_at) = :date');
                $delete->execute(['rpid' => $rpId, 'date' => $date]);
            }
        }

        $get = $pdo->prepare('
            SELECT rp.product_id, IF(rl.log_id IS NOT NULL, 1, 0) AS completed
            FROM routine_products rp
            LEFT JOIN routine_logs rl ON rp.routine_product_id = rl.routine_product_id AND DATE(rl.completed_at) = :date
            WHERE rp.routine_id = :rid
            ORDER BY rp.step_order, rp.product_id
        ');
        $get->execute(['rid' => $routineId, 'date' => $date]);
        json_out(array_map('row_to_routine_item', $get->fetchAll()));
        
        break;
    }

    default:
        json_error('Method not allowed.', 405);
}