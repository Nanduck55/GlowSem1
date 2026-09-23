<?php
require_once __DIR__ . '/../config/bootstrap.php';
require_method('PUT');

$pdo = get_db();
$user = require_auth($pdo);
$data = body();

$fields = [];
$params = ['id' => $user['user_id']];

if (array_key_exists('name', $data)) {
    $name = trim((string) $data['name']);
    if ($name === '') json_error('Name cannot be empty.');
    $fields[] = 'full_name = :name';
    $params['name'] = $name;
}

if (array_key_exists('email', $data)) {
    $email = strtolower(trim((string) $data['email']));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) json_error('Please enter a valid email address.');

    $check = $pdo->prepare('SELECT user_id FROM users WHERE email = :email AND user_id != :id');
    $check->execute(['email' => $email, 'id' => $user['user_id']]);
    if ($check->fetch()) json_error('That email is already in use.', 409);

    $fields[] = 'email = :email';
    $params['email'] = $email;
}

if (array_key_exists('skinType', $data)) {
    $fields[] = 'skin_type = :skin_type';
    $params['skin_type'] = $data['skinType'] !== null ? (string) $data['skinType'] : null;
}

if (array_key_exists('skinGoal', $data)) {
    $fields[] = 'routine_goal = :routine_goal';
    $params['routine_goal'] = $data['skinGoal'] !== null ? (string) $data['skinGoal'] : null;
}

if (!$fields) json_error('Nothing to update.');

$sql = 'UPDATE users SET ' . implode(', ', $fields) . ' WHERE user_id = :id';
$pdo->prepare($sql)->execute($params);

$stmt = $pdo->prepare('SELECT * FROM users WHERE user_id = :id');
$stmt->execute(['id' => $user['user_id']]);

json_out(['user' => public_user($stmt->fetch())]);