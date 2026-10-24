// Safety message colours (Routine page, Add/Edit Product form, Recommendations):
//   Potential Conflict -> orange (#f89341)
//   Caution            -> coral  (#ff6b5e)
//   Info               -> green  (#4fb477)
// Older rules saved as High / High Risk map to Potential Conflict, Moderate /
// Moderate Risk map to Caution. Anything unknown stays Potential Conflict.
// The colours themselves live in index.css (.sev-conflict / .sev-caution / .sev-info).
const RANK = { conflict: 0, caution: 1, info: 2 }

export const TONE_LABEL = {
  conflict: 'Potential Conflict',
  caution: 'Caution',
  info: 'Info',
}

export function severityTone(severity) {
  const s = String(severity || '').trim().toLowerCase()
  if (s.startsWith('info')) return 'info'
  if (s.startsWith('caution') || s.startsWith('moderate')) return 'caution'
  return 'conflict'
}

export const toneClass = (severity) => `sev-${severityTone(severity)}`

// The most serious tone in a list of rules (conflict > caution > info).
export function worstTone(rules) {
  let worst = 'info'
  for (const r of rules) {
    const tone = severityTone(r.severity)
    if (RANK[tone] < RANK[worst]) worst = tone
  }
  return worst
}

// Most serious first. `pick` reaches the rule inside an item.
export function sortBySeverity(list, pick = (x) => x) {
  return [...list].sort(
    (a, b) => RANK[severityTone(pick(a).severity)] - RANK[severityTone(pick(b).severity)]
  )
}