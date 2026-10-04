<?php
/**
 * Helpers mapping frontend representations to 3NF schema tables.
 */

const DAILY_TYPE = 'daily';
const SHELF_AM   = '__shelf_AM__';
const SHELF_PM   = '__shelf_PM__';

function valid_date(?string $date): bool
{
    return is_string($date) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) === 1;
}

/* ------------------------------------------------------------------ */
/*  Routines                                                           */
/* ------------------------------------------------------------------ */

function find_routine(PDO $pdo, int $userId, string $name, string $type): ?int
{
    $stmt = $pdo->prepare(
        'SELECT routine_id FROM routines
         WHERE user_id = :uid AND routine_name = :name AND routine_type = :type
         ORDER BY routine_id ASC LIMIT 1'
    );
    $stmt->execute(['uid' => $userId, 'name' => $name, 'type' => $type]);
    $id = $stmt->fetchColumn();
    return $id !== false ? (int) $id : null;
}

function find_or_create_routine(PDO $pdo, int $userId, string $name, string $type): int
{
    $id = find_routine($pdo, $userId, $name, $type);
    if ($id !== null) return $id;

    $stmt = $pdo->prepare(
        'INSERT INTO routines (user_id, routine_name, routine_type) VALUES (:uid, :name, :type)'
    );
    $stmt->execute(['uid' => $userId, 'name' => $name, 'type' => $type]);
    return (int) $pdo->lastInsertId();
}

const PERIODS = ['AM', 'PM'];
const REMOVED_PREFIX = 'removed_';

function completed_periods(PDO $pdo, int $userId, string $date): array
{
    $stmt = $pdo->prepare(
        'SELECT DISTINCT rp.product_id, r.routine_type
         FROM routines r
         JOIN routine_products rp ON rp.routine_id = r.routine_id
         JOIN routine_logs l ON l.routine_product_id = rp.routine_product_id
         WHERE r.user_id = :uid AND r.routine_name = :date AND r.routine_type IN (\'AM\', \'PM\')'
    );
    $stmt->execute(['uid' => $userId, 'date' => $date]);

    $out = [];
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $out[(int) $row['product_id']][$row['routine_type']] = true;
    }
    return $out;
}

function removed_periods(PDO $pdo, int $userId, string $date): array
{
    $stmt = $pdo->prepare(
        'SELECT DISTINCT rp.product_id, r.routine_type
         FROM routines r
         JOIN routine_products rp ON rp.routine_id = r.routine_id
         WHERE r.user_id = :uid AND r.routine_name = :date AND r.routine_type IN (:rem_am, :rem_pm)'
    );
    $stmt->execute([
        'uid'    => $userId, 
        'date'   => $date,
        'rem_am' => REMOVED_PREFIX . 'AM', 
        'rem_pm' => REMOVED_PREFIX . 'PM',
    ]);

    $out = [];
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $period = substr($row['routine_type'], strlen(REMOVED_PREFIX));
        $out[(int) $row['product_id']][$period] = true;
    }
    return $out;
}

function set_period_removed(PDO $pdo, int $userId, string $date, int $productId, string $period, bool $removed): void
{
    $type = REMOVED_PREFIX . $period;

    if (!$removed) {
        $rid = find_routine($pdo, $userId, $date, $type);
        if ($rid === null) return;
        $pdo->prepare('DELETE FROM routine_products WHERE routine_id = :rid AND product_id = :pid')
            ->execute(['rid' => $rid, 'pid' => $productId]);
        return;
    }

    $rid = find_or_create_routine($pdo, $userId, $date, $type);

    $stmt = $pdo->prepare(
        'SELECT routine_product_id FROM routine_products WHERE routine_id = :rid AND product_id = :pid LIMIT 1'
    );
    $stmt->execute(['rid' => $rid, 'pid' => $productId]);
    if ($stmt->fetchColumn() === false) {
        $pdo->prepare('INSERT INTO routine_products (routine_id, product_id, step_order) VALUES (:rid, :pid, 0)')
            ->execute(['rid' => $rid, 'pid' => $productId]);
    }

    set_period_completion($pdo, $userId, $date, $productId, $period, false);
}

