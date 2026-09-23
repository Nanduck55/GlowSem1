<?php
require_once __DIR__ . '/../config/bootstrap.php';

$pdo = get_db();
$admin = require_admin($pdo);

function row_to_admin_user(array $row): array
{
    return [
        'id'        => (int) $row['user_id'], 
        'name'      => $row['full_name'],     
        'username'  => $row['full_name'], 
        'email'     => $row['email'],
        'role'      => $row['role'] ?? 'user',
        'status'    => $row['status'] ?? 'active',
        'skinType'  => $row['skin_type'] ?? null,
        'skinGoal'  => $row['routine_goal'] ?? null, 
        'joined'    => $row['date_joined'] ?? null,   
        'createdAt' => $row['date_joined'] ?? null,
    ];
}

function find_user(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM users WHERE user_id = :id');
    $stmt->execute(['id' => $id]);
    $row = $stmt->fetch();
    return $row ?: null;
}

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET':
        if (isset($_GET['user_id'])) {
            $row = find_user($pdo, (int) $_GET['user_id']);
            if (!$row) json_error('User not found.', 404);
            json_out(row_to_admin_user($row));
        }
        // Ordered by date_joined to avoid missing column errors
        $rows = $pdo->query('SELECT * FROM users ORDER BY date_joined DESC, user_id DESC')->fetchAll();
        json_out(array_map('row_to_admin_user', $rows));
        break;

    case 'PUT': {
        $data = body();
        $id = (int) ($data['user_id'] ?? $data['id'] ?? 0);
        $status = (string) ($data['status'] ?? '');

        if (!$id) json_error('User id is required.');
        if (!in_array($status, ['active', 'deactivated'], true)) {
            json_error("Status must be 'active' or 'deactivated'.");
        }
        if ($id === (int) $admin['user_id'] && $status === 'deactivated') {
            json_error('You cannot deactivate your own account.', 409);
        }
        if (!find_user($pdo, $id)) json_error('User not found.', 404);

        $pdo->prepare('UPDATE users SET status = :status WHERE user_id = :id')
            ->execute(['status' => $status, 'id' => $id]);

        if ($status === 'deactivated') {
            $pdo->prepare('DELETE FROM auth_tokens WHERE user_id = :id')->execute(['id' => $id]);
        }

        json_out(row_to_admin_user(find_user($pdo, $id)));
        break;
    }

    default:
        json_error('Method not allowed.', 405);
}