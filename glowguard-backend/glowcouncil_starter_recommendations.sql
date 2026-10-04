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
INSERT INTO product_recommendations (product_id, skin_type, star_ingredient, recommendation_note, is_visible)
SELECT 
  p.product_id, 
  v.skin_type, 
  v.star_ingredient, 
  v.description, 
  v.is_visible
FROM (
  SELECT 'Balance Gentle Cleanser' AS title, 'Oily' AS skin_type, 'Salicylic Acid / BHA' AS star_ingredient, 'A gentle cleanser that helps remove excess oil while keeping the skin feeling comfortable.' AS description, 1 AS is_visible
  UNION ALL SELECT 'Hydra Soft Cleanser', 'Dry', 'Hyaluronic Acid', 'Cleanses the skin while providing lightweight hydration for areas that tend to feel dry.', 1
  UNION ALL SELECT 'Clear Balance Cleanser', 'Combination', 'Niacinamide', 'Helps cleanse oilier areas while maintaining a comfortable feel on drier parts of the skin.', 1
  UNION ALL SELECT 'Calm Daily Cleanser', 'Sensitive', 'Centella', 'A gentle cleansing option designed to refresh the skin while helping it feel calm.', 0
  UNION ALL SELECT 'Calm & Balance Toner', 'Combination', 'Centella', 'A soothing toner designed to refresh the skin and provide lightweight hydration.', 1
  UNION ALL SELECT 'Hydrating Prep Toner', 'Combination', 'Hyaluronic Acid', 'Adds hydration without a heavy or greasy feel.', 1
  UNION ALL SELECT 'Balance Gentle Toner', 'Combination', 'Niacinamide', 'Helps support oil balance and improve the appearance of uneven skin texture.', 1
  UNION ALL SELECT 'SunVeil SPF 50 PA+++', 'Combination', '', 'Provides daily sun protection with a lightweight finish suitable for combination skin.', 1
  UNION ALL SELECT 'Airy Shield SPF50 PA+++', 'Combination', 'Niacinamide', 'A light sunscreen designed to protect the skin without adding a heavy feel.', 1
) AS v
JOIN products p ON p.product_name = v.title;