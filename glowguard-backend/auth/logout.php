<?php
require_once __DIR__ . '/../config/bootstrap.php';
require_method('POST');

$pdo = get_db();
$token = bearer_token();

if ($token) {
    $stmt = $pdo->prepare('DELETE FROM auth_tokens WHERE token = :token');
    $stmt->execute(['token' => $token]);
}

json_out(['ok' => true]);
