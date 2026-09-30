<?php
/**
 * GlowCouncil curation — product recommendations by skin type.
 *
 *   GET     any signed-in user. Regular users only ever receive recommendations
 *           marked visible; Beauty Consultants receive all of them.
 *           Optional ?skinType=Combination filter.
 *   POST    Beauty Consultant only — create.   {name, category, skinType, starIngredient, description, visible}
 *   PUT     Beauty Consultant only — update.   same body + id
 *   DELETE  Beauty Consultant only — ?id=
 *
 * Saved in MySQL, in existing columns of ingredient_clash_rules (no new table
 * or column) — see lib/recommendations_store.php for how a recommendation maps
 * onto that table. active_ingredients is read to check the star ingredient.
 */
require_once __DIR__ . '/config/bootstrap.php';
require_once __DIR__ . '/lib/helpers.php';
require_once __DIR__ . '/lib/recommendations_store.php';

$pdo = get_db();
$user = require_auth($pdo);
$isConsultant = ($user['role'] ?? 'user') === 'consultant';
if ($_SERVER['REQUEST_METHOD'] !== 'GET') assert_consultant($user);

function rec_len(string $s): int
{
    return function_exists('mb_strlen') ? mb_strlen($s) : strlen($s);
}

/** Case-insensitive lookup in a fixed list; returns the canonical spelling or null. */
function rec_pick(string $value, array $allowed): ?string
{
    foreach ($allowed as $option) {
        if (strcasecmp(trim($value), $option) === 0) return $option;
    }
    return null;
}

/** Validates the request body and returns the clean fields to store. */
function rec_input(PDO $pdo, array $data): array
{
    $name = trim((string) ($data['name'] ?? ''));
    $description = trim((string) ($data['description'] ?? ''));
    $star = trim((string) ($data['starIngredient'] ?? ''));

    if ($name === '') json_error('Product name is required.');
    // The name is later copied to a user's shelf (products.product_name is VARCHAR(150)).
    if (rec_len($name) > 150) json_error('Product name must be 150 characters or fewer.');

    $category = rec_pick((string) ($data['category'] ?? ''), REC_CATEGORIES);
    if ($category === null) json_error('Choose a valid product type.', 422);

    $skinType = rec_pick((string) ($data['skinType'] ?? ''), REC_SKIN_TYPES);
    if ($skinType === null) json_error('Choose a skin type this product is recommended for.', 422);

    if ($description === '') json_error('Description is required.');
    if (rec_len($description) > 500) json_error('Description must be 500 characters or fewer.', 422);

    // Star ingredient is optional; when given it must be a real ingredient.
    if (strcasecmp($star, 'None') === 0) $star = '';
    if ($star !== '') {
        $stmt = $pdo->prepare('SELECT ingredient_name FROM active_ingredients WHERE ingredient_name = :n ORDER BY ingredient_id LIMIT 1');
        $stmt->execute(['n' => $star]);
        $canonical = $stmt->fetchColumn();
        if ($canonical === false) json_error("Unknown ingredient: $star", 422);
        $star = (string) $canonical;
    }

    $visible = true;
    if (array_key_exists('visible', $data)) {
        $parsed = filter_var($data['visible'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        $visible = $parsed ?? true;
    }

    return [
        'name'           => $name,
        'category'       => $category,
        'skinType'       => $skinType,
        'starIngredient' => $star,
        'description'    => $description,
        'visible'        => $visible,
    ];
}

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET': {
        $skin = isset($_GET['skinType']) ? rec_pick((string) $_GET['skinType'], REC_SKIN_TYPES) : null;

        $out = [];
        foreach (recs_all($pdo) as $r) {
            if (!$isConsultant && !$r['visible']) continue;
            if ($skin !== null && $r['skinType'] !== $skin) continue;
            $out[] = $r;
        }
        json_out($out);
        break;
    }

    case 'POST': {
        $fields = rec_input($pdo, body());

        $id = recs_insert($pdo, $fields);

        json_out(recs_find($pdo, $id), 201);
        break;
    }

    case 'PUT': {
        $data = body();
        $id = (int) ($data['id'] ?? 0);
        if (!$id) json_error('Recommendation id is required.');

        $fields = rec_input($pdo, $data);

        if (recs_find($pdo, $id) === null) json_error('Recommendation not found.', 404);
        recs_update($pdo, $id, $fields);

        json_out(recs_find($pdo, $id));
        break;
    }

    case 'DELETE': {
        $id = (int) ($_GET['id'] ?? 0);
        if (!$id) json_error('Recommendation id is required.');

        if (!recs_delete($pdo, $id)) json_error('Recommendation not found.', 404);
        json_out(['ok' => true]);
        break;
    }

    default:
        json_error('Method not allowed.', 405);
}
