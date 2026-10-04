<?php
/**
 * Active Ingredients Dictionary Management.
 */
require_once __DIR__ . '/../config/bootstrap.php';

$pdo = get_db();
$user = require_auth($pdo);
if ($_SERVER['REQUEST_METHOD'] !== 'GET') assert_admin($user);

function ingredient_names(PDO $pdo): array
{
    $stmt = $pdo->query('SELECT ingredient_name FROM active_ingredients ORDER BY ingredient_name ASC');
    return $stmt->fetchAll(PDO::FETCH_COLUMN);
}

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET':
        json_out(ingredient_names($pdo));
        break;

    case 'POST':
        $data = body();
        $name = trim($data['name'] ?? '');
        if ($name === '') json_error('Ingredient name is required.', 400);

        $stmt = $pdo->prepare('SELECT ingredient_id FROM active_ingredients WHERE LOWER(ingredient_name) = LOWER(:name) LIMIT 1');
        $stmt->execute(['name' => $name]);
        
        if (!$stmt->fetch()) {
            $insert = $pdo->prepare('INSERT INTO active_ingredients (ingredient_name) VALUES (:name)');
            $insert->execute(['name' => $name]);
        }

        json_out(ingredient_names($pdo), 201);
        break;

    case 'DELETE':
        $name = trim($_GET['name'] ?? '');
        if ($name === '') json_error('Ingredient name is required.', 400);

        $stmt = $pdo->prepare('DELETE FROM active_ingredients WHERE LOWER(ingredient_name) = LOWER(:name)');
        $stmt->execute(['name' => $name]);
        
        json_out(['ok' => true]);
        break;

    default:
        json_error('Method not allowed.', 405);
}