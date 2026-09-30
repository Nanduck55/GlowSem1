<?php
require_once __DIR__ . '/config/bootstrap.php';
require_once __DIR__ . '/lib/helpers.php';
require_method('GET');

$pdo = get_db();
$user = require_auth($pdo);
$userId = $user['id'];

// glowguard_db has no tracker table, so the daily summary is computed from
// the daily routines (what is scheduled) and the AM / PM completion rows.
// A product set to "Both" counts as two slots (AM + PM); AM / PM as one.
$tod = [];
foreach (load_products($pdo, $userId) as $p) {
    $tod[$p['id']] = $p['timeOfDay'];
}

$out = [];
$scheduled = []; // date => [productId => true]

$stmt = $pdo->prepare(
    'SELECT r.routine_name AS routine_date, rp.product_id
     FROM routines r
     JOIN routine_products rp ON rp.routine_id = r.routine_id
     WHERE r.user_id = :uid AND r.routine_type = :type
     ORDER BY r.routine_name'
);
$stmt->execute(['uid' => $userId, 'type' => DAILY_TYPE]);

foreach ($stmt->fetchAll() as $row) {
    $date = $row['routine_date'];
    $pid = (int) $row['product_id'];
    if (!isset($tod[$pid])) continue;

    if (!isset($out[$date])) $out[$date] = ['completed' => 0, 'total' => 0];
    $out[$date]['total'] += $tod[$pid] === 'Both' ? 2 : 1;
    $scheduled[$date][$pid] = true;
}

// A "Both" product taken out of just AM or just PM for a day only counts once.
$stmt = $pdo->prepare(
    'SELECT DISTINCT r.routine_name AS routine_date, rp.product_id
     FROM routines r
     JOIN routine_products rp ON rp.routine_id = r.routine_id
     WHERE r.user_id = :uid AND r.routine_type IN (:rem_am, :rem_pm)'
);
$stmt->execute(['uid' => $userId, 'rem_am' => REMOVED_PREFIX . 'AM', 'rem_pm' => REMOVED_PREFIX . 'PM']);

foreach ($stmt->fetchAll() as $row) {
    $date = $row['routine_date'];
    $pid = (int) $row['product_id'];
    if (isset($scheduled[$date][$pid]) && ($tod[$pid] ?? null) === 'Both') {
        $out[$date]['total']--;
    }
}

$stmt = $pdo->prepare(
    'SELECT DISTINCT r.routine_name AS routine_date, rp.product_id, r.routine_type
     FROM routines r
     JOIN routine_products rp ON rp.routine_id = r.routine_id
     JOIN routine_logs l ON l.routine_product_id = rp.routine_product_id
     WHERE r.user_id = :uid AND r.routine_type IN (:am, :pm)'
);
$stmt->execute(['uid' => $userId, 'am' => 'AM', 'pm' => 'PM']);

foreach ($stmt->fetchAll() as $row) {
    $date = $row['routine_date'];
    $pid = (int) $row['product_id'];
    if (!isset($scheduled[$date][$pid])) continue;

    $applies = $tod[$pid] === 'Both' || $tod[$pid] === $row['routine_type'];
    if ($applies) $out[$date]['completed']++;
}

// Shape: { "YYYY-MM-DD": { completed, total }, ... }
json_out((object) $out);
