<?php
/**
 * Beauty Consultant Statistics endpoint (read-only, consultants only).
 * GET /consultant-stats.php
 *   -> { totals, severities, topClashes, coverage }
 * Counts only; no one's shelf or routine is returned.
 */
require_once __DIR__ . '/config/bootstrap.php';
require_method('GET');

$pdo = get_db();
require_consultant($pdo);

const STAT_SKIN_TYPES = ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'];

function stat_skin_key(?string $value): string
{
    $base = trim(preg_replace('/\s+skin$/i', '', trim((string) $value)));
    foreach (STAT_SKIN_TYPES as $type) {
        if (strcasecmp($base, $type) === 0) return $type;
    }
    return '';
}

// Clash rules by severity.
$severities = [];
$ruleTotal = 0;
foreach ($pdo->query('SELECT severity_level, COUNT(*) AS c FROM ingredient_clash_rules GROUP BY severity_level ORDER BY c DESC') as $row) {
    $severities[] = ['label' => (string) $row['severity_level'], 'count' => (int) $row['c']];
    $ruleTotal += (int) $row['c'];
}

// The shelf-based clash join used by the next two numbers: a user "runs into"
// a rule when they own a product with ingredient A and one with ingredient B.
const STAT_CLASH_JOIN =
    "FROM ingredient_clash_rules r
     JOIN product_ingredients pi1 ON pi1.ingredient_id = r.ingredient_id_1
     JOIN user_products u1 ON u1.product_id = pi1.product_id
     JOIN users usr ON usr.user_id = u1.user_id AND usr.role = 'user'
     JOIN product_ingredients pi2 ON pi2.ingredient_id = r.ingredient_id_2
     JOIN user_products u2 ON u2.product_id = pi2.product_id AND u2.user_id = u1.user_id";

$usersWithClash = (int) $pdo->query('SELECT COUNT(DISTINCT u1.user_id) ' . STAT_CLASH_JOIN)->fetchColumn();

$topClashes = [];
$stmt = $pdo->query(
    'SELECT a.ingredient_name AS name_a, b.ingredient_name AS name_b, COUNT(DISTINCT u1.user_id) AS user_count '
    . STAT_CLASH_JOIN . '
     JOIN active_ingredients a ON a.ingredient_id = r.ingredient_id_1
     JOIN active_ingredients b ON b.ingredient_id = r.ingredient_id_2
     GROUP BY r.rule_id, a.ingredient_name, b.ingredient_name
     ORDER BY user_count DESC, name_a ASC
     LIMIT 5'
);
foreach ($stmt as $row) {
    $topClashes[] = ['label' => $row['name_a'] . ' + ' . $row['name_b'], 'count' => (int) $row['user_count']];
}

// Users vs. visible recommendations for each skin type.
$users = array_fill_keys(STAT_SKIN_TYPES, 0);
foreach ($pdo->query("SELECT skin_type, COUNT(*) AS c FROM users WHERE role = 'user' GROUP BY skin_type") as $row) {
    $key = stat_skin_key($row['skin_type']);
    if ($key !== '') $users[$key] += (int) $row['c'];
}
$recs = array_fill_keys(STAT_SKIN_TYPES, 0);
$visibleRecs = 0;
foreach ($pdo->query('SELECT skin_type, COUNT(*) AS c FROM product_recommendations WHERE is_visible = 1 GROUP BY skin_type') as $row) {
    $visibleRecs += (int) $row['c'];
    $key = stat_skin_key($row['skin_type']);
    if ($key !== '') $recs[$key] += (int) $row['c'];
}

// "Needs more picks" = people with this skin type, but fewer than 1 visible
// recommendation for every 3 of them.
$coverage = [];
$wellCovered = 0;
foreach (STAT_SKIN_TYPES as $type) {
    $needsMore = $users[$type] > 0 && $recs[$type] * 3 < $users[$type];
    if ($recs[$type] > 0 && !$needsMore) $wellCovered++;
    $coverage[] = ['skinType' => $type, 'users' => $users[$type], 'recommendations' => $recs[$type], 'needsMore' => $needsMore];
}

json_out([
    'totals' => [
        'rules'           => $ruleTotal,
        'visibleRecs'     => $visibleRecs,
        'wellCovered'     => $wellCovered,
        'skinTypeCount'   => count(STAT_SKIN_TYPES),
        'usersWithClash'  => $usersWithClash,
    ],
    'severities' => $severities,
    'topClashes' => $topClashes,
    'coverage'   => $coverage,
]);