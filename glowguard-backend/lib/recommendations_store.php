<?php
/**
 * GlowCouncil curation store (product recommendations) — Clean relational table.
 * Interacts directly with product_recommendations, products, and active_ingredients.
 */

const REC_CATEGORIES = ['Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen', 'Exfoliant', 'Mask', 'Other'];
const REC_SKIN_TYPES = ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'];
const REC_TIMES = ['AM', 'PM', 'Both'];

/**
 * Maps a relational database row to the exact public array structure expected by React.
 */
function recs_row_to_public(array $row): array
{
    return [
        'id'               => (int) $row['recommendation_id'],
        'name'             => (string) $row['product_name'],
        'category'         => (string) $row['category'],
        'skinType'         => (string) $row['skin_type'],
        'timeOfDay'        => (string) ($row['time_of_day'] ?? 'Both'),
        'starIngredientId' => isset($row['star_ingredient_id']) ? (int) $row['star_ingredient_id'] : null,
        'starIngredient'   => (string) ($row['star_ingredient_name'] ?? ''),
        'description'      => (string) $row['recommendation_note'],
        'visible'          => (bool) $row['is_visible'],
        'updatedAt'        => $row['updated_at'] ?? null,
    ];
}

/** Every recommendation, oldest first. */
function recs_all(PDO $pdo): array
{
    $stmt = $pdo->prepare('
        SELECT 
            pr.recommendation_id,
            p.product_name,
            p.category,
            pr.skin_type,
            p.time_of_day,
            pr.star_ingredient_id,
            ai.ingredient_name AS star_ingredient_name,
            pr.recommendation_note,
            pr.is_visible,
            pr.created_at AS updated_at
        FROM product_recommendations pr
        JOIN products p ON pr.product_id = p.product_id
        LEFT JOIN active_ingredients ai ON pr.star_ingredient_id = ai.ingredient_id
        ORDER BY pr.recommendation_id ASC
    ');
    $stmt->execute();

    $out = [];
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $out[] = recs_row_to_public($row);
    }
    return $out;
}

/** One recommendation by id, or null. */
function recs_find(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare('
        SELECT 
            pr.recommendation_id,
            p.product_name,
            p.category,
            pr.skin_type,
            p.time_of_day,
            pr.star_ingredient_id,
            ai.ingredient_name AS star_ingredient_name,
            pr.recommendation_note,
            pr.is_visible,
            pr.created_at AS updated_at
        FROM product_recommendations pr
        JOIN products p ON pr.product_id = p.product_id
        LEFT JOIN active_ingredients ai ON pr.star_ingredient_id = ai.ingredient_id
        WHERE pr.recommendation_id = :id
    ');
    $stmt->execute(['id' => $id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    return $row ? recs_row_to_public($row) : null;
}

/** Inserts a recommendation and returns its new id. */
function recs_insert(PDO $pdo, array $fields): int
{
    $pdo->beginTransaction();
    try {
        // 1. Create entry in master catalog
        $pStmt = $pdo->prepare('
            INSERT INTO products (product_name, category, time_of_day) 
            VALUES (:name, :category, :tod)
        ');
        $pStmt->execute([
            'name'     => $fields['name'],
            'category' => $fields['category'],
            'tod'      => $fields['timeOfDay']
        ]);
        $productId = (int) $pdo->lastInsertId();

        // 2. Link recommendation note in product_recommendations
        $rStmt = $pdo->prepare('
            INSERT INTO product_recommendations 
                (product_id, skin_type, star_ingredient_id, recommendation_note, is_visible) 
            VALUES (:pid, :skin, :star_id, :note, :vis)
        ');
        $rStmt->execute([
            'pid'     => $productId,
            'skin'    => $fields['skinType'],
            'star_id' => $fields['starIngredient'],
            'note'    => $fields['description'],
            'vis'     => $fields['visible'] ? 1 : 0
        ]);
        $recId = (int) $pdo->lastInsertId();

        $pdo->commit();
        return $recId;
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $e;
    }
}

/** Overwrites a recommendation's fields. */
function recs_update(PDO $pdo, int $id, array $fields): void
{
    $pdo->beginTransaction();
    try {
        // Find product ID associated with this recommendation
        $stmt = $pdo->prepare('SELECT product_id FROM product_recommendations WHERE recommendation_id = :id');
        $stmt->execute(['id' => $id]);
        $productId = $stmt->fetchColumn();

        if ($productId === false) {
            $pdo->rollBack();
            return;
        }

        // Update product name/category/time_of_day in products catalog strictly by product_id
        $pStmt = $pdo->prepare('UPDATE products SET product_name = :name, category = :cat, time_of_day = :tod WHERE product_id = :pid');
        $pStmt->execute(['name' => $fields['name'], 'cat' => $fields['category'], 'tod' => $fields['timeOfDay'], 'pid' => (int)$productId]);

        // Update recommendation notes strictly by recommendation_id
        $rStmt = $pdo->prepare('
            UPDATE product_recommendations 
            SET skin_type = :skin, star_ingredient_id = :star_id, recommendation_note = :note, is_visible = :vis 
            WHERE recommendation_id = :id
        ');
        $rStmt->execute([
            'skin'    => $fields['skinType'],
            'star_id' => $fields['starIngredient'],
            'note'    => $fields['description'],
            'vis'     => $fields['visible'] ? 1 : 0,
            'id'      => $id
        ]);

        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $e;
    }
}

/** Deletes a recommendation and its associated product entry safely. */
function recs_delete(PDO $pdo, int $id): bool
{
    $pdo->beginTransaction();
    try {
        // 1. Get the product_id first
        $stmt = $pdo->prepare('SELECT product_id FROM product_recommendations WHERE recommendation_id = :id');
        $stmt->execute(['id' => $id]);
        $productId = $stmt->fetchColumn();

        if ($productId === false) {
            $pdo->rollBack();
            return false;
        }

        // 2. Delete the recommendation record
        $delRec = $pdo->prepare('DELETE FROM product_recommendations WHERE recommendation_id = :id');
        $delRec->execute(['id' => $id]);

        // 3. Clean up the master product entry to keep 3NF/relational integrity clean
        $delProd = $pdo->prepare('DELETE FROM products WHERE product_id = :pid');
        $delProd->execute(['pid' => (int)$productId]);

        $pdo->commit();
        return true;
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $e;
    }
}