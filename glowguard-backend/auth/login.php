<?php
require_once __DIR__ . '/../config/bootstrap.php';
require_method('POST');

$pdo = get_db();
$data = body();

$email = strtolower(trim($data['email'] ?? ''));
$password = (string) ($data['password'] ?? '');

if ($email === '' || $password === '') {
    json_error('Email and password are required.');
}

$stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email');
$stmt->execute(['email' => $email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    json_error('Invalid email or password.', 401);
}

if (isset($user['status']) && $user['status'] === 'deactivated') {
    json_error('This account has been deactivated by an administrator.', 403);
}

$token = issue_token($pdo, $user['user_id']);

json_out(['token' => $token, 'user' => public_user($user)]);
