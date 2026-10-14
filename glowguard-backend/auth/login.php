<?php
require_once __DIR__ . '/../config/bootstrap.php';
require_method('POST');

$pdo = get_db();
$data = body();

$email = strtolower(trim($data['email'] ?? ''));
$password = (string) ($data['password'] ?? '');

if ($email === '' || $password === '') {
    json_error('Email and password are required.', 400);
}

$stmt = $pdo->prepare('SELECT user_id, full_name, email, password_hash, role, status, skin_type, routine_goal, date_joined FROM users WHERE LOWER(email) = LOWER(:email)');
$stmt->execute(['email' => $email]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

$user = $row ? normalize_user($row) : null;

if (!$user || !isset($user['password_hash']) || !password_verify($password, $user['password_hash'])) {
    json_error('Incorrect email or password.', 401);
}

if ($user['status'] === 'deactivated') {
    json_error('This account has been deactivated. Please contact support.', 403);
}

if ($user['status'] === 'pending') {
    json_error('Your account is awaiting admin approval. You can sign in once it is approved.', 403);
}

if ($user['status'] === 'rejected') {
    json_error('Your sign-up request was not approved. Please contact support.', 403);
}

$token = issue_token($pdo, (int) $user['id']);

json_out(['token' => $token, 'user' => public_user($user)]);