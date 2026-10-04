<?php
/**
 * Shared helpers for the password-reset flow (table: password_resets).
 */

require_once __DIR__ . '/../config/mailer.php';

const RESET_TTL_MINUTES = 60;

function frontend_url(): string
{
    return rtrim(getenv('FRONTEND_URL') ?: 'http://localhost:5173', '/');
}

function reset_dev_mode(): bool
{
    return strtolower((string) getenv('APP_ENV')) !== 'production';
}

function hash_reset_token(string $rawToken): string
{
    return hash('sha256', $rawToken);
}

function looks_like_reset_token(string $token): bool
{
    return (bool) preg_match('/^[a-f0-9]{64}$/', $token);
}

function find_valid_reset(PDO $pdo, string $rawToken): ?array
{
    if (!looks_like_reset_token($rawToken)) {
        return null;
    }

    $stmt = $pdo->prepare(
        'SELECT r.reset_id, r.email, u.user_id, u.status
           FROM password_resets r
           JOIN users u ON u.email = r.email
          WHERE r.reset_token = :hash
            AND r.expires_at > NOW()
          LIMIT 1'
    );
    $stmt->execute(['hash' => hash_reset_token($rawToken)]);
    $row = $stmt->fetch();

    return $row ?: null;
}

function mask_email(string $email): string
{
    $parts = explode('@', $email, 2);
    if (count($parts) !== 2) return $email;

    [$local, $domain] = $parts;
    $visible = mb_substr($local, 0, 1);

    return $visible . str_repeat('*', max(mb_strlen($local) - 1, 2)) . '@' . $domain;
}

/** sends password reset email using PHPMailer */
function send_reset_email(string $to, string $link): bool
{
    $minutes = RESET_TTL_MINUTES;
    $subject = 'Reset your GlowGuard password';
    
    $htmlBody = "
        <div style='font-family: Arial, sans-serif; padding: 20px; color: #333;'>
            <h2 style='color: #10B981;'>GlowGuard Password Reset</h2>
            <p>We received a request to reset your GlowGuard account password.</p>
            <p>Click the button below to choose a new password (link expires in <strong>{$minutes} minutes</strong>):</p>
            <p style='margin: 25px 0;'>
                <a href='{$link}' style='background-color: #10B981; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;'>Reset Password</a>
            </p>
            <p style='color: #666; font-size: 12px;'>If you didn't ask for this, you can safely ignore this email.</p>
        </div>
    ";

    return sendEmail($to, $subject, $htmlBody);
}