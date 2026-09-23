<?php
require_once __DIR__ . '/../config/bootstrap.php';

$pdo = get_db();
$user = require_auth($pdo);

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    assert_admin($user);
}

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET':
        $stmt = $pdo->query('
            SELECT 
                c.rule_id AS id,
                i1.ingredient_name AS a,
                i2.ingredient_name AS b,
                c.warning_text AS message,
                c.severity_level AS severity
            FROM ingredient_clash_rules c
            JOIN active_ingredients i1 ON c.ingredient_id_1 = i1.ingredient_id
            JOIN active_ingredients i2 ON c.ingredient_id_2 = i2.ingredient_id
            ORDER BY c.rule_id DESC
        ');
        json_out($stmt->fetchAll());
        break;

    case 'POST': {
        $data = body();
        
        $ingA_name = trim((string) ($data['a'] ?? ''));
        $ingB_name = trim((string) ($data['b'] ?? ''));
        $message   = trim((string) ($data['message'] ?? ''));
        $severity  = trim((string) ($data['severity'] ?? 'Medium'));

        if ($ingA_name === '' || $ingB_name === '') {
            json_error('Both active ingredients are required.');
        }

        // Helper function to resolve or insert into active_ingredients
        $getIngredientId = function($name) use ($pdo) {
            $stmt = $pdo->prepare('SELECT ingredient_id FROM active_ingredients WHERE ingredient_name = :name');
            $stmt->execute(['name' => $name]);
            $row = $stmt->fetch();
            
            if ($row) {
                return (int) $row['ingredient_id'];
            }

            $ins = $pdo->prepare('INSERT INTO active_ingredients (ingredient_name) VALUES (:name)');
            $ins->execute(['name' => $name]);
            return (int) $pdo->lastInsertId();
        };

        $idA = $getIngredientId($ingA_name);
        $idB = $getIngredientId($ingB_name);

        $stmt = $pdo->prepare('
            INSERT INTO ingredient_clash_rules (ingredient_id_1, ingredient_id_2, warning_text, severity_level) 
            VALUES (:id1, :id2, :warning, :severity)
        ');
        $stmt->execute([
            'id1'      => $idA,
            'id2'      => $idB,
            'warning'  => $message,
            'severity' => $severity
        ]);

        json_out(['ok' => true, 'id' => $pdo->lastInsertId()], 201);
        break;
    }

    case 'DELETE': {
        $id = $_GET['id'] ?? null;
        if (!$id) json_error('Rule ID is required.');

        $stmt = $pdo->prepare('DELETE FROM ingredient_clash_rules WHERE rule_id = :id');
        $stmt->execute(['id' => $id]);
        json_out(['ok' => true]);
        break;
    }

    default:
        json_error('Method not allowed.', 405);
}