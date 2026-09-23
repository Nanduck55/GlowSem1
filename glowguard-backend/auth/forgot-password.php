<?php
require_once __DIR__ . '/../config/bootstrap.php';
require_method('POST');

$pdo = get_db();
$data = body();
$email = strtolower(trim($data['email'] ?? ''));

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_error('Please enter a valid email address.');
}

// Check if user exists
$stmt = $pdo->prepare('SELECT user_id FROM users WHERE email = :email');
$stmt->execute(['email' => $email]);

if ($stmt->fetch()) {
    $token = bin2hex(random_bytes(32));
    
    $pdo->prepare('DELETE FROM password_resets WHERE email = :email')
        ->execute(['email' => $email]);
    
    $insert = $pdo->prepare('INSERT INTO password_resets (email, token) VALUES (:email, :token)');
    $insert->execute(['email' => $email, 'token' => $token]);
}

json_out(['message' => 'If an account exists, a password reset link has been generated.']);