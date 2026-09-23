<?php
require_once __DIR__ . '/../config/bootstrap.php';
require_method('POST');

$pdo = get_db();
$data = body();

$name = trim($data['name'] ?? '');
$email = strtolower(trim($data['email'] ?? ''));
$password = (string) ($data['password'] ?? '');

if ($name === '' || $email === '' || $password === '') {
    json_error('Name, email, and password are required.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_error('Please enter a valid email address.');
}
if (strlen($password) < 6) {
    json_error('Password must contain at least 6 characters.');
}

// Updated 'id' to 'user_id' to match your schema
$check = $pdo->prepare('SELECT user_id FROM users WHERE email = :email');
$check->execute(['email' => $email]);
if ($check->fetch()) {
    json_error('An account with that email already exists.', 409);
}

$hash = password_hash($password, PASSWORD_DEFAULT);

$insert = $pdo->prepare(
    'INSERT INTO users (full_name, email, password_hash) VALUES (:name, :email, :hash)'
);
$insert->execute(['name' => $name, 'email' => $email, 'hash' => $hash]);
$userId = (int) $pdo->lastInsertId();

$stmt = $pdo->prepare('SELECT * FROM users WHERE user_id = :id');
$stmt->execute(['id' => $userId]);
$user = $stmt->fetch();

$token = issue_token($pdo, $userId);

json_out(['token' => $token, 'user' => public_user($user)], 201);