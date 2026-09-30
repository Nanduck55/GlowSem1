<?php
require_once __DIR__ . '/../config/bootstrap.php';
require_once __DIR__ . '/../lib/password_reset.php';
require_method('POST');

$pdo = get_db();
$token = trim((string) (body()['token'] ?? ''));

$reset = find_valid_reset($pdo, $token);

// 410 Gone = the link is unusable (unknown, expired, or already used).
if (!$reset) {
    json_error('This reset link is invalid or has expired.', 410);
}
if (strtolower($reset['status'] ?? '') === 'deactivated') {
    json_error('This account has been deactivated. Please contact support.', 403);
}

json_out(['valid' => true, 'email' => mask_email($reset['email'])]);
