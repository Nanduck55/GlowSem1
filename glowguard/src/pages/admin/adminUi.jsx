// Shared look-and-feel for the admin area (matches the admin design mockups).

export const cardCls =
  'bg-[#e1eadb] rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,.18)]'

// ---- icons + summary card (same look as the Statistics page cards) ---------

const iconProps = {
  className: 'h-6 w-6',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export const UsersIcon = () => (
  <svg {...iconProps}><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3.5 19c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5M15.5 14.8c2.4-.2 4.3 1.1 5 4" /></svg>
)
export const UserPlusIcon = () => (
  <svg {...iconProps}><circle cx="10" cy="8" r="3.5" /><path d="M3.5 19c.6-3.2 3-5 6.5-5s5.9 1.8 6.5 5" /><path d="M19 8v6M16 11h6" /></svg>
)
export const UserXIcon = () => (
  <svg {...iconProps}><circle cx="10" cy="8" r="3.5" /><path d="M3.5 19c.6-3.2 3-5 6.5-5s5.9 1.8 6.5 5" /><path d="m17 8.5 4 4M21 8.5l-4 4" /></svg>
)
export const PulseIcon = () => (
  <svg {...iconProps}><path d="M3 12h4l2.5-6 4 12 2.5-6H21" /></svg>
)
export const InboxIcon = () => (
  <svg {...iconProps}><path d="M4 13l2.5-7h11L20 13v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5Z" /><path d="M4 13h4.5l1 2h5l1-2H20" /></svg>
)
export const XCircleIcon = () => (
  <svg {...iconProps}><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6M15 9l-6 6" /></svg>
)

// Icon badge on the left, label and number beside it (stacked on phones,
// where three cards share one row).
export function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className={`${cardCls} flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-3 sm:px-3.5 py-3 sm:py-3.5`}>
      <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-[#41694b]/15 text-gg-600">
        <Icon />
      </span>
      <div className="min-w-0">
        <p className="text-xs sm:text-[13px] font-semibold tracking-tight text-black leading-tight">{label}</p>
        <p className="mt-1 text-3xl sm:text-4xl font-semibold leading-none text-black">{value}</p>
      </div>
    </div>
  )
}

export const inputCls =
  'w-full px-3 py-1.5 rounded-lg border border-[#1f2a24] bg-white text-sm text-black ' +
  'focus:outline-none focus:ring-2 focus:ring-[#41694b]/40 disabled:text-black'

export const btnGreen =
  'inline-flex items-center justify-center px-5 py-1.5 rounded-lg bg-[#41694b] text-white text-sm font-semibold ' +
  'shadow-[0_2px_4px_rgba(0,0,0,.25)] hover:bg-[#345a3e] transition disabled:opacity-60'

export const btnRed =
  'inline-flex items-center justify-center px-5 py-1.5 rounded-lg bg-[#f26b6b] text-white text-sm font-semibold ' +
  'shadow-[0_2px_4px_rgba(0,0,0,.25)] hover:bg-[#e25757] transition disabled:opacity-60'

export const btnOutline =
  'inline-flex items-center justify-center px-5 py-1.5 rounded-lg bg-white border border-[#1f2a24] text-black text-sm ' +
  'font-medium hover:bg-[#f1f5ee] transition'

export function PageTitle({ children, sub }) {
  return (
    <div className="mb-5 sm:mb-6">
      <h1 className="text-2xl sm:text-3xl font-semibold text-black">{children}</h1>
      {sub && <p className="mt-1.5 sm:mt-2 text-base sm:text-lg font-medium text-black max-w-2xl">{sub}</p>}
    </div>
  )
}

export function StatusBadge({ active, large = false }) {
  const size = large ? 'px-3 py-1 text-base font-bold' : 'px-2.5 py-0.5 text-[11px] font-bold'
  return active ? (
    <span className={`inline-block rounded-md bg-[#dcf5e3] text-[#0c8a3a] ${size}`}>Active</span>
  ) : (
    <span className={`inline-block rounded-md bg-[#fbd5d9] text-[#e0334c] ${size}`}>Deactivated</span>
  )
}

export function Loading({ children = 'Loading…' }) {
  return <p className="text-sm text-[#59645d] py-10 text-center">{children}</p>
}

export const formatDate = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export const padId = (id) => String(id).padStart(3, '0')

// Human-readable label for a user's role. 'consultant' reads as "Beauty
// Consultant" instead of just capitalizing the raw stored value.
export function roleLabel(role) {
  if (role === 'consultant') return 'Beauty Consultant'
  if (role === 'admin') return 'Admin'
  return 'User'
}