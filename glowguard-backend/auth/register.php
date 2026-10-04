<?php
require_once __DIR__ . '/../config/bootstrap.php';
require_method('POST');

$pdo = get_db();
$data = body();

$name = trim($data['name'] ?? '');
$email = strtolower(trim($data['email'] ?? ''));
$password = (string) ($data['password'] ?? '');
$skinType = trim($data['skin_type'] ?? '') ?: null; // 1. Read skin_type

if ($name === '' || $email === '' || $password === '') {
    json_error('Name, email, and password are required.', 400);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_error('Please enter a valid email address.', 422);
}
if (strlen($password) < 6) {
    json_error('Password must contain at least 6 characters.', 422);
}

$check = $pdo->prepare('SELECT user_id FROM users WHERE LOWER(email) = LOWER(:email)');
$check->execute(['email' => $email]);
if ($check->fetch()) {
    json_error('An account with that email already exists.', 409);
}

$hash = password_hash($password, PASSWORD_BCRYPT);

try {
    $pdo->beginTransaction();

    // 2. Insert user with skin_type
    $insert = $pdo->prepare(
        "INSERT INTO users (full_name, email, password_hash, role, status, skin_type)
         VALUES (:name, :email, :hash, 'user', 'active', :skin_type)"
    );
    $insert->execute([
        'name' => $name,
        'email' => $email,
        'hash' => $hash,
        'skin_type' => $skinType
    ]);
    
    $userId = (int) $pdo->lastInsertId();

    $stmt = $pdo->prepare('SELECT user_id, full_name, email, role, status, skin_type, routine_goal, date_joined FROM users WHERE user_id = :id');
    $stmt->execute(['id' => $userId]);
    $userRow = $stmt->fetch(PDO::FETCH_ASSOC);

    $token = issue_token($pdo, $userId);

    $pdo->commit();
    json_out(['token' => $token, 'user' => public_user(normalize_user($userRow))], 201);
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    json_error('Registration failed. Please try again.', 500);
}