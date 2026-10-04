<?php
/**
 * GlowCouncil Curation API Endpoint.
 */
require_once __DIR__ . '/config/bootstrap.php';
require_once __DIR__ . '/lib/helpers.php';
require_once __DIR__ . '/lib/recommendations_store.php';

$pdo = get_db();
$user = require_auth($pdo);
$isConsultant = (($user['role'] ?? 'user') === 'consultant');
if ($_SERVER['REQUEST_METHOD'] !== 'GET') assert_consultant($user);

function rec_pick(string $value, array $allowed): ?string
{
    foreach ($allowed as $option) {
        if (strcasecmp(trim($value), $option) === 0) return $option;
    }
    return null;
}

function rec_input(PDO $pdo, array $data): array
{
    $name = trim((string) ($data['name'] ?? ''));
    $description = trim((string) ($data['description'] ?? ''));
    $star = trim((string) ($data['starIngredient'] ?? ''));

    if ($name === '') json_error('Product name is required.', 400);
    if (mb_strlen($name) > 150) json_error('Product name must be 150 characters or fewer.', 422);

    $category = rec_pick((string) ($data['category'] ?? ''), REC_CATEGORIES);
    if ($category === null) json_error('Choose a valid product category.', 422);

    $skinType = rec_pick((string) ($data['skinType'] ?? ''), REC_SKIN_TYPES);
    if ($skinType === null) json_error('Choose a valid skin type.', 422);

    if ($description === '') json_error('Description is required.', 400);
    if (mb_strlen($description) > 500) json_error('Description must be 500 characters or fewer.', 422);

    if (strcasecmp($star, 'None') === 0) $star = '';
    if ($star !== '') {
        $stmt = $pdo->prepare('SELECT ingredient_name FROM active_ingredients WHERE LOWER(ingredient_name) = LOWER(:n) LIMIT 1');
        $stmt->execute(['n' => $star]);
        $canonical = $stmt->fetchColumn();
        if ($canonical === false) json_error("Unknown ingredient: '$star'", 422);
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

    case 'GET':
        $skin = isset($_GET['skinType']) ? rec_pick((string) $_GET['skinType'], REC_SKIN_TYPES) : null;
        $out = [];
        foreach (recs_all($pdo) as $r) {
            if (!$isConsultant && !$r['visible']) continue;
            if ($skin !== null && $r['skinType'] !== $skin) continue;
            $out[] = $r;
        }
        json_out($out);
        break;

    case 'POST':
        $fields = rec_input($pdo, body());
        $id = recs_insert($pdo, $fields);
        json_out(recs_find($pdo, $id), 201);
        break;

    case 'PUT':
        $data = body();
        $id = (int) ($data['id'] ?? 0);
        if (!$id) json_error('Recommendation ID is required.', 400);

        $fields = rec_input($pdo, $data);
        if (recs_find($pdo, $id) === null) json_error('Recommendation not found.', 404);
        
        recs_update($pdo, $id, $fields);
        json_out(recs_find($pdo, $id));
        break;

    case 'DELETE':
        $id = (int) ($_GET['id'] ?? 0);
        if (!$id) json_error('Recommendation ID is required.', 400);

        if (!recs_delete($pdo, $id)) json_error('Recommendation not found.', 404);
        json_out(['ok' => true]);
        break;

    default:
        json_error('Method not allowed.', 405);
}