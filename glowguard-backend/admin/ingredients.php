<?php
require_once __DIR__ . '/../config/bootstrap.php';

$pdo = get_db();
$user = require_auth($pdo); // any logged-in user may READ the shared list
if ($_SERVER['REQUEST_METHOD'] !== 'GET') assert_admin($user); // only admins may change it

function ingredient_names(PDO $pdo): array
{
    $rows = $pdo->query('SELECT ingredient_name FROM active_ingredients ORDER BY ingredient_name')->fetchAll();
    return array_column($rows, 'ingredient_name');
}

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET':
        json_out(ingredient_names($pdo));
        break;

    case 'POST': {
        $data = body();
        $name = trim($data['name'] ?? '');
        if ($name === '') json_error('Ingredient name is required.');

        // active_ingredients has no UNIQUE key on the name, so check first.
        $exists = $pdo->prepare('SELECT ingredient_id FROM active_ingredients WHERE ingredient_name = :name LIMIT 1');
        $exists->execute(['name' => $name]);
        if (!$exists->fetch()) {
            $pdo->prepare('INSERT INTO active_ingredients (ingredient_name) VALUES (:name)')
                ->execute(['name' => $name]);
        }

        json_out(ingredient_names($pdo), 201);
        break;
    }

    case 'DELETE': {
        $name = $_GET['name'] ?? '';
        if ($name === '') json_error('Ingredient name is required.');

        // Linked product_ingredients and clash rules are removed automatically
        // (ON DELETE CASCADE).
        $pdo->prepare('DELETE FROM active_ingredients WHERE ingredient_name = :name')
            ->execute(['name' => $name]);
        json_out(['ok' => true]);
        break;
    }

    default:
        json_error('Method not allowed.', 405);
}
