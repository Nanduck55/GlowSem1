<?php
/**
 * GlowCouncil curation store (product recommendations) — Clean relational table.
 * Interacts directly with the `product_recommendations` and `products` tables.
 */

const REC_CATEGORIES = ['Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen', 'Exfoliant', 'Mask', 'Other'];
const REC_SKIN_TYPES = ['Oily', 'Dry', 'Combination', 'Balanced', 'Sensitive'];

/**
 * Maps a relational database row to the exact public array structure expected by React.
 */
function recs_row_to_public(array $row): array
{
    return [
        'id'             => (int) $row['recommendation_id'],
        'name'           => (string) $row['product_name'],
        'category'       => (string) $row['category'],
        'skinType'       => (string) $row['skin_type'],
        'starIngredient' => (string) ($row['star_ingredient'] ?? ''),
        'description'    => (string) $row['recommendation_note'],
        'visible'        => (bool) $row['is_visible'],
        'updatedAt'      => $row['updated_at'] ?? null,
    ];
}

/** Every recommendation, oldest first. */
function recs_all(PDO $pdo): array
{
    $stmt = $pdo->prepare('         SELECT              pr.recommendation_id,             p.product_name,             p.category,             pr.skin_type,             pr.star_ingredient,             pr.recommendation_note,             pr.is_visible,             pr.created_at AS updated_at         FROM product_recommendations pr         JOIN products p ON pr.product_id = p.product_id         ORDER BY pr.recommendation_id ASC     ');$stmt->execute();

    $out = [];
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as$row) {
        $out[] = recs_row_to_public($row);
    }
    return $out;
}

/** One recommendation by id, or null. */
function recs_find(PDO $pdo, int$id): ?array
{
    $stmt =$pdo->prepare('
        SELECT 
            pr.recommendation_id,
            p.product_name,
            p.category,
            pr.skin_type,
            pr.star_ingredient,
            pr.recommendation_note,
            pr.is_visible,
            pr.created_at AS updated_at
        FROM product_recommendations pr
        JOIN products p ON pr.product_id = p.product_id
        WHERE pr.recommendation_id = :id
    ');
    $stmt->execute(['id' =>$id]);
    $row =$stmt->fetch(PDO::FETCH_ASSOC);

    return $row ? recs_row_to_public($row) : null;
}

/** Inserts a recommendation and returns its new id. */
function recs_insert(PDO $pdo, array$fields): int
{
    $pdo->beginTransaction();
    try {
        // 1. Create entry in master catalog
        $pStmt = $pdo->prepare('             INSERT INTO products (product_name, category)              VALUES (:name, :category)         ');$pStmt->execute([
            'name'     => $fields['name'],
            'category' => $fields['category']
        ]);
        $productId = (int)$pdo->lastInsertId();

        // 2. Link recommendation note in product_recommendations
        $rStmt = $pdo->prepare('             INSERT INTO product_recommendations                  (product_id, skin_type, star_ingredient, recommendation_note, is_visible)             VALUES (:pid, :skin, :star, :note, :vis)         ');$rStmt->execute([
            'pid'   => $productId,
            'skin'  => $fields['skinType'],
            'star'  => $fields['starIngredient'],
            'note'  => $fields['description'],
            'vis'   => $fields['visible'] ? 1 : 0
        ]);
        $recId = (int)$pdo->lastInsertId();

        $pdo->commit();
        return $recId;
    } catch (Throwable $e) {
        if ($pdo->inTransaction())$pdo->rollBack();
        throw $e;
    }
}

/** Overwrites a recommendation's fields. */
function recs_update(PDO $pdo, int $id, array$fields): void
{
    $rec = recs_find($pdo,$id);
    if (!$rec) return;

    $pdo->beginTransaction();
    try {
        // Find product ID associated with this recommendation
        $stmt =$pdo->prepare('SELECT product_id FROM product_recommendations WHERE recommendation_id = :id');
        $stmt->execute(['id' =>$id]);
        $productId = (int)$stmt->fetchColumn();

        // Update product name/category in products catalog
        $pStmt =$pdo->prepare('UPDATE products SET product_name = :name, category = :cat WHERE product_id = :pid');
        $pStmt->execute(['name' =>$fields['name'], 'cat' => $fields['category'], 'pid' =>$productId]);

        // Update recommendation notes
        $rStmt = $pdo->prepare('             UPDATE product_recommendations             SET skin_type = :skin, star_ingredient = :star, recommendation_note = :note, is_visible = :vis             WHERE recommendation_id = :id         ');$rStmt->execute([
            'skin' => $fields['skinType'],
            'star' => $fields['starIngredient'],
            'note' => $fields['description'],
            'vis'  => $fields['visible'] ? 1 : 0,             'id'   =>$id
        ]);

        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction())$pdo->rollBack();
        throw $e;
    }
}

/** Deletes a recommendation. Returns true if a row was removed. */
function recs_delete(PDO $pdo, int$id): bool
{
    $stmt =$pdo->prepare('DELETE FROM product_recommendations WHERE recommendation_id = :id');
    $stmt->execute(['id' =>$id]);
    return $stmt->rowCount() > 0;
}