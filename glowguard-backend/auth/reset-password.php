<?php
require_once __DIR__ . '/../config/bootstrap.php';
require_once __DIR__ . '/../lib/password_reset.php';
require_method('POST');

$pdo = get_db();
$data = body();

$token = trim((string) ($data['token'] ?? ''));
$password = (string) ($data['password'] ?? '');

// Validation problems are 400; a bad/expired link is 410 (the frontend uses the
// difference to decide between "fix your input" and "request a new link").
if (strlen($password) < 6) {
    json_error('Password must contain at least 6 characters.');
}

$reset = find_valid_reset($pdo, $token);
if (!$reset) {
    json_error('This reset link is invalid or has expired.', 410);
}
if (strtolower($reset['status'] ?? '') === 'deactivated') {
    json_error('This account has been deactivated. Please contact support.', 403);
}

$hash = password_hash($password, PASSWORD_DEFAULT);

$pdo->beginTransaction();
try {
    $pdo->prepare('UPDATE users SET password_hash = :hash WHERE user_id = :id')
        ->execute(['hash' => $hash, 'id' => $reset['user_id']]);

    // The link is single-use.
    $pdo->prepare('DELETE FROM password_resets WHERE email = :email')
        ->execute(['email' => $reset['email']]);

    // Sign the account out everywhere: anyone holding an old session (for
    // example the person who got into the account) has to log in again.
    $pdo->prepare('DELETE FROM auth_tokens WHERE user_id = :id')
        ->execute(['id' => $reset['user_id']]);

    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    throw $e;
}

json_out(['message' => 'Your password has been updated. You can now sign in.']);
