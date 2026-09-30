// Fixed choices used to build dropdowns in the UI. Not user data — these
// don't come from the database, they're just the category enum.
export const CATEGORIES = [
  'Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen', 'Exfoliant', 'Mask', 'Other',
]

// Skin types a GlowCouncil recommendation can be aimed at. The Landing skin
// quiz produces Oily / Dry / Combination / Balanced; Sensitive is available
// for consultants to curate ahead of a quiz result that covers it.
export const SKIN_TYPES = ['Oily', 'Dry', 'Combination', 'Balanced', 'Sensitive']

// Severity of a Safety Clash Rule, most serious first. Stored in the existing
// ingredient_clash_rules.severity_level column.
export const SEVERITY_LEVELS = ['Potential Conflict', 'Caution', 'Info']
export const DEFAULT_SEVERITY = 'Potential Conflict'

// ingredient_clash_rules.source_reference is VARCHAR(45).
export const SOURCE_MAX_LENGTH = 45
