<?php
require_once __DIR__ . '/../config/bootstrap.php';
require_once __DIR__ . '/../lib/helpers.php';

$pdo = get_db();
$user = require_auth($pdo); // any logged-in user may READ the rules (the safety engine needs them)
if ($_SERVER['REQUEST_METHOD'] !== 'GET') assert_admin($user); // only admins may change them

const RULE_SELECT =
    'SELECT r.rule_id, a.ingredient_name AS name_a, b.ingredient_name AS name_b, r.warning_text
     FROM ingredient_clash_rules r
     JOIN active_ingredients a ON a.ingredient_id = r.ingredient_id_1
     JOIN active_ingredients b ON b.ingredient_id = r.ingredient_id_2';

function row_to_rule(array $row): array
{
    return [
        'id'      => (int) $row['rule_id'],
        'a'       => $row['name_a'],
        'b'       => $row['name_b'],
        'message' => $row['warning_text'],
    ];
}

function fetch_rule(PDO $pdo, int $id): array
{
    $stmt = $pdo->prepare(RULE_SELECT . ' WHERE r.rule_id = :id');
    $stmt->execute(['id' => $id]);
    return row_to_rule($stmt->fetch());
}

/** Validates the request body and resolves both ingredient names to ids. */
function rule_input(PDO $pdo, array $data): array
{
    $a = trim($data['a'] ?? '');
    $b = trim($data['b'] ?? '');
    $message = trim($data['message'] ?? '');
    if ($a === '' || $b === '' || $message === '') {
        json_error('Fields a, b, and message are all required.');
    }
    if ($a === $b) json_error('Ingredient A and B must be different.');

    $idA = ingredient_id_by_name($pdo, $a);
    $idB = ingredient_id_by_name($pdo, $b);
    if ($idA === null) json_error("Unknown ingredient: $a", 422);
    if ($idB === null) json_error("Unknown ingredient: $b", 422);

    return [$idA, $idB, $message];
}

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET':
        $rows = $pdo->query(RULE_SELECT . ' ORDER BY r.rule_id')->fetchAll();
        json_out(array_map('row_to_rule', $rows));
        break;

    case 'POST': {
        [$idA, $idB, $message] = rule_input($pdo, body());

        $pdo->prepare(
            'INSERT INTO ingredient_clash_rules (ingredient_id_1, ingredient_id_2, warning_text)
             VALUES (:a, :b, :message)'
        )->execute(['a' => $idA, 'b' => $idB, 'message' => $message]);

        json_out(fetch_rule($pdo, (int) $pdo->lastInsertId()), 201);
        break;
    }

    case 'PUT': {
        $data = body();
        $id = (int) ($data['id'] ?? 0);
        if (!$id) json_error('Clash rule id is required.');

        [$idA, $idB, $message] = rule_input($pdo, $data);

        $exists = $pdo->prepare('SELECT rule_id FROM ingredient_clash_rules WHERE rule_id = :id');
        $exists->execute(['id' => $id]);
        if (!$exists->fetch()) json_error('Clash rule not found.', 404);

        $pdo->prepare(
            'UPDATE ingredient_clash_rules
             SET ingredient_id_1 = :a, ingredient_id_2 = :b, warning_text = :message
             WHERE rule_id = :id'
        )->execute(['a' => $idA, 'b' => $idB, 'message' => $message, 'id' => $id]);

        json_out(fetch_rule($pdo, $id));
        break;
    }

    case 'DELETE': {
        $id = (int) ($_GET['id'] ?? 0);
        if (!$id) json_error('Clash rule id is required.');

        $pdo->prepare('DELETE FROM ingredient_clash_rules WHERE rule_id = :id')->execute(['id' => $id]);
        json_out(['ok' => true]);
        break;
    }

    default:
        json_error('Method not allowed.', 405);
}
