<?php
require_once __DIR__ . '/../config/bootstrap.php';
require_method('PUT');

$pdo = get_db();
$user = require_auth($pdo);
$data = body();

$fields = [];
$params = ['id' => $user['id']];

if (array_key_exists('name', $data)) {
    $name = trim((string) $data['name']);
    if ($name === '') json_error('Name cannot be empty.', 400);
    $fields[] = 'full_name = :name';
    $params['name'] = $name;
}

if (array_key_exists('email', $data)) {
    $email = strtolower(trim((string) $data['email']));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) json_error('Please enter a valid email address.', 422);

    $check = $pdo->prepare('SELECT user_id FROM users WHERE LOWER(email) = LOWER(:email) AND user_id != :id');
    $check->execute(['email' => $email, 'id' => $user['id']]);
    if ($check->fetch()) json_error('That email is already in use.', 409);

    $fields[] = 'email = :email';
    $params['email'] = $email;
}

if (array_key_exists('skinType', $data)) {
    $fields[] = 'skin_type = :skin_type';
    $params['skin_type'] = $data['skinType'] !== null ? trim((string) $data['skinType']) : null;
}
if (array_key_exists('skinGoal', $data)) {
    $fields[] = 'routine_goal = :routine_goal';
    $params['routine_goal'] = $data['skinGoal'] !== null ? trim((string) $data['skinGoal']) : null;
}

if (empty($fields)) {
    json_error('Nothing to update.', 400);
}

$sql = 'UPDATE users SET ' . implode(', ', $fields) . ' WHERE user_id = :id';

try {
    $pdo->prepare($sql)->execute($params);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        json_error('That email cannot be changed right now due to linked account records.', 409);
    }
    json_error('Failed to update profile.', 500);
}

$stmt = $pdo->prepare('SELECT user_id, full_name, email, role, status, skin_type, routine_goal, date_joined FROM users WHERE user_id = :id');
$stmt->execute(['id' => $user['id']]);

json_out(['user' => public_user(normalize_user($stmt->fetch(PDO::FETCH_ASSOC)))]);