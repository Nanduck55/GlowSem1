import { DEFAULT_SEVERITY } from '../../api/constants'

// Shared look-and-feel for the Beauty Consultant portal (matches the
// consultant design mockups: plum sidebar, pink panels, magenta buttons).
// The Admin area keeps its own green styles in ../admin/adminUi.jsx.

export const panelCls =
  'bg-[#eab5d7] rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,.18)]'

export const inputCls =
  'w-full px-3 py-1.5 rounded-lg border border-[#1f2a24] bg-white text-sm text-black ' +
  'placeholder:text-[#8b8b8b] focus:outline-none focus:ring-2 focus:ring-[#9c1a6b]/40 ' +
  'read-only:cursor-default disabled:text-black'

const btnBase =
  'inline-flex items-center justify-center px-5 py-1.5 rounded-lg text-sm font-semibold ' +
  'shadow-[0_2px_4px_rgba(0,0,0,.25)] transition disabled:opacity-60'

export const btnPrimary = `${btnBase} bg-[#9c1a6b] text-white hover:bg-[#82165a]`
export const btnDanger = `${btnBase} bg-[#f00a0a] text-white hover:bg-[#d10808]`
export const btnOutline =
  'inline-flex items-center justify-center px-5 py-1.5 rounded-lg bg-white border border-[#1f2a24] text-black text-sm ' +
  'font-medium hover:bg-[#f7e6f0] transition disabled:opacity-60'
// Softer pink buttons used inside recommendation cards (View / Edit Product).
export const btnSoft = `${btnBase} !shadow-none bg-[#d58bbf] text-white hover:bg-[#c675ad] !px-3 !py-1 !text-xs`

/* ------------------------------------------------------------------ */
/*  Severity badge (Safety Clash Rules)                                */
/* ------------------------------------------------------------------ */
const SEVERITY_STYLES = {
  'Potential Conflict': 'bg-[#f89341]',
  Caution: 'bg-[#ff6b5e]',
  Info: 'bg-[#4fb477]',
}

export function SeverityBadge({ severity, large = false }) {
  const level = SEVERITY_STYLES[severity] ? severity : DEFAULT_SEVERITY
  const size = large ? 'px-4 py-1.5 text-sm' : 'px-3 py-1 text-[11px]'
  return (
    <span className={`inline-block rounded-md font-bold text-white text-center whitespace-nowrap ${SEVERITY_STYLES[level]} ${size}`}>
      {level}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Visibility (Curation)                                              */
/* ------------------------------------------------------------------ */
export const EyeIcon = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

export const EyeOffIcon = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M2 12s3.6-7 10-7c2 0 3.8.7 5.3 1.6M22 12s-3.6 7-10 7c-2 0-3.8-.7-5.3-1.6" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    <path d="M3 3l18 18" />
  </svg>
)

// Small round eye badge on a recommendation card: green = shown to users, red = hidden.
export function VisibilityDot({ visible }) {
  return (
    <span
      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-white ${visible ? 'bg-[#4fb477]' : 'bg-[#f00a0a]'}`}
      title={visible ? 'Visible to users' : 'Hidden from users'}
      role="img"
      aria-label={visible ? 'Visible to users' : 'Hidden from users'}
    >
      {visible ? <EyeIcon className="h-3.5 w-3.5" /> : <EyeOffIcon className="h-3.5 w-3.5" />}
    </span>
  )
}

// Wide pill used on the Add / Edit / View recommendation screens.
export function VisibilityPill({ visible, onClick }) {
  const cls = `inline-flex items-center gap-2 rounded-md px-4 py-1.5 text-xs font-semibold text-white ${visible ? 'bg-[#4fb477]' : 'bg-[#f00a0a]'}`
  const content = (
    <>
      {visible ? <EyeIcon /> : <EyeOffIcon />}
      {visible ? 'Visible to Users' : 'Hidden from Users'}
    </>
  )
  if (!onClick) return <span className={cls}>{content}</span>
  return (
    <button type="button" onClick={onClick} className={`${cls} hover:opacity-90 transition`} aria-pressed={visible}>
      {content}
    </button>
  )
}
