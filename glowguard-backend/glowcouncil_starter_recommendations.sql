-- ------------------------------------------------------------------
-- GlowCouncil starter recommendations  (OPTIONAL — data only)
--
-- Adds a few starter rows for the "For You and your Skin" page. It creates NO
-- table and NO column: recommendations live in existing columns of
-- ingredient_clash_rules (see glowguard-backend/lib/recommendations_store.php):
--   severity_level = 'GlowCouncil', source_reference = skin type,
--   warning_text = JSON, ingredient_id_1 / ingredient_id_2 = NULL.
--
-- Safe to run more than once: a row is only inserted if it isn't there yet.
-- Skip this file entirely if you'd rather have Beauty Consultants add every
-- recommendation themselves from GlowCouncil Curation.
-- ------------------------------------------------------------------
SET NAMES utf8mb4;

INSERT INTO ingredient_clash_rules
  (ingredient_id_1, ingredient_id_2, warning_text, severity_level, source_reference)
SELECT NULL, NULL, v.payload, 'GlowCouncil', v.skin
FROM (
  SELECT '{"name":"Balance Gentle Cleanser","category":"Cleanser","starIngredient":"Salicylic Acid / BHA","description":"A gentle cleanser that helps remove excess oil while keeping the skin feeling comfortable.","visible":true}' AS payload, 'Oily' AS skin
  UNION ALL SELECT '{"name":"Hydra Soft Cleanser","category":"Cleanser","starIngredient":"Hyaluronic Acid","description":"Cleanses the skin while providing lightweight hydration for areas that tend to feel dry.","visible":true}', 'Dry'
  UNION ALL SELECT '{"name":"Clear Balance Cleanser","category":"Cleanser","starIngredient":"Niacinamide","description":"Helps cleanse oilier areas while maintaining a comfortable feel on drier parts of the skin.","visible":true}', 'Combination'
  UNION ALL SELECT '{"name":"Calm Daily Cleanser","category":"Cleanser","starIngredient":"Centella","description":"A gentle cleansing option designed to refresh the skin while helping it feel calm.","visible":false}', 'Sensitive'
  UNION ALL SELECT '{"name":"Calm & Balance Toner","category":"Toner","starIngredient":"Centella","description":"A soothing toner designed to refresh the skin and provide lightweight hydration.","visible":true}', 'Combination'
  UNION ALL SELECT '{"name":"Hydrating Prep Toner","category":"Toner","starIngredient":"Hyaluronic Acid","description":"Adds hydration without a heavy or greasy feel.","visible":true}', 'Combination'
  UNION ALL SELECT '{"name":"Balance Gentle Toner","category":"Toner","starIngredient":"Niacinamide","description":"Helps support oil balance and improve the appearance of uneven skin texture.","visible":true}', 'Combination'
  UNION ALL SELECT '{"name":"SunVeil SPF 50 PA+++","category":"Sunscreen","starIngredient":"","description":"Provides daily sun protection with a lightweight finish suitable for combination skin.","visible":true}', 'Combination'
  UNION ALL SELECT '{"name":"Airy Shield SPF50 PA+++","category":"Sunscreen","starIngredient":"Niacinamide","description":"A light sunscreen designed to protect the skin without adding a heavy feel.","visible":true}', 'Combination'
) AS v
WHERE NOT EXISTS (
  SELECT 1 FROM ingredient_clash_rules r
  WHERE r.ingredient_id_1 IS NULL
    AND r.ingredient_id_2 IS NULL
    AND r.severity_level = 'GlowCouncil'
    AND r.warning_text = v.payload COLLATE utf8mb4_general_ci
    AND r.source_reference = v.skin COLLATE utf8mb4_general_ci
);
