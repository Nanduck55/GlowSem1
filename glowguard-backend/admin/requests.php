<?php
/**
 * Admin staff sign-up requests endpoint (consultant / admin accounts).
 * GET /admin/requests.php -> Pending and rejected requests, oldest first
 * PUT /admin/requests.php -> Body { id, action: 'approve'|'reject' }
 *
 * Requests are rows in `users` with status 'pending' or 'rejected'. They are
 * not listed in User Management (admin/users.php). Approving makes the
 * account 'active', so it then appears in User Management.
 */
require_once __DIR__ . '/../config/bootstrap.php';

$pdo = get_db();
$admin = require_admin($pdo);

function find_staff_account(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare(
        "SELECT user_id, full_name, email, role, status, date_joined
         FROM users
         WHERE user_id = :id AND role IN ('consultant', 'admin')"
    );
    $stmt->execute(['id' => $id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? normalize_user($row) : null;
}

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET':
        $stmt = $pdo->query(
            "SELECT user_id, full_name, email, role, status, date_joined
             FROM users
             WHERE status IN ('pending', 'rejected') AND role IN ('consultant', 'admin')
             ORDER BY date_joined ASC, user_id ASC"
        );
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        json_out(array_map(fn($row) => public_user(normalize_user($row)), $rows));
        break;

    case 'PUT':
        $data = body();
        $id = (int) ($data['id'] ?? 0);
        $action = strtolower(trim((string) ($data['action'] ?? '')));

        if (!$id) json_error('Request ID is required.', 400);
        if (!in_array($action, ['approve', 'reject'], true)) {
            json_error("Action must be 'approve' or 'reject'.", 422);
        }

        $existing = find_staff_account($pdo, $id);
        if (!$existing) json_error('Request not found.', 404);

        // Only sign-up requests can be decided here, never normal accounts.
        $current = (string) ($existing['status'] ?? '');
        if (!in_array($current, ['pending', 'rejected'], true)) {
            json_error('This account is not a sign-up request.', 409);
        }
        if ($action === 'reject' && $current === 'rejected') {
            json_error('This request is already rejected.', 409);
        }

        $newStatus = $action === 'approve' ? 'active' : 'rejected';

        try {
            $stmt = $pdo->prepare('UPDATE users SET status = :status WHERE user_id = :id');
            $stmt->execute(['status' => $newStatus, 'id' => $id]);
            json_out(public_user(find_staff_account($pdo, $id)));
        } catch (Exception $e) {
            json_error('Failed to update the request.', 500);
        }
        break;

    default:
        json_error('Method not allowed.', 405);
}
