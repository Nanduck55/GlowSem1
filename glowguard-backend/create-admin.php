<?php
/**
 * Creates (or promotes) the GlowGuard admin account.
 * Run it ONCE from a terminal — it refuses to run from a browser.
 *
 *   Windows (XAMPP):
 *     C:\xampp\php\php.exe create-admin.php admin@glowguard.com "Admin" "YourPassword"
 *   Mac (XAMPP):
 *     /Applications/XAMPP/xamppfiles/bin/php create-admin.php admin@glowguard.com "Admin" "YourPassword"
 *
 * Arguments (all optional; you'll be prompted for the password if omitted):
 *   1. email     default: admin@glowguard.com
 *   2. name      default: Admin
 *   3. password  min 6 characters
 *
 * If a user with that email already exists, it is promoted to an active
 * admin (and its password is reset if you passed one).
 */
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
$hash = password_hash($password, PASSWORD_DEFAULT);

try {
    // Changed 'id' to 'user_id'
    $find = $pdo->prepare('SELECT user_id FROM users WHERE email = :email');
    $find->execute(['email' => $email]);
    $existing = $find->fetch();

    if ($existing) {
        // Changed 'id' to 'user_id'
        $pdo->prepare(
            "UPDATE users SET role = 'admin', status = 'active', password_hash = :hash WHERE user_id = :user_id"
        )->execute(['hash' => $hash, 'user_id' => $existing['user_id']]);
        echo "Existing account $email is now an admin (password updated).\n";
    } else {
        // Changed 'name' to 'full_name'
        $pdo->prepare(
            "INSERT INTO users (full_name, email, password_hash, role, status) VALUES (:name, :email, :hash, 'admin', 'active')"
        )->execute(['name' => $name, 'email' => $email, 'hash' => $hash]);
        echo "Admin account created: $email\n";
    }
} catch (PDOException $e) {
    fwrite(STDERR, "Failed: " . $e->getMessage() . "\n");
    exit(1);
}