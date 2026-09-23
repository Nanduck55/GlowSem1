<?php
/**
 * Simple opaque bearer-token auth backed by the `auth_tokens` table.
 */

const TOKEN_TTL_DAYS = 30;

function issue_token(PDO $pdo, int$userId): string
{
    $token = bin2hex(random_bytes(32));$expiresAt = (new DateTime())->modify('+' . TOKEN_TTL_DAYS . ' days')->format('Y-m-d H:i:s');

    $stmt =$pdo->prepare(
        'INSERT INTO auth_tokens (user_id, token, expires_at) VALUES (:user_id, :token, :expires_at)'
    );
    $stmt->execute(['user_id' =>$userId, 'token' => $token, 'expires_at' =>$expiresAt]);

    return $token;
}

function bearer_token(): ?string
{
    $header =$_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? null;

    if (!$header && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();$header = $headers['Authorization'] ?? $headers['authorization'] ?? null;
    }

    if (!$header || !preg_match('/Bearer\s+(.+)/i', $header,$m)) {
        return null;
    }

    return trim($m[1]);
}

/**
 * Validates the Authorization: Bearer <token> header and returns the
 * matching user row, or sends a 401 JSON response and exits.
 */
function require_auth(PDO $pdo): array
{
    $token = bearer_token();
    if (!$token) {
        json_error('Missing Authorization header.', 401);
    }

    $stmt =$pdo->prepare(
        'SELECT u.* FROM auth_tokens t
         JOIN users u ON u.user_id = t.user_id
         WHERE t.token = :token AND t.expires_at > NOW()'
    );
    $stmt->execute(['token' =>$token]);
    $user =$stmt->fetch();

    if (!$user) {
        json_error('Invalid or expired session. Please log in again.', 401);
    }

    if (($user['status'] ?? 'active') === 'deactivated') {
        json_error('This account has been deactivated.', 401);
    }

    unset($user['password_hash']);
    return $user;
}

function assert_admin(array $user): void
{
    if (($user['role'] ?? 'user') !== 'admin') {
        json_error('Admin access required.', 403);
    }
}

function require_admin(PDO $pdo): array
{
    $user = require_auth($pdo);
    assert_admin($user);
    return $user;
}

function public_user(array $userRow): array
{
    return [
        'id'        => (int) ($userRow['user_id'] ?? 0),         
        'name'      =>$userRow['full_name'] ?? null,
        'email'     => $userRow['email'] ?? null,
        'skinType'  => $userRow['skin_type'] ?? null,
        'skinGoal'  => $userRow['routine_goal'], 
        'role'      => $userRow['role'] ?? 'user',
        'status'    => $userRow['status'] ?? 'active',
        'createdAt' => $userRow['date_joined'] ?? null,
    ];
}