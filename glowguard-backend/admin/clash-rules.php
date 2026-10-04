<?php
/**
 * Safety Clash Rules Management Endpoint.
 * Enforces strict foreign key relations between active ingredients.
 */
require_once __DIR__ . '/../config/bootstrap.php';
require_once __DIR__ . '/../lib/helpers.php';

$pdo = get_db();
$user = require_auth($pdo);
if ($_SERVER['REQUEST_METHOD'] !== 'GET') assert_admin($user);

const RULE_SELECT =
    'SELECT 
        r.rule_id, 
        r.ingredient_id_1,
        r.ingredient_id_2,
        a.ingredient_name AS name_a, 
        b.ingredient_name AS name_b, 
        r.warning_text,
        r.severity_level
     FROM ingredient_clash_rules r
     JOIN active_ingredients a ON a.ingredient_id = r.ingredient_id_1
     JOIN active_ingredients b ON b.ingredient_id = r.ingredient_id_2';

function row_to_rule(array $row): array
{
    return [
        'id'       => (int) $row['rule_id'],
        'a'        => $row['name_a'],
        'b'        => $row['name_b'],
        'message'  => $row['warning_text'],
        'severity' => $row['severity_level'] ?? 'Caution'
    ];
}

function fetch_rule(PDO $pdo, int $id): array
{
    $stmt = $pdo->prepare(RULE_SELECT . ' WHERE r.rule_id = :id');
    $stmt->execute(['id' => $id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) json_error('Clash rule not found or contains unlinked ingredients.', 444);
    return row_to_rule($row);
}

function rule_input(PDO $pdo, array $data): array
{
    $a = trim($data['a'] ?? '');
    $b = trim($data['b'] ?? '');
    $message = trim($data['message'] ?? '');
    $severity = trim($data['severity'] ?? 'Caution');

    if ($a === '' || $b === '' || $message === '') {
        json_error('Fields a, b, and message are required.', 400);
    }
    if (strcasecmp($a, $b) === 0) {
        json_error('Ingredient A and B must be distinct active ingredients.', 422);
    }

    $idA = ingredient_id_by_name($pdo, $a);
    $idB = ingredient_id_by_name($pdo, $b);

    if ($idA === null) json_error("Unknown ingredient: '$a'", 422);
    if ($idB === null) json_error("Unknown ingredient: '$b'", 422);

    return [$idA, $idB, $message, $severity];
}

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET':
        $stmt = $pdo->query(RULE_SELECT . ' ORDER BY r.rule_id ASC');
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        json_out(array_map('row_to_rule', $rows));
        break;

    case 'POST':
        [$idA, $idB, $message, $severity] = rule_input($pdo, body());

        $stmt = $pdo->prepare(
            'INSERT INTO ingredient_clash_rules (ingredient_id_1, ingredient_id_2, warning_text, severity_level)
             VALUES (:a, :b, :message, :severity)'
        );
        $stmt->execute([
            'a'        => $idA, 
            'b'        => $idB, 
            'message'  => $message, 
            'severity' => $severity
        ]);

        json_out(fetch_rule($pdo, (int) $pdo->lastInsertId()), 201);
        break;

    case 'PUT':
        $data = body();
        $id = (int) ($data['id'] ?? 0);
        if (!$id) json_error('Clash rule ID is required.', 400);

        [$idA, $idB, $message, $severity] = rule_input($pdo, $data);

        $check = $pdo->prepare('SELECT rule_id FROM ingredient_clash_rules WHERE rule_id = :id');
        $check->execute(['id' => $id]);
        if (!$check->fetch()) json_error('Clash rule not found.', 404);

        $stmt = $pdo->prepare(
            'UPDATE ingredient_clash_rules
             SET ingredient_id_1 = :a, ingredient_id_2 = :b, warning_text = :message, severity_level = :severity
             WHERE rule_id = :id'
        );
        $stmt->execute([
            'a'        => $idA, 
            'b'        => $idB, 
            'message'  => $message, 
            'severity' => $severity, 
            'id'       => $id
        ]);

        json_out(fetch_rule($pdo, $id));
        break;

    case 'DELETE':
        $id = (int) ($_GET['id'] ?? 0);
        if (!$id) json_error('Clash rule ID is required.', 400);

        $stmt = $pdo->prepare('DELETE FROM ingredient_clash_rules WHERE rule_id = :id');
        $stmt->execute(['id' => $id]);
        json_out(['ok' => true]);
        break;

    default:
        json_error('Method not allowed.', 405);
}