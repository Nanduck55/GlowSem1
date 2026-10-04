<?php
/**
 * Opaque bearer-token auth backed by the `auth_tokens` table.
 */

const TOKEN_TTL_DAYS = 30;

function normalize_user(array $row): array
{
    return [
        'id'            => (int) $row['user_id'],
        'name'          => $row['full_name'] ?? '',
        'email'         => $row['email'] ?? '',
        'password_hash' => $row['password_hash'] ?? null,
        'role'          => strtolower(($row['role'] ?? null) ?: 'user'),
        'status'        => strtolower(($row['status'] ?? null) ?: 'active'),
        'skin_type'     => $row['skin_type'] ?? null,
        'skin_goal'     => $row['routine_goal'] ?? null,
        'created_at'    => $row['date_joined'] ?? null,
    ];
}

function issue_token(PDO $pdo, int$userId): string
{
    $token = bin2hex(random_bytes(32));

    $stmt =$pdo->prepare(
        'INSERT INTO auth_tokens (user_id, token, expires_at)
         VALUES (:user_id, :token, DATE_ADD(NOW(), INTERVAL 30 DAY))'
    );
    $stmt->execute(['user_id' => $userId, 'token' =>$token]);

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

function require_auth(PDO $pdo): array
{
    $token = bearer_token();
    if (!$token) {
        json_error('Missing Authorization header.', 401);
    }

    $stmt =$pdo->prepare(
        'SELECT u.user_id, u.full_name, u.email, u.password_hash, u.role, u.status, u.skin_type, u.routine_goal, u.date_joined 
         FROM auth_tokens t
         JOIN users u ON u.user_id = t.user_id
         WHERE t.token = :token AND t.expires_at > NOW()'
    );
    $stmt->execute(['token' =>$token]);
    $row =$stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        json_error('Invalid or expired session. Please log in again.', 401);
    }

    $user = normalize_user($row);

    if ($user['status'] === 'deactivated') {
        json_error('This account has been deactivated.', 401);
    }

    unset($user['password_hash']);
    return $user;
}

function assert_role(array $user, array$roles): void
{
    if (!in_array($user['role'] ?? 'user',$roles, true)) {
        json_error('You do not have access to this resource.', 403);
    }
}

function assert_admin(array $user): void
{
    if (($user['role'] ?? 'user') !== 'admin') {
        json_error('Admin access required.', 403);
    }
}

function assert_consultant(array $user): void
{
    if (($user['role'] ?? 'user') !== 'consultant') {
        json_error('Beauty Consultant access required.', 403);
    }
}

function require_admin(PDO $pdo): array
{
    $user = require_auth($pdo);
    assert_admin($user);
    return $user;
}

function require_consultant(PDO $pdo): array
{
    $user = require_auth($pdo);
    assert_consultant($user);
    return $user;
}

function public_user(array $user): array
{
    return [
        'id'        => (int) $user['id'],
        'name'      => $user['name'],
        'email'     => $user['email'],
        'skinType'  => $user['skin_type'],
        'skinGoal'  => $user['skin_goal'],
        'role'      => $user['role'],
        'status'    => $user['status'],
        'createdAt' => $user['created_at'],
    ];
}