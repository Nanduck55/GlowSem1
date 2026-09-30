<?php
/**
 * GlowCouncil curation store (product recommendations) — MySQL, NO schema change.
 *
 * glowguard_db has no table with columns for a recommendation's skin type,
 * description and visibility, and the schema must stay exactly as it is. So a
 * recommendation is stored as ONE row of the existing `ingredient_clash_rules`
 * table, using columns that already exist:
 *
 *   severity_level    = 'GlowCouncil'   marks the row as a recommendation
 *   source_reference  = skin type       (Oily, Dry, Combination, ...)
 *   warning_text      = JSON            {name, category, starIngredient,
 *                                        description, visible}
 *   ingredient_id_1/2 = NULL            (both columns are nullable)
 *   rule_id           = the recommendation id (auto increment)
 *   last_updated      = updatedAt       (MySQL keeps it current)
 *
 * Real clash rules always have BOTH ingredient ids set and read the table with
 * INNER JOINs, so recommendation rows never show up as safety rules, and the
 * clash-rules API never touches them (see the IS NOT NULL checks there).
 *
 * Only data is added — no table, column or index is created or changed.
 */

// Same list as CATEGORIES in the frontend (src/api/constants.js).
const REC_CATEGORIES = ['Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen', 'Exfoliant', 'Mask', 'Other'];
const REC_SKIN_TYPES = ['Oily', 'Dry', 'Combination', 'Balanced', 'Sensitive'];

// Value stored in ingredient_clash_rules.severity_level (VARCHAR(45)).
const REC_MARKER = 'GlowCouncil';

// Selects only recommendation rows.
const REC_WHERE = 'ingredient_id_1 IS NULL AND ingredient_id_2 IS NULL AND severity_level = :marker';

/** One database row -> the frontend shape. Returns null if the JSON is unreadable. */
function recs_row_to_public(array $row): ?array
{
    $payload = json_decode((string) $row['warning_text'], true);
    if (!is_array($payload)) return null;

    return [
        'id'             => (int) $row['rule_id'],
        'name'           => (string) ($payload['name'] ?? ''),
        'category'       => (string) ($payload['category'] ?? ''),
        'skinType'       => (string) ($row['source_reference'] ?? ''),
        'starIngredient' => (string) ($payload['starIngredient'] ?? ''),
        'description'    => (string) ($payload['description'] ?? ''),
        'visible'        => (bool) ($payload['visible'] ?? true),
        'updatedAt'      => $row['last_updated'] ?? null,
    ];
}

/** The JSON kept in warning_text. */
function recs_payload(array $fields): string
{
    return json_encode([
        'name'           => $fields['name'],
        'category'       => $fields['category'],
        'starIngredient' => $fields['starIngredient'],
        'description'    => $fields['description'],
        'visible'        => (bool) $fields['visible'],
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

/** Every recommendation, oldest first. */
function recs_all(PDO $pdo): array
{
    $stmt = $pdo->prepare(
        'SELECT rule_id, warning_text, source_reference, last_updated
         FROM ingredient_clash_rules
         WHERE ' . REC_WHERE . '
         ORDER BY rule_id'
    );
    $stmt->execute(['marker' => REC_MARKER]);

    $out = [];
    foreach ($stmt->fetchAll() as $row) {
        $rec = recs_row_to_public($row);
        if ($rec !== null) $out[] = $rec;
    }
    return $out;
}

/** One recommendation by id, or null. */
function recs_find(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare(
        'SELECT rule_id, warning_text, source_reference, last_updated
         FROM ingredient_clash_rules
         WHERE rule_id = :id AND ' . REC_WHERE
    );
    $stmt->execute(['id' => $id, 'marker' => REC_MARKER]);
    $row = $stmt->fetch();
    return $row ? recs_row_to_public($row) : null;
}

/** Inserts a recommendation and returns its new id. */
function recs_insert(PDO $pdo, array $fields): int
{
    $pdo->prepare(
        'INSERT INTO ingredient_clash_rules
             (ingredient_id_1, ingredient_id_2, warning_text, severity_level, source_reference)
         VALUES (NULL, NULL, :payload, :marker, :skin)'
    )->execute([
        'payload' => recs_payload($fields),
        'marker'  => REC_MARKER,
        'skin'    => $fields['skinType'],
    ]);

    return (int) $pdo->lastInsertId();
}

/** Overwrites a recommendation's fields. */
function recs_update(PDO $pdo, int $id, array $fields): void
{
    $pdo->prepare(
        'UPDATE ingredient_clash_rules
         SET warning_text = :payload, source_reference = :skin
         WHERE rule_id = :id AND ' . REC_WHERE
    )->execute([
        'payload' => recs_payload($fields),
        'skin'    => $fields['skinType'],
        'id'      => $id,
        'marker'  => REC_MARKER,
    ]);
}

/** Deletes a recommendation. Returns true if a row was removed. */
function recs_delete(PDO $pdo, int $id): bool
{
    $stmt = $pdo->prepare(
        'DELETE FROM ingredient_clash_rules WHERE rule_id = :id AND ' . REC_WHERE
    );
    $stmt->execute(['id' => $id, 'marker' => REC_MARKER]);
    return $stmt->rowCount() > 0;
}
