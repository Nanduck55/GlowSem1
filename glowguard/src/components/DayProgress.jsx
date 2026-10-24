// Shared by the Routine and Tracker week strips.
// Shows how much of a day's routine is finished:
//   nothing done  -> faint grey ring
//   AM done only  -> left half yellow
//   PM done only  -> right half violet
//   AM + PM done  -> solid green circle with a check
// A period with no products is "not applicable" and ignored, so a day that
// only has AM products counts as full once AM is finished.

// Work out one period (AM or PM) for a day's routine items.
export function periodState(dayItems, products, period) {
  let total = 0
  let done = 0

  for (const item of dayItems || []) {
    const product = products.find((p) => String(p.id) === String(item.productId))
    if (!product) continue
    if ((period === 'PM' ? item.removedPM : item.removedAM) === true) continue

    const t = String(product.timeOfDay || '').toUpperCase()
    if (!(t === period || t === 'BOTH' || t === '')) continue

    total++
    if ((period === 'PM' ? item.completedPM : item.completedAM) === true) done++
  }

  return { total, done, finished: total > 0 && done === total }
}

// Returns { am, pm, level } where level is 'none' | 'half' | 'full'.
export function dayProgress(dayItems, products) {
  const am = periodState(dayItems, products, 'AM')
  const pm = periodState(dayItems, products, 'PM')
  const applicable = [am, pm].filter((x) => x.total > 0)
  const finishedCount = applicable.filter((x) => x.finished).length

  let level = 'none'
  if (applicable.length && finishedCount === applicable.length) level = 'full'
  else if (finishedCount > 0) level = 'half'

  return { am, pm, level }
}

// Text for aria-labels / tooltips.
export function progressLabel({ am, pm, level }) {
  if (level === 'full') return 'all routines done'
  if (level === 'half') return am.finished ? 'AM done' : 'PM done'
  return 'nothing done yet'
}

const RING_COLORS = { none: '#6b7f74', am: '#facc15', pm: '#a78bfa', full: '#22c55e' }

export function DayRing({ am, pm, level }) {
  const key = level === 'full' ? 'full' : level === 'half' ? (am.finished ? 'am' : 'pm') : 'none'
  const color = RING_COLORS[key]
  const grow = (on) => ({
    transformOrigin: '10px 10px',
    transform: on ? 'scaleX(1)' : 'scaleX(0)',
    transition: 'transform .4s ease',
  })

  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true">
      <circle
        cx="10" cy="10" r="8"
        fill={level === 'full' ? color : 'none'}
        stroke={color}
        strokeWidth="1.8"
        opacity={level === 'none' ? 0.5 : 1}
        style={{ transition: 'fill .4s ease, stroke .4s ease, opacity .4s ease' }}
      />
      <path d="M10 2A8 8 0 0 0 10 18Z" fill={color} style={grow(key === 'am')} />
      <path d="M10 2A8 8 0 0 1 10 18Z" fill={color} style={grow(key === 'pm')} />
      <path
        d="M6.3 10.4l2.6 2.6 4.8-5.2"
        fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
        style={{ opacity: level === 'full' ? 1 : 0, transition: 'opacity .3s ease .15s' }}
      />
    </svg>
  )
}

// Small key shown under the week strip.
export function DayLegend() {
  const done = { finished: true, total: 1 }
  const todo = { finished: false, total: 1 }
  const items = [
    { label: 'Nothing done', props: { am: todo, pm: todo, level: 'none' } },
    { label: 'AM done (yellow)', props: { am: done, pm: todo, level: 'half' } },
    { label: 'PM done (violet)', props: { am: todo, pm: done, level: 'half' } },
    { label: 'AM + PM done (green)', props: { am: done, pm: done, level: 'full' } },
  ]

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-4 text-[11px] sm:text-xs text-muted">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-2">
          <DayRing {...it.props} />
          {it.label}
        </span>
      ))}
    </div>
  )
}