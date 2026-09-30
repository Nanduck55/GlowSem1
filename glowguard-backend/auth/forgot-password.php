<?php
require_once __DIR__ . '/../config/bootstrap.php';
require_once __DIR__ . '/../lib/password_reset.php';
require_method('POST');

try {
    $pdo = get_db();
    $data = body();
    $email = strtolower(trim($data['email'] ?? ''));

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_error('Please enter a valid email address.');
    }

    $response = ['message' => 'If an account exists, a password reset link has been sent.'];

    $stmt = $pdo->prepare('SELECT user_id, status FROM users WHERE email = :email');
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();

    $isDeactivated = $user && strtolower($user['status'] ?? '') === 'deactivated';

    if ($user && !$isDeactivated) {
        $rawToken = bin2hex(random_bytes(32));
        $ttlMinutes = (int) RESET_TTL_MINUTES;

        // Clean up previous tokens for this email or expired ones
        $pdo->prepare('DELETE FROM password_resets WHERE email = :email OR expires_at < NOW()')
            ->execute(['email' => $email]);

        // Insert new reset token
        $insert = $pdo->prepare(
            "INSERT INTO password_resets (email, reset_token, expires_at)
             VALUES (:email, :hash, DATE_ADD(NOW(), INTERVAL {$ttlMinutes} MINUTE))"
        );
        $insert->execute([
            'email' => $email, 
            'hash'  => hash_reset_token($rawToken)
        ]);

        $link = frontend_url() . '/reset-password?token=' . $rawToken;
        $sent = send_reset_email($email, $link);

        if (reset_dev_mode()) {
            error_log("[GlowGuard] Password reset link for {$email}: {$link}");
            $response['devResetLink'] = $link;
            $response['emailSent'] = $sent;
        }
    }

    json_out($response);

} catch (Throwable $e) {
    json_error('Server error: ' . $e->getMessage(), 500);
}