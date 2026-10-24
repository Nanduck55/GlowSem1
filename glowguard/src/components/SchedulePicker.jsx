// Day picker used by Routine → Add a Product (both the "New product" form and
// the "From my shelf" tab). Days run Monday → Sunday: days[0] = Monday ...
// days[6] = Sunday. The parent keeps the state; this only draws it.
const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const SCHEDULE_SPANS = [
  { label: 'Not set (this week only)', span: 0 },
  { label: '1 week', span: 7 },
  { label: '4 weeks', span: 28 },
  { label: '2 months', span: 60 },
]
const SCHEDULE_PRESETS = [
  { label: 'Just this day', days: (wd) => Array.from({ length: 7 }, (_, i) => i === wd) },
  { label: 'Every day', days: () => Array(7).fill(true) },
  { label: 'Weekdays', days: () => Array.from({ length: 7 }, (_, i) => i < 5) },
  { label: '2x a week', days: () => Array.from({ length: 7 }, (_, i) => i === 0 || i === 3) },
]

// Monday = 0 for a YYYY-MM-DD key.
export const weekdayIndex = (key) => {
  const [y, m, d] = key.split('-').map(Number)
  return (new Date(y, m - 1, d).getDay() + 6) % 7
}

// The dates a product is added to: starting at `startKey` (YYYY-MM-DD), for
// `span` days, only on the weekdays that were picked. "Not set" (span 0) means
// just the coming week (7 days), the same as on the Routine page.
const pad2 = (n) => String(n).padStart(2, '0')
export const scheduleDates = (startKey, days, span) => {
  const [y, m, d] = startKey.split('-').map(Number)
  const count = span || 7
  const out = []
  for (let i = 0; i < count; i++) {
    const day = new Date(y, m - 1, d + i)
    if (days[(day.getDay() + 6) % 7]) {
      out.push(`${day.getFullYear()}-${pad2(day.getMonth() + 1)}-${pad2(day.getDate())}`)
    }
  }
  return out
}

export const summarizeSchedule = (days, span) => {
  const picked = DAY_NAMES.filter((_, i) => days[i])
  if (picked.length === 0) return 'Pick at least one day.'
  const label = span ? SCHEDULE_SPANS.find((s) => s.span === span)?.label : null
  return `${picked.length === 7 ? 'Every day' : picked.join(', ')} · ${picked.length} ${picked.length === 1 ? 'day' : 'days'} a week${label ? ` · ${label}` : ''}`
}

// `onLight`: use fixed dark-on-light colours, for windows that stay light green in dark mode.
export default function SchedulePicker({ days, setDays, span, setSpan, viewedWeekday, onLight = false }) {
  const labelCls = onLight ? 'text-sm font-bold text-[#1c2b22]' : 'label !mb-0'
  const mutedCls = onLight ? 'text-[#3a4a40]' : 'text-muted'
  const idleChip = onLight
    ? 'bg-[#f7faf5] text-[#1c2b22] border-[#9db39b] hover:border-gg-600'
    : 'bg-white text-ink border-gg-300 hover:border-gg-600'
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 mb-2">
        <span className={labelCls}>Which days?</span>
        <div className="flex flex-wrap gap-x-3 text-xs font-bold">
          {SCHEDULE_PRESETS.map((p) => (
            <button
              type="button"
              key={p.label}
              onClick={() => setDays(p.days(viewedWeekday))}
              className="text-gg-600 hover:underline"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-between gap-1.5">
        {DAY_LETTERS.map((l, i) => (
          <button
            type="button"
            key={DAY_NAMES[i]}
            aria-label={DAY_NAMES[i]}
            aria-pressed={days[i]}
            onClick={() => setDays(days.map((v, j) => (j === i ? !v : v)))}
            className={`w-10 h-10 rounded-full border text-sm font-bold transition
              ${days[i]
                ? 'bg-gg-600 text-white border-gg-600 shadow'
                : idleChip}`}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-4">
        <label className={labelCls} htmlFor="schedule-span">For <span className={`font-normal ${mutedCls}`}>(optional)</span></label>
        <select
          id="schedule-span"
          className="input flex-1"
          value={span}
          onChange={(e) => setSpan(Number(e.target.value))}
        >
          {SCHEDULE_SPANS.map((s) => (
            <option key={s.span} value={s.span}>{s.label}</option>
          ))}
        </select>
      </div>
      <p className={`text-xs mt-2 ${mutedCls}`}>{summarizeSchedule(days, span)}</p>
    </div>
  )
}