<?php
require_once __DIR__ . '/config/bootstrap.php';
require_method('GET');

$pdo = get_db();
$user = require_auth($pdo);

$stmt = $pdo->prepare(
    'SELECT tracker_date, completed_count, total FROM tracker WHERE user_id = :uid ORDER BY tracker_date'
);

$stmt->execute(['uid' => $user['user_id']]); 

$out = [];
foreach ($stmt->fetchAll() as $row) {
    $out[$row['tracker_date']] = [
        'completed' => (int) $row['completed_count'],
        'total'     => (int) $row['total'],
    ];
}

json_out($out);