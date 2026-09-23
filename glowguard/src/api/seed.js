// Default clash rules — mirror of the "Safety Clash Rule" panel in the UI.
export const DEFAULT_CLASH_RULES = [
  { id: 1, a: 'Retinol', b: 'Salicylic Acid / BHA', message: 'Retinol + Salicylic Acid/BHA may increase irritation when used together in the same routine.' },
  { id: 2, a: 'Retinol', b: 'Glycolic Acid', message: 'Retinol + Glycolic Acid (AHA) can over-exfoliate — separate into different routines or alternate days.' },
  { id: 3, a: 'Vitamin C', b: 'Retinol', message: 'Vitamin C + Retinol can be irritating together — use Vitamin C in the AM and Retinol in the PM.' },
]

export const DEFAULT_INGREDIENTS = [
  'Hyaluronic Acid', 'Retinol', 'Salicylic Acid / BHA',
  'Glycolic Acid', 'Centella', 'Vitamin C', 'Niacinamide', 'None',
]

export const CATEGORIES = [
  'Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen', 'Exfoliant', 'Mask', 'Other',
]

// Matches your screenshots' demo shelf.
export const DEFAULT_PRODUCTS = [
  { id: 1, name: 'Celeteque Exfoliating Cleanser', category: 'Cleanser', timeOfDay: 'PM', actives: ['Salicylic Acid / BHA'] },
  { id: 2, name: 'Soul Apothecary Age Rewind Serum', category: 'Serum', timeOfDay: 'PM', actives: ['Retinol'] },
  { id: 3, name: "Johnson's Milk + Rice", category: 'Moisturizer', timeOfDay: 'Both', actives: [] },
  { id: 4, name: 'Rhode Hydrating Toner', category: 'Toner', timeOfDay: 'AM', actives: ['Hyaluronic Acid'] },
  { id: 5, name: 'Hello Glow Sunscreen Gel', category: 'Sunscreen', timeOfDay: 'AM', actives: [] },
]