function routine_items(PDO $pdo, int $userId, string $date): array
{
    $rid = find_routine($pdo, $userId, $date, DAILY_TYPE);
    if ($rid === null) return [];

    $stmt = $pdo->prepare(
        'SELECT product_id FROM routine_products
         WHERE routine_id = :rid
         ORDER BY step_order ASC, routine_product_id ASC'
    );
    $stmt->execute(['rid' => $rid]);

    $done = completed_periods($pdo, $userId, $date);
    $removed = removed_periods($pdo, $userId, $date);

    $out = [];
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $pid = (int) $row['product_id'];
        $am = isset($done[$pid]['AM']);
        $pm = isset($done[$pid]['PM']);
        $out[] = [
            'productId'   => $pid,
            'completed'   => $am || $pm,
            'completedAM' => $am,
            'completedPM' => $pm,
            'removedAM'   => isset($removed[$pid]['AM']),
            'removedPM'   => isset($removed[$pid]['PM']),
        ];
    }
    return $out;
}

function set_period_completion(PDO $pdo, int $userId, string $date, int $productId, string $period, bool $completed): void
{
    if (!$completed) {
        $rid = find_routine($pdo, $userId, $date, $period);
        if ($rid === null) return;
        $pdo->prepare('DELETE FROM routine_products WHERE routine_id = :rid AND product_id = :pid')
            ->execute(['rid' => $rid, 'pid' => $productId]);
        return;
    }

    $rid = find_or_create_routine($pdo, $userId, $date, $period);

    $stmt = $pdo->prepare(
        'SELECT routine_product_id FROM routine_products
         WHERE routine_id = :rid AND product_id = :pid
         ORDER BY routine_product_id ASC LIMIT 1'
    );
    $stmt->execute(['rid' => $rid, 'pid' => $productId]);
    $rpId = $stmt->fetchColumn();

    if ($rpId === false) {
        $pdo->prepare('INSERT INTO routine_products (routine_id, product_id, step_order) VALUES (:rid, :pid, 0)')
            ->execute(['rid' => $rid, 'pid' => $productId]);
        $rpId = (int) $pdo->lastInsertId();
    }

    $has = $pdo->prepare('SELECT log_id FROM routine_logs WHERE routine_product_id = :id LIMIT 1');
    $has->execute(['id' => $rpId]);
    if (!$has->fetch()) {
        $pdo->prepare('INSERT INTO routine_logs (routine_product_id) VALUES (:id)')->execute(['id' => $rpId]);
    }
}

/* ------------------------------------------------------------------ */
/*  Products                                                           */
/* ------------------------------------------------------------------ */

function load_products(PDO $pdo, int $userId, ?int $productId = null): array
{
    // 1. Fetch products mapped via user_products junction table
    $sql = 'SELECT p.product_id, p.product_name, p.category 
            FROM user_products up
            JOIN products p ON p.product_id = up.product_id 
            WHERE up.user_id = :uid';
    
    $params = ['uid' => $userId];
    if ($productId !== null) {
        $sql .= ' AND p.product_id = :pid';
        $params['pid'] = $productId;
    }
    
    $stmt = $pdo->prepare($sql . ' ORDER BY up.added_at DESC');
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if (!$rows) return [];

    // 2. Load active ingredients via user_products link
    $actives = [];
    $stmt = $pdo->prepare(
        'SELECT pi.product_id, ai.ingredient_name
         FROM product_ingredients pi
         JOIN active_ingredients ai ON ai.ingredient_id = pi.ingredient_id
         JOIN user_products up ON up.product_id = pi.product_id
         WHERE up.user_id = :uid
         ORDER BY ai.ingredient_name ASC'
    );
    $stmt->execute(['uid' => $userId]);
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $r) {
        $actives[(int) $r['product_id']][] = $r['ingredient_name'];
    }

    // 3. Load product usage count
    $uses = [];
    $stmt = $pdo->prepare(
        'SELECT rp.product_id, COUNT(*) AS n
         FROM routines r
         JOIN routine_products rp ON rp.routine_id = r.routine_id
         JOIN routine_logs l ON l.routine_product_id = rp.routine_product_id
         WHERE r.user_id = :uid AND r.routine_type IN (\'AM\', \'PM\')
         GROUP BY rp.product_id'
    );
    $stmt->execute(['uid' => $userId]);
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $r) {
        $uses[(int) $r['product_id']] = (int) $r['n'];
    }

    // 4. Load time of day preferences (AM/PM)
    $times = [];
    $stmt = $pdo->prepare(
        'SELECT rp.product_id, r.routine_name
         FROM routine_products rp
         JOIN routines r ON r.routine_id = rp.routine_id
         WHERE r.user_id = :uid AND r.routine_name IN (:am, :pm)'
    );
    $stmt->execute(['uid' => $userId, 'am' => SHELF_AM, 'pm' => SHELF_PM]);
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $r) {
        $times[(int) $r['product_id']][$r['routine_name']] = true;
    }

    // 5. Structure payload for React UI
    $out = [];
    foreach ($rows as $row) {
        $id = (int) $row['product_id'];
        $am = isset($times[$id][SHELF_AM]);
        $pm = isset($times[$id][SHELF_PM]);
        $out[] = [
            'id'        => $id,
            'name'      => $row['product_name'],
            'category'  => $row['category'],
            'timeOfDay' => ($am && !$pm) ? 'AM' : (($pm && !$am) ? 'PM' : 'Both'),
            'actives'   => $actives[$id] ?? [],
            'uses'      => $uses[$id] ?? 0,
        ];
    }
    return $out;
}

