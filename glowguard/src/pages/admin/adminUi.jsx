// Shared look-and-feel for the admin area (matches the admin design mockups).

export const cardCls =
  'bg-[#e1eadb] rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,.18)]'

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
