<?php
require_once __DIR__ . '/config/bootstrap.php';
require_once __DIR__ . '/lib/helpers.php';

$pdo = get_db();
$user = require_auth($pdo);
$userId = $user['id'];

/** Finds this user's routine_products row for a product on a date, or null. */
function find_routine_product(PDO $pdo, int $userId, string $date, int $productId): ?int
{
    $rid = find_routine($pdo, $userId, $date, DAILY_TYPE);
    if ($rid === null) return null;

    $stmt = $pdo->prepare(
        'SELECT routine_product_id FROM routine_products
         WHERE routine_id = :rid AND product_id = :pid
         ORDER BY routine_product_id LIMIT 1'
    );
    $stmt->execute(['rid' => $rid, 'pid' => $productId]);
    $id = $stmt->fetchColumn();
    return $id !== false ? (int) $id : null;
}

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET': {
        $date = $_GET['date'] ?? null;
        if (!valid_date($date)) json_error('A date query parameter (YYYY-MM-DD) is required.');

        json_out(routine_items($pdo, $userId, $date));
        break;
    }

    case 'POST': {
        $data = body();
        $date = $data['date'] ?? null;
        $productId = (int) ($data['productId'] ?? 0);
        if (!valid_date($date) || !$productId) json_error('date (YYYY-MM-DD) and productId are required.');

        // Confirm the product belongs to this user before adding it.
        $own = $pdo->prepare('SELECT product_id FROM products WHERE product_id = :id AND user_id = :uid');
        $own->execute(['id' => $productId, 'uid' => $userId]);
        if (!$own->fetch()) json_error('Product not found.', 404);

        $rid = find_or_create_routine($pdo, $userId, $date, DAILY_TYPE);

        if (find_routine_product($pdo, $userId, $date, $productId) === null) {
            $next = $pdo->prepare(
                'SELECT COALESCE(MAX(step_order), 0) + 1 FROM routine_products WHERE routine_id = :rid'
            );
            $next->execute(['rid' => $rid]);
            $step = (int) $next->fetchColumn();

            $pdo->prepare(
                'INSERT INTO routine_products (routine_id, product_id, step_order)
                 VALUES (:rid, :pid, :step)'
            )->execute(['rid' => $rid, 'pid' => $productId, 'step' => $step]);
        }

        json_out(routine_items($pdo, $userId, $date), 201);
        break;
    }

    case 'PUT': {
        $data = body();
        $date = $data['date'] ?? null;
        $productId = (int) ($data['productId'] ?? 0);
        if (!valid_date($date) || !$productId) json_error('date (YYYY-MM-DD) and productId are required.');

        if (array_key_exists('completed', $data)) {
            if (find_routine_product($pdo, $userId, $date, $productId) === null) {
                json_error('That product is not in this routine.', 404);
            }

            // AM and PM are tracked separately. Send timeOfDay: 'AM' | 'PM';
            // if it is left out, both periods are updated.
            $period = $data['timeOfDay'] ?? null;
            $periods = in_array($period, PERIODS, true) ? [$period] : PERIODS;

            foreach ($periods as $p) {
                set_period_completion($pdo, $userId, $date, $productId, $p, (bool) $data['completed']);
            }
        }

        // "Remove from routine" for ONE period only. Send {removed: true|false,
        // period: 'AM' | 'PM'} to hide the product from that period (or bring it
        // back); the daily row and the other period are left alone.
        if (array_key_exists('removed', $data)) {
            $period = $data['period'] ?? null;
            if (!in_array($period, PERIODS, true)) json_error("period must be 'AM' or 'PM'.");

            if (find_routine_product($pdo, $userId, $date, $productId) === null) {
                json_error('That product is not in this routine.', 404);
            }

            set_period_removed($pdo, $userId, $date, $productId, $period, (bool) $data['removed']);
        }

        json_out(routine_items($pdo, $userId, $date));
        break;
    }

    case 'DELETE': {
        $date = $_GET['date'] ?? null;
        $productId = (int) ($_GET['productId'] ?? 0);
        if (!valid_date($date) || !$productId) json_error('date (YYYY-MM-DD) and productId are required.');

        // Removes the product from that day's routine, including its AM / PM
        // completion rows (routine_logs are removed by ON DELETE CASCADE) and
        // any "removed from just AM / PM" markers.
        $pdo->prepare(
            'DELETE rp FROM routine_products rp
             JOIN routines r ON r.routine_id = rp.routine_id
             WHERE r.user_id = :uid AND r.routine_name = :date
               AND r.routine_type IN (:daily, :am, :pm, :rem_am, :rem_pm) AND rp.product_id = :pid'
        )->execute([
            'uid' => $userId, 'date' => $date, 'daily' => DAILY_TYPE,
            'am' => 'AM', 'pm' => 'PM',
            'rem_am' => REMOVED_PREFIX . 'AM', 'rem_pm' => REMOVED_PREFIX . 'PM',
            'pid' => $productId,
        ]);
        json_out(['ok' => true]);
        break;
    }

    default:
        json_error('Method not allowed.', 405);
}
