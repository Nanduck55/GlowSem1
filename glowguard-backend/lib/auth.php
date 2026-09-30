<?php
/**
 * Simple opaque bearer-token auth backed by the `auth_tokens` table.
 * Not JWT — just a random, unguessable string mapped to a user row in
 * MySQL. Good enough for a XAMPP/local-network deployment.
 *
 * Adapted to the glowguard_db schema:
 *   users(user_id, full_name, email, password_hash, role, skin_type,
 *         routine_goal, status, date_joined)
 *   auth_tokens(token_id, user_id, token, created_at, expires_at)
 */

const TOKEN_TTL_DAYS = 30;

/**
 * Turns a raw `users` row into the shape the rest of the API uses
 * (id / name / skin_goal / created_at ...). NULL role/status columns are
 * treated as 'user' / 'active'.
 */
function normalize_user(array $row): array
{
    return [
        'id'            => (int) $row['user_id'],
        'name'          => $row['full_name'],
        'email'         => $row['email'],
        'password_hash' => $row['password_hash'] ?? null,
        'role'          => strtolower(($row['role'] ?? null) ?: 'user'),
        'status'        => strtolower(($row['status'] ?? null) ?: 'active'),
        'skin_type'     => $row['skin_type'] ?? null,
        'skin_goal'     => $row['routine_goal'] ?? null,
        'created_at'    => $row['date_joined'] ?? null,
    ];
}

function issue_token(PDO $pdo, int $userId): string
{
    $token = bin2hex(random_bytes(32));

    // Expiry is computed by MySQL itself (NOW() + 30 days) so it always uses
    // the same clock/time zone as the `expires_at > NOW()` check below.
    $stmt = $pdo->prepare(
        'INSERT INTO auth_tokens (user_id, token, expires_at)
         VALUES (:user_id, :token, DATE_ADD(NOW(), INTERVAL ' . (int) TOKEN_TTL_DAYS . ' DAY))'
    );
    $stmt->execute(['user_id' => $userId, 'token' => $token]);

    return $token;
}

function bearer_token(): ?string
{
    $header = $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? null;

    if (!$header && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $header = $headers['Authorization'] ?? $headers['authorization'] ?? null;
    }

    if (!$header || !preg_match('/Bearer\s+(.+)/i', $header, $m)) {
        return null;
    }

    return trim($m[1]);
}

/**
 * Validates the Authorization: Bearer <token> header and returns the
 * matching (normalized) user, or sends a 401 JSON response and exits.
 */
function require_auth(PDO $pdo): array
{
    $token = bearer_token();
    if (!$token) {
        json_error('Missing Authorization header.', 401);
    }

    $stmt = $pdo->prepare(
        'SELECT u.* FROM auth_tokens t
         JOIN users u ON u.user_id = t.user_id
         WHERE t.token = :token AND t.expires_at > NOW()'
    );
    $stmt->execute(['token' => $token]);
    $row = $stmt->fetch();

    if (!$row) {
        json_error('Invalid or expired session. Please log in again.', 401);
    }

    $user = normalize_user($row);

    // A deactivated account is treated like an expired session (401), so the
    // frontend logs the person out on their next request.
    if ($user['status'] === 'deactivated') {
        json_error('This account has been deactivated.', 401);
    }

    unset($user['password_hash']);
    return $user;
}

/** Sends a 403 unless the already-authenticated user's role is in $roles. */
function assert_role(array $user, array $roles): void
{
    if (!in_array($user['role'] ?? 'user', $roles, true)) {
        json_error('You do not have access to this resource.', 403);
    }
}

/** Sends a 403 unless the already-authenticated user is an admin. */
function assert_admin(array $user): void
{
    if (($user['role'] ?? 'user') !== 'admin') {
        json_error('Admin access required.', 403);
    }
}

/** Sends a 403 unless the already-authenticated user is a beauty consultant. */
function assert_consultant(array $user): void
{
    if (($user['role'] ?? 'user') !== 'consultant') {
        json_error('Beauty Consultant access required.', 403);
    }
}

/** require_auth() + admin check in one call. Returns the admin's user. */
function require_admin(PDO $pdo): array
{
    $user = require_auth($pdo);
    assert_admin($user);
    return $user;
}

/** require_auth() + beauty-consultant check in one call. Returns the consultant's user. */
function require_consultant(PDO $pdo): array
{
    $user = require_auth($pdo);
    assert_consultant($user);
    return $user;
}

/** The user shape sent to the frontend (input: a normalized user). */
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
