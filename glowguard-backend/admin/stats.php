<?php
/**
 * Admin Statistics endpoint (read-only, admins only).
 * GET /admin/stats.php?days=7|30|90
 *   -> { days, totals, signups, skinTypes, topProducts, checkins }
 * Only totals are returned, never one person's routine.
 */
require_once __DIR__ . '/../config/bootstrap.php';
require_method('GET');

$pdo = get_db();
require_admin($pdo);

$days = (int) ($_GET['days'] ?? 30);
if (!in_array($days, [7, 30, 90], true)) $days = 30;
$since = date('Y-m-d H:i:s', strtotime("-{$days} days"));

function stat_value(PDO $pdo, string $sql, array $params = []): int
{
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return (int) $stmt->fetchColumn();
}

/** 'Oily Skin' / 'oily' -> 'Oily'. Anything else is kept as typed; blank -> 'Not set'. */
function stat_skin_label(?string $value): string
{
    $v = trim((string) $value);
    if ($v === '') return 'Not set';
    $base = trim(preg_replace('/\s+skin$/i', '', $v));
    foreach (['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'] as $type) {
        if (strcasecmp($base, $type) === 0) return $type;
    }
    return $base !== '' ? $base : 'Not set';
}

$totals = [
    'users'           => stat_value($pdo, "SELECT COUNT(*) FROM users WHERE role = 'user'"),
    'newUsers'        => stat_value($pdo, "SELECT COUNT(*) FROM users WHERE role = 'user' AND date_joined >= :s", ['s' => $since]),
    'pendingRequests' => stat_value($pdo, "SELECT COUNT(*) FROM users WHERE status = 'pending' AND role IN ('consultant', 'admin')"),
    // People who ticked off at least one product in the period.
    'activeUsers'     => stat_value(
        $pdo,
        "SELECT COUNT(DISTINCT r.user_id)
         FROM routine_logs l
         JOIN routine_products rp ON rp.routine_product_id = l.routine_product_id
         JOIN routines r ON r.routine_id = rp.routine_id
         JOIN users u ON u.user_id = r.user_id AND u.role = 'user'
         WHERE l.completed_at >= :s AND r.routine_type IN ('AM', 'PM')",
        ['s' => $since]
    ),
];

// Sign-ups for each of the last 8 weeks (weeks start on Monday).
$thisMonday = strtotime('monday this week');
$signups = [];
for ($i = 7; $i >= 0; $i--) {
    $start = strtotime("-{$i} weeks", $thisMonday);
    $end   = strtotime('+1 week', $start);
    $signups[] = [
        'label' => date('M j', $start),
        'count' => stat_value(
            $pdo,
            "SELECT COUNT(*) FROM users WHERE role = 'user' AND date_joined >= :a AND date_joined < :b",
            ['a' => date('Y-m-d 00:00:00', $start), 'b' => date('Y-m-d 00:00:00', $end)]
        ),
    ];
}

// Users by skin type (labels are tidied so "Normal Skin" and "Normal" count together).
$skin = [];
foreach ($pdo->query("SELECT skin_type, COUNT(*) AS c FROM users WHERE role = 'user' GROUP BY skin_type") as $row) {
    $label = stat_skin_label($row['skin_type']);
    $skin[$label] = ($skin[$label] ?? 0) + (int) $row['c'];
}
arsort($skin);
$skinTypes = [];
foreach ($skin as $label => $count) $skinTypes[] = ['label' => $label, 'count' => $count];

// Products on the most shelves (same-named custom products count together).
$topProducts = [];
$stmt = $pdo->query(
    'SELECT MIN(p.product_name) AS name, COUNT(DISTINCT up.user_id) AS c
     FROM user_products up
     JOIN products p ON p.product_id = up.product_id
     WHERE p.product_name IS NOT NULL AND p.product_name <> \'\'
     GROUP BY LOWER(TRIM(p.product_name))
     ORDER BY c DESC, name ASC
     LIMIT 5'
);
foreach ($stmt as $row) $topProducts[] = ['name' => $row['name'], 'count' => (int) $row['c']];

// Products ticked off in the period, AM vs PM.
$checkins = ['am' => 0, 'pm' => 0];
$stmt = $pdo->prepare(
    "SELECT r.routine_type AS period, COUNT(*) AS c
     FROM routine_logs l
     JOIN routine_products rp ON rp.routine_product_id = l.routine_product_id
     JOIN routines r ON r.routine_id = rp.routine_id
     WHERE l.completed_at >= :s AND r.routine_type IN ('AM', 'PM')
     GROUP BY r.routine_type"
);
$stmt->execute(['s' => $since]);
foreach ($stmt as $row) $checkins[strtolower($row['period'])] = (int) $row['c'];

json_out([
    'days'        => $days,
    'totals'      => $totals,
    'signups'     => $signups,
    'skinTypes'   => $skinTypes,
    'topProducts' => $topProducts,
    'checkins'    => $checkins,
]);