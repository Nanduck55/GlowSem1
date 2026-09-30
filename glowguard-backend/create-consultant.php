<?php
/**
 * Creates (or promotes) a GlowGuard Beauty Consultant account.
 * Run it ONCE per consultant, from a terminal — it refuses to run from a
 * browser. Each consultant should get their own email/password; this
 * script does not reuse or share credentials with the Admin account.
 *
 *   Windows (XAMPP):
 *     C:\xampp\php\php.exe create-consultant.php consultant@glowguard.com "Jane Doe" "YourPassword"
 *   Mac (XAMPP):
 *     /Applications/XAMPP/xamppfiles/bin/php create-consultant.php consultant@glowguard.com "Jane Doe" "YourPassword"
 *
 * Arguments (all optional; you'll be prompted for the password if omitted):
 *   1. email     default: consultant@glowguard.com
 *   2. name      default: Beauty Consultant
 *   3. password  min 6 characters
 *
 * If a user with that email already exists, it is promoted to an active
 * consultant (and its password is reset if you passed one).
 */
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/config/db.php';

$email = strtolower(trim($argv[1] ?? 'consultant@glowguard.com'));
$name = trim($argv[2] ?? 'Beauty Consultant');
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
    $find = $pdo->prepare('SELECT user_id FROM users WHERE email = :email');
    $find->execute(['email' => $email]);
    $existing = $find->fetch();

    if ($existing) {
        $pdo->prepare(
            "UPDATE users SET role = 'consultant', status = 'active', password_hash = :hash WHERE user_id = :id"
        )->execute(['hash' => $hash, 'id' => $existing['user_id']]);
        echo "Existing account $email is now a Beauty Consultant (password updated).\n";
    } else {
        $pdo->prepare(
            "INSERT INTO users (full_name, email, password_hash, role, status) VALUES (:name, :email, :hash, 'consultant', 'active')"
        )->execute(['name' => $name, 'email' => $email, 'hash' => $hash]);
        echo "Beauty Consultant account created: $email\n";
    }
} catch (PDOException $e) {
    fwrite(STDERR, "Failed: " . $e->getMessage() . "\n");
    exit(1);
}
