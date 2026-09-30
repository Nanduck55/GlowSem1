<?php
/**
 * Admin user management.
 *   GET  /admin/users.php          -> list of all users (newest first)
 *   GET  /admin/users.php?id=5     -> one user
 *   PUT  /admin/users.php          -> body {id, status: 'active'|'deactivated'}
 * Admins only.
 */
require_once __DIR__ . '/../config/bootstrap.php';

$pdo = get_db();
$admin = require_admin($pdo);

function find_user(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM users WHERE user_id = :id');
    $stmt->execute(['id' => $id]);
    $row = $stmt->fetch();
    return $row ? normalize_user($row) : null;
}

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET':
        if (isset($_GET['id'])) {
            $user = find_user($pdo, (int) $_GET['id']);
            if (!$user) json_error('User not found.', 404);
            json_out(public_user($user));
        }
        $rows = $pdo->query('SELECT * FROM users ORDER BY date_joined DESC, user_id DESC')->fetchAll();
        json_out(array_map(fn($row) => public_user(normalize_user($row)), $rows));
        break;

    case 'PUT': {
        $data = body();
        $id = (int) ($data['id'] ?? 0);
        $status = (string) ($data['status'] ?? '');

        if (!$id) json_error('User id is required.');
        if (!in_array($status, ['active', 'deactivated'], true)) {
            json_error("Status must be 'active' or 'deactivated'.");
        }
        if ($id === (int) $admin['id'] && $status === 'deactivated') {
            json_error('You cannot deactivate your own account.', 409);
        }
        if (!find_user($pdo, $id)) json_error('User not found.', 404);

        $pdo->prepare('UPDATE users SET status = :status WHERE user_id = :id')
            ->execute(['status' => $status, 'id' => $id]);

        // Kick the person out immediately by revoking their sessions.
        if ($status === 'deactivated') {
            $pdo->prepare('DELETE FROM auth_tokens WHERE user_id = :id')->execute(['id' => $id]);
        }

        json_out(public_user(find_user($pdo, $id)));
        break;
    }

    default:
        json_error('Method not allowed.', 405);
}
