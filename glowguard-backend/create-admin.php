<?php
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/config/db.php';

$email = strtolower(trim($argv[1] ?? 'admin@glowguard.com'));
$name = trim($argv[2] ?? 'Admin');
$password = $argv[3] ?? '';

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fwrite(STDERR, "Invalid email: $email\n");
    exit(1);
}
if ($password === '') {
    fwrite(STDOUT, "Password for $email (min 6 chars): ");
    $password = trim((string) fgets(STDIN));
}
if (strlen($password) < 6) {
    fwrite(STDERR, "Password must contain at least 6 characters.\n");
    exit(1);
}

$pdo = get_db();
$hash = password_hash($password, PASSWORD_BCRYPT);

try {
    $find = $pdo->prepare('SELECT user_id FROM users WHERE LOWER(email) = LOWER(:email)');
    $find->execute(['email' => $email]);
    $existing = $find->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        $pdo->prepare(
            "UPDATE users SET role = 'admin', status = 'active', password_hash = :hash WHERE user_id = :id"
        )->execute(['hash' => $hash, 'id' => $existing['user_id']]);
        echo "Existing account $email is now an admin.\n";
    } else {
        $pdo->prepare(
            "INSERT INTO users (full_name, email, password_hash, role, status) VALUES (:name, :email, :hash, 'admin', 'active')"
        )->execute(['name' => $name, 'email' => $email, 'hash' => $hash]);
        echo "Admin account created: $email\n";
    }
} catch (PDOException $e) {
    fwrite(STDERR, "Failed: " . $e->getMessage() . "\n");
    exit(1);
}