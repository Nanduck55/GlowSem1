<?php
/**
 * Shared helpers for the password-reset flow (table: password_resets).
 *
 * How it works:
 *   1. forgot-password.php creates a random token, stores only its SHA-256
 *      hash in password_resets.reset_token, and sends the RAW token to the
 *      user inside a link. A leaked database therefore can't be used to reset
 *      anyone's password.
 *   2. verify-reset-token.php / reset-password.php hash the token from the
 *      link and look that hash up.
 *
 * Settings (all optional environment variables):
 *   FRONTEND_URL   where the React app runs   (default http://localhost:5173)
 *   APP_ENV        set to "production" to turn dev mode off
 *   MAIL_FROM      "From" address for reset emails
 */

const RESET_TTL_MINUTES = 60;

function frontend_url(): string
{
    return rtrim(getenv('FRONTEND_URL') ?: 'http://localhost:5173', '/');
}

/**
 * Dev mode (default on for local XAMPP): the reset link is ALSO returned in the
 * API response and written to the PHP error log, because XAMPP can't send email
 * out of the box. Set APP_ENV=production to switch this off.
 */
function reset_dev_mode(): bool
{
    return strtolower((string) getenv('APP_ENV')) !== 'production';
}

function hash_reset_token(string $rawToken): string
{
    return hash('sha256', $rawToken);
}

/** Raw tokens are 64 hex characters (32 random bytes). */
function looks_like_reset_token(string $token): bool
{
    return (bool) preg_match('/^[a-f0-9]{64}$/', $token);
}

/**
 * Returns the matching, unexpired reset row joined with its user
 * (reset_id, email, user_id, status), or null if the token is unknown/expired.
 * Expiry is compared by MySQL itself so it uses the same clock as NOW().
 */
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

/** jane.doe@gmail.com -> j*******@gmail.com */
function mask_email(string $email): string
{
    $parts = explode('@', $email, 2);
    if (count($parts) !== 2) return $email;

    [$local, $domain] = $parts;
    $visible = mb_substr($local, 0, 1);

    return $visible . str_repeat('*', max(mb_strlen($local) - 1, 2)) . '@' . $domain;
}

/** Best-effort email. Returns false on XAMPP unless sendmail/SMTP is configured. */
function send_reset_email(string $to, string $link): bool
{
    $minutes = RESET_TTL_MINUTES;
    $subject = 'Reset your GlowGuard password';
    $message = "Hi,\r\n\r\n"
        . "We received a request to reset your GlowGuard password.\r\n"
        . "Use the link below to choose a new one (it expires in {$minutes} minutes):\r\n\r\n"
        . "{$link}\r\n\r\n"
        . "If you didn't ask for this, you can safely ignore this email.\r\n\r\n"
        . "— GlowGuard";

    $from = getenv('MAIL_FROM') ?: 'no-reply@glowguard.local';
    $headers = "From: GlowGuard <{$from}>\r\nContent-Type: text/plain; charset=utf-8";

    return @mail($to, $subject, $message, $headers);
}
