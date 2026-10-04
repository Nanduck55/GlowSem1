<?php
/**
 * Admin user management endpoint.
 * GET /admin/users.php -> List all users
 * GET /admin/users.php?id=X -> Single user
 * PUT /admin/users.php -> Body { id, status: 'active'|'deactivated' }
 */
require_once __DIR__ . '/../config/bootstrap.php';

$pdo = get_db();
$admin = require_admin($pdo);

function find_user(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare('SELECT user_id, email, role, status, date_joined FROM users WHERE user_id = :id');
    $stmt->execute(['id' => $id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? normalize_user($row) : null;
}

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET':
        if (isset($_GET['id'])) {
            $user = find_user($pdo, (int) $_GET['id']);
            if (!$user) json_error('User not found.', 404);
            json_out(public_user($user));
        }
        
        $stmt = $pdo->query('SELECT user_id, email, role, status, date_joined FROM users ORDER BY date_joined DESC, user_id DESC');
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        json_out(array_map(fn($row) => public_user(normalize_user($row)), $rows));
        break;

    case 'PUT':
        $data = body();
        $id = (int) ($data['id'] ?? 0);
        $status = strtolower(trim((string) ($data['status'] ?? '')));

        if (!$id) json_error('User ID is required.', 400);
        if (!in_array($status, ['active', 'deactivated'], true)) {
            json_error("Status must be 'active' or 'deactivated'.", 422);
        }
        if ($id === (int) $admin['id'] && $status === 'deactivated') {
            json_error('You cannot deactivate your own account.', 409);
        }

        $existing = find_user($pdo, $id);
        if (!$existing) json_error('User not found.', 404);

        try {
            $pdo->beginTransaction();

            $stmt = $pdo->prepare('UPDATE users SET status = :status WHERE user_id = :id');
            $stmt->execute(['status' => $status, 'id' => $id]);

            if ($status === 'deactivated') {
                $stmtAuth = $pdo->prepare('DELETE FROM auth_tokens WHERE user_id = :id');
                $stmtAuth->execute(['id' => $id]);
            }

            $pdo->commit();
            json_out(public_user(find_user($pdo, $id)));
        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            json_error('Failed to update user status.', 500);
        }
        break;

    default:
        json_error('Method not allowed.', 405);
}