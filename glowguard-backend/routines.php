<?php
/**
 * Daily Routine Management Endpoint.
 */
require_once __DIR__ . '/config/bootstrap.php';
require_once __DIR__ . '/lib/helpers.php';

$pdo = get_db();
$user = require_auth($pdo);
$userId = (int) $user['id'];

function find_routine_product(PDO $pdo, int $userId, string $date, int $productId): ?int
{
    $rid = find_routine($pdo, $userId, $date, DAILY_TYPE);
    if ($rid === null) return null;

    $stmt = $pdo->prepare(
        'SELECT routine_product_id FROM routine_products
         WHERE routine_id = :rid AND product_id = :pid
         ORDER BY routine_product_id ASC LIMIT 1'
    );
    $stmt->execute(['rid' => $rid, 'pid' => $productId]);
    $id = $stmt->fetchColumn();
    return $id !== false ? (int) $id : null;
}

/**
 * Saves a new card order for one day's routine.
 * $order = product ids in the order they should now appear. Products that
 * are not in $order (e.g. ones hidden because they belong to the other
 * AM/PM routine) keep their current position.
 */
function reorder_routine(PDO $pdo, int $userId, string $date, array $order): void
{
    $rid = find_routine($pdo, $userId, $date, DAILY_TYPE);
    if ($rid === null) return;

    $stmt = $pdo->prepare(
        'SELECT routine_product_id, product_id FROM routine_products
         WHERE routine_id = :rid
         ORDER BY step_order ASC, routine_product_id ASC'
    );
    $stmt->execute(['rid' => $rid]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $final = [];        // routine_product_id at each position
    $rpByProduct = [];  // product_id => routine_product_id
    $slotByProduct = []; // product_id => position
    foreach ($rows as $i => $row) {
        $pid = (int) $row['product_id'];
        $final[$i] = (int) $row['routine_product_id'];
        if (!isset($slotByProduct[$pid])) {
            $slotByProduct[$pid] = $i;
            $rpByProduct[$pid] = (int) $row['routine_product_id'];
        }
    }

    $order = array_values(array_unique(array_filter(
        $order,
        fn($pid) => isset($slotByProduct[$pid])
    )));
    if (count($order) < 2) return;

    // Positions those products use now (lowest first), refilled in the new order.
    $positions = array_map(fn($pid) => $slotByProduct[$pid], $order);
    sort($positions);
    foreach ($positions as $k => $pos) {
        $final[$pos] = $rpByProduct[$order[$k]];
    }

    $upd = $pdo->prepare('UPDATE routine_products SET step_order = :step WHERE routine_product_id = :id');
    foreach ($final as $i => $rpId) {
        $upd->execute(['step' => $i + 1, 'id' => $rpId]);
    }
}

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET':
        $date = $_GET['date'] ?? null;
        if (!valid_date($date)) json_error('A valid date parameter (YYYY-MM-DD) is required.', 400);
        json_out(routine_items($pdo, $userId, $date));
        break;

    case 'POST':
        $data = body();
        $date = $data['date'] ?? null;
        $productId = (int) ($data['productId'] ?? 0);
        if (!valid_date($date) || !$productId) {
            json_error('A valid date (YYYY-MM-DD) and productId are required.', 400);
        }

        // Verify user owns this item via user_products
        $own = $pdo->prepare('SELECT product_id FROM user_products WHERE product_id = :id AND user_id = :uid');
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

    case 'PUT':
        $data = body();
        $date = $data['date'] ?? null;

        // Reorder cards: { date, order: [productId, productId, ...] }
        if (isset($data['order']) && is_array($data['order'])) {
            if (!valid_date($date)) json_error('A valid date (YYYY-MM-DD) is required.', 400);
            reorder_routine($pdo, $userId, $date, array_map('intval', $data['order']));
            json_out(routine_items($pdo, $userId, $date));
            break;
        }

        $productId = (int) ($data['productId'] ?? 0);
        if (!valid_date($date) || !$productId) {
            json_error('A valid date (YYYY-MM-DD) and productId are required.', 400);
        }

        if (array_key_exists('completed', $data)) {
            if (find_routine_product($pdo, $userId, $date, $productId) === null) {
                json_error('That product is not in this routine.', 404);
            }

            $period = $data['timeOfDay'] ?? null;
            $periods = in_array($period, PERIODS, true) ? [$period] : PERIODS;

            foreach ($periods as $p) {
                set_period_completion($pdo, $userId, $date, $productId, $p, (bool) $data['completed']);
            }
        }

        if (array_key_exists('removed', $data)) {
            $period = $data['period'] ?? null;
            if (!in_array($period, PERIODS, true)) json_error("Period must be 'AM' or 'PM'.", 422);

            if (find_routine_product($pdo, $userId, $date, $productId) === null) {
                json_error('That product is not in this routine.', 404);
            }

            set_period_removed($pdo, $userId, $date, $productId, $period, (bool) $data['removed']);
        }

        json_out(routine_items($pdo, $userId, $date));
        break;

    case 'DELETE':
        $date = $_GET['date'] ?? null;
        $productId = (int) ($_GET['productId'] ?? 0);
        if (!valid_date($date) || !$productId) {
            json_error('A valid date (YYYY-MM-DD) and productId are required.', 400);
        }

        $pdo->prepare(
            'DELETE rp FROM routine_products rp
             JOIN routines r ON r.routine_id = rp.routine_id
             WHERE r.user_id = :uid AND r.routine_name = :date
               AND r.routine_type IN (:daily, :am, :pm, :rem_am, :rem_pm) AND rp.product_id = :pid'
        )->execute([
            'uid'    => $userId, 
            'date'   => $date, 
            'daily'  => DAILY_TYPE,
            'am'     => 'AM', 
            'pm'     => 'PM',
            'rem_am' => REMOVED_PREFIX . 'AM', 
            'rem_pm' => REMOVED_PREFIX . 'PM',
            'pid'    => $productId,
        ]);
        json_out(['ok' => true]);
        break;

    default:
        json_error('Method not allowed.', 405);
}