<?php
require_once __DIR__ . '/../config/bootstrap.php';

$pdo = get_db();
$user = require_auth($pdo); // any logged-in user may READ the shared list
if ($_SERVER['REQUEST_METHOD'] !== 'GET') assert_admin($user); // only admins may change it

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET':
        $rows = $pdo->query('SELECT ingredient_name FROM active_ingredients ORDER BY ingredient_name')->fetchAll();
        json_out(array_column($rows, 'ingredient_name'));
        break;

    case 'POST': {
        $data = body();
        $name = trim($data['name'] ?? '');
        if ($name === '') json_error('Ingredient name is required.');

        $stmt = $pdo->prepare('INSERT IGNORE INTO active_ingredients (ingredient_name) VALUES (:name)');
        $stmt->execute(['name' => $name]);

        $rows = $pdo->query('SELECT ingredient_name FROM active_ingredients ORDER BY ingredient_name')->fetchAll();
        json_out(array_column($rows, 'ingredient_name'), 201);
        break;
    }

    case 'DELETE': {
        $name = $_GET['name'] ?? '';
        if ($name === '') json_error('Ingredient name is required.');

        $stmt = $pdo->prepare('DELETE FROM active_ingredients WHERE ingredient_name = :name');
        $stmt->execute(['name' => $name]);
        json_out(['ok' => true]);
        break;
    }

    default:
        json_error('Method not allowed.', 405);
}