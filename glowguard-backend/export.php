<?php
/**
 * Export endpoint for the signed-in user's own routine history (read-only).
 *
 * GET /export.php                      -> everything
 * GET /export.php?from=YYYY-MM-DD&to=YYYY-MM-DD   -> only that date range
 *
 * Returns:
 *   {
 *     days:  [{ date, completed, total }],
 *     items: [{ date, period: 'AM'|'PM', product, category, done }]
 *   }
 *
 * It uses the same rules as the Tracker (Both = AM + PM, a period the person
 * removed for that day is skipped). Only the caller's own data is read, and
 * nothing is written, so no schema change is needed.
 */
require_once __DIR__ . '/config/bootstrap.php';
require_once __DIR__ . '/lib/helpers.php';
require_method('GET');

$pdo = get_db();
$user = require_auth($pdo);
$userId = (int) $user['id'];

const EXPORT_MAX_DAYS = 366;

$from = $_GET['from'] ?? null;
$to   = $_GET['to'] ?? null;
if ($from !== null && !valid_date($from)) json_error('from must be YYYY-MM-DD.', 400);
if ($to !== null && !valid_date($to)) json_error('to must be YYYY-MM-DD.', 400);

// Products on this person's shelf (name, category, AM / PM / Both).
$products = [];
foreach (load_products($pdo, $userId) as $p) {
    $products[$p['id']] = $p;
}

// Days that have a routine (newest first so the cap keeps the recent ones).
$sql = 'SELECT DISTINCT routine_name FROM routines
        WHERE user_id = :uid AND routine_type = :type';
$params = ['uid' => $userId, 'type' => DAILY_TYPE];
if ($from !== null) { $sql .= ' AND routine_name >= :from'; $params['from'] = $from; }
if ($to !== null)   { $sql .= ' AND routine_name <= :to';   $params['to'] = $to; }
$sql .= ' ORDER BY routine_name DESC LIMIT ' . EXPORT_MAX_DAYS;

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$dates = array_reverse($stmt->fetchAll(PDO::FETCH_COLUMN));

$days = [];
$items = [];

foreach ($dates as $date) {
    if (!valid_date($date)) continue;

    $completed = 0;
    $total = 0;

    foreach (routine_items($pdo, $userId, $date) as $row) {
        $pid = (int) $row['productId'];
        if (!isset($products[$pid])) continue;

        $product = $products[$pid];
        $tod = $product['timeOfDay'];
        $periods = $tod === 'Both' ? ['AM', 'PM'] : [$tod];

        foreach ($periods as $period) {
            if (!empty($row['removed' . $period])) continue;

            $done = !empty($row['completed' . $period]);
            $total++;
            if ($done) $completed++;

            $items[] = [
                'date'     => $date,
                'period'   => $period,
                'product'  => $product['name'],
                'category' => $product['category'],
                'done'     => $done,
            ];
        }
    }

    $days[] = ['date' => $date, 'completed' => $completed, 'total' => $total];
}

json_out(['days' => $days, 'items' => $items]);
