<?php
/**
 * Safety Clash Rules.
 * Lives at the API root (not under /admin) because every signed-in role
 * needs GET access: the frontend's safety engine reads these rules to
 * warn any user about clashing actives in their own routine. Only Beauty
 * Consultant accounts (role = 'consultant') may create, edit, or delete
 * rules — Admins no longer manage this list.
 *
 * Each rule also carries a severity level and a source reference. Both are
 * stored in columns that already exist on ingredient_clash_rules
 * (severity_level, source_reference) — no schema change.
 */
require_once __DIR__ . '/config/bootstrap.php';
require_once __DIR__ . '/lib/helpers.php';

$pdo = get_db();
$user = require_auth($pdo); // any logged-in user may READ the rules (the safety engine needs them)
if ($_SERVER['REQUEST_METHOD'] !== 'GET') assert_consultant($user); // only Beauty Consultants may change them

const SEVERITY_LEVELS  = ['Potential Conflict', 'Caution', 'Info'];
const DEFAULT_SEVERITY = 'Potential Conflict';
// ingredient_clash_rules.source_reference is VARCHAR(45).
const SOURCE_MAX_LENGTH = 45;

const RULE_SELECT =
    'SELECT r.rule_id, a.ingredient_name AS name_a, b.ingredient_name AS name_b, r.warning_text,
            r.severity_level, r.source_reference
     FROM ingredient_clash_rules r
     JOIN active_ingredients a ON a.ingredient_id = r.ingredient_id_1
     JOIN active_ingredients b ON b.ingredient_id = r.ingredient_id_2';

/** Maps any stored value (including NULL on older rules) onto one of SEVERITY_LEVELS. */
function normalize_severity(?string $value): string
{
    foreach (SEVERITY_LEVELS as $level) {
        if (strcasecmp(trim((string) $value), $level) === 0) return $level;
    }
    return DEFAULT_SEVERITY;
}

function row_to_rule(array $row): array
{
    return [
        'id'       => (int) $row['rule_id'],
        'a'        => $row['name_a'],
        'b'        => $row['name_b'],
        'message'  => $row['warning_text'],
        'severity' => normalize_severity($row['severity_level'] ?? null),
        'source'   => (string) ($row['source_reference'] ?? ''),
    ];
}

function fetch_rule(PDO $pdo, int $id): array
{
    $stmt = $pdo->prepare(RULE_SELECT . ' WHERE r.rule_id = :id');
    $stmt->execute(['id' => $id]);
    return row_to_rule($stmt->fetch());
}

/**
 * Validates the request body and resolves both ingredient names to ids.
 * `severity` and `source` are optional: when a client leaves them out,
 * they come back as null so an edit doesn't wipe the stored values.
 */
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

    $severity = null;
    if (array_key_exists('severity', $data) && trim((string) $data['severity']) !== '') {
        $wanted = trim((string) $data['severity']);
        foreach (SEVERITY_LEVELS as $level) {
            if (strcasecmp($wanted, $level) === 0) $severity = $level;
        }
        if ($severity === null) {
            json_error('Severity level must be one of: ' . implode(', ', SEVERITY_LEVELS) . '.', 422);
        }
    }

    $source = null;
    if (array_key_exists('source', $data)) {
        $source = trim((string) $data['source']);
        $length = function_exists('mb_strlen') ? mb_strlen($source) : strlen($source);
        if ($length > SOURCE_MAX_LENGTH) {
            json_error('Source reference must be ' . SOURCE_MAX_LENGTH . ' characters or fewer.', 422);
        }
    }

    return [$idA, $idB, $message, $severity, $source];
}

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET':
        $rows = $pdo->query(RULE_SELECT . ' ORDER BY r.rule_id')->fetchAll();
        json_out(array_map('row_to_rule', $rows));
        break;

    case 'POST': {
        [$idA, $idB, $message, $severity, $source] = rule_input($pdo, body());

        $pdo->prepare(
            'INSERT INTO ingredient_clash_rules
                 (ingredient_id_1, ingredient_id_2, warning_text, severity_level, source_reference)
             VALUES (:a, :b, :message, :severity, :source)'
        )->execute([
            'a'        => $idA,
            'b'        => $idB,
            'message'  => $message,
            'severity' => $severity ?? DEFAULT_SEVERITY,
            'source'   => ($source === null || $source === '') ? null : $source,
        ]);

        json_out(fetch_rule($pdo, (int) $pdo->lastInsertId()), 201);
        break;
    }

    case 'PUT': {
        $data = body();
        $id = (int) ($data['id'] ?? 0);
        if (!$id) json_error('Clash rule id is required.');

        [$idA, $idB, $message, $severity, $source] = rule_input($pdo, $data);

        // ingredient_id_1 IS NOT NULL: rows without ingredients are GlowCouncil
        // recommendations (see lib/recommendations_store.php), not clash rules.
        $exists = $pdo->prepare('SELECT rule_id FROM ingredient_clash_rules WHERE rule_id = :id AND ingredient_id_1 IS NOT NULL');
        $exists->execute(['id' => $id]);
        if (!$exists->fetch()) json_error('Clash rule not found.', 404);

        $pdo->prepare(
            'UPDATE ingredient_clash_rules
             SET ingredient_id_1 = :a, ingredient_id_2 = :b, warning_text = :message,
                 severity_level = COALESCE(:severity, severity_level),
                 source_reference = IF(:set_source = 1, :source, source_reference)
             WHERE rule_id = :id'
        )->execute([
            'a'          => $idA,
            'b'          => $idB,
            'message'    => $message,
            'severity'   => $severity,
            'set_source' => $source === null ? 0 : 1,
            'source'     => ($source === null || $source === '') ? null : $source,
            'id'         => $id,
        ]);

        json_out(fetch_rule($pdo, $id));
        break;
    }

    case 'DELETE': {
        $id = (int) ($_GET['id'] ?? 0);
        if (!$id) json_error('Clash rule id is required.');

        $pdo->prepare('DELETE FROM ingredient_clash_rules WHERE rule_id = :id AND ingredient_id_1 IS NOT NULL')->execute(['id' => $id]);
        json_out(['ok' => true]);
        break;
    }

    default:
        json_error('Method not allowed.', 405);
}