function set_product_actives(PDO $pdo, int $productId, array $names): void
{
    $pdo->prepare('DELETE FROM product_ingredients WHERE product_id = :pid')
        ->execute(['pid' => $productId]);

    $find = $pdo->prepare(
        'SELECT ingredient_id FROM active_ingredients WHERE LOWER(ingredient_name) = LOWER(:n) ORDER BY ingredient_id ASC LIMIT 1'
    );
    $ins = $pdo->prepare(
        'INSERT INTO product_ingredients (product_id, ingredient_id) VALUES (:pid, :iid)'
    );

    foreach (array_unique(array_map('trim', $names)) as $name) {
        if ($name === '') continue;
        $find->execute(['n' => $name]);
        $iid = $find->fetchColumn();
        if ($iid !== false) {
            $ins->execute(['pid' => $productId, 'iid' => (int) $iid]);
        }
    }
}

function set_product_time_of_day(PDO $pdo, int $userId, int $productId, string $tod): void
{
    if (!in_array($tod, ['AM', 'PM', 'Both'], true)) $tod = 'Both';

    $pdo->prepare(
        'DELETE rp FROM routine_products rp
         JOIN routines r ON r.routine_id = rp.routine_id
         WHERE r.user_id = :uid AND r.routine_name IN (:am, :pm) AND rp.product_id = :pid'
    )->execute(['uid' => $userId, 'am' => SHELF_AM, 'pm' => SHELF_PM, 'pid' => $productId]);

    $ins = $pdo->prepare(
        'INSERT INTO routine_products (routine_id, product_id, step_order) VALUES (:rid, :pid, 0)'
    );

    if ($tod === 'AM' || $tod === 'Both') {
        $ins->execute(['rid' => find_or_create_routine($pdo, $userId, SHELF_AM, 'AM'), 'pid' => $productId]);
    }
    if ($tod === 'PM' || $tod === 'Both') {
        $ins->execute(['rid' => find_or_create_routine($pdo, $userId, SHELF_PM, 'PM'), 'pid' => $productId]);
    }
}

/* ------------------------------------------------------------------ */
/*  Ingredients / Clash Rules Helpers                                 */
/* ------------------------------------------------------------------ */

function ingredient_id_by_name(PDO $pdo, string $name): ?int
{
    $stmt = $pdo->prepare(
        'SELECT ingredient_id FROM active_ingredients WHERE LOWER(ingredient_name) = LOWER(:n) ORDER BY ingredient_id ASC LIMIT 1'
    );
    $stmt->execute(['n' => trim($name)]);
    $id = $stmt->fetchColumn();
    return $id !== false ? (int) $id : null;
}