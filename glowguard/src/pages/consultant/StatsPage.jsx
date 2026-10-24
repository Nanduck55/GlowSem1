import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchConsultantStats } from '../../api/services'
import { PageTitle, Loading } from '../admin/adminUi'
import { btnOutline } from './consultantUi'
import ExportButton from '../../components/ExportButton'
import { buildConsultantStatsExport } from '../../api/exportData'

// Lighter pink used on this page only; the other consultant pages keep the standard panel colour.
const lightPanel = 'bg-[#f8dcec] rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,.18)]'

// ---- small pieces ---------------------------------------------------------

const icon = {
  className: 'h-6 w-6',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

const ShieldIcon = () => (
  <svg {...icon}><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" /><path d="M9 12l2 2 4-4" /></svg>
)
const StarIcon = () => (
  <svg {...icon}><path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9l-5.3 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5Z" /></svg>
)
const UsersIcon = () => (
  <svg {...icon}><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3.5 19c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5M15.5 14.8c2.4-.2 4.3 1.1 5 4" /></svg>
)
const WarnIcon = () => (
  <svg {...icon}><path d="M12 4l9 16H3L12 4Z" /><path d="M12 10v4M12 17h.01" /></svg>
)

function InfoIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" />
    </svg>
  )
}

// The "i" next to a title: hover, focus or tap to read what the number means.
function InfoTip({ text, right = false, small = false }) {
  const [open, setOpen] = useState(false)
  return (
    <span
      className="relative inline-flex align-middle"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label="What does this mean?"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        className="text-[#7a1456] hover:text-[#5c1a45] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9c1a6b]/50 rounded-full"
      >
        <InfoIcon size={small ? 16 : 18} />
      </button>
      {open && (
        <span
          role="tooltip"
          className={`absolute top-full mt-2 z-30 w-64 max-w-[calc(100vw-3rem)] whitespace-normal break-words rounded-xl bg-[#5c1a45] p-3 text-left text-xs font-normal normal-case tracking-normal leading-snug text-white shadow-lg ${right ? 'right-0' : 'left-0'}`}
        >
          {text}
        </span>
      )}
    </span>
  )
}

const ChevronIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 6l6 6-6 6" />
  </svg>
)

// Badge on the left, text in the middle, arrow on the right. The arrow opens
// the matching page (`to`) or scrolls to the matching section (`scrollTo`).
function StatCard({ icon: Icon, label, value, description, tip, tipRight, to, scrollTo, goLabel }) {
  const arrowCls =
    'shrink-0 self-center -mr-1 flex h-8 w-7 items-center justify-center rounded-full text-black hover:bg-[#9c1a6b]/15 ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9c1a6b]/50'
  return (
    <div className={`${lightPanel} flex items-stretch gap-3 px-3.5 py-3.5`}>
      <span className="flex h-10 w-10 shrink-0 self-start items-center justify-center rounded-full bg-[#9c1a6b]/15 text-[#9c1a6b]">
        <Icon />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold tracking-tight text-black leading-tight">
          {label}
          <span className="ml-1 whitespace-nowrap"><InfoTip text={tip} right={tipRight} small /></span>
        </p>
        <p className="mt-1 text-4xl font-semibold leading-none text-black">{value}</p>
        <p className="mt-1.5 text-xs leading-snug text-[#3d3d3d]">{description}</p>
      </div>
      {to ? (
        <Link to={to} aria-label={goLabel} className={arrowCls}><ChevronIcon /></Link>
      ) : (
        <button
          type="button"
          aria-label={goLabel}
          onClick={() => document.getElementById(scrollTo)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className={arrowCls}
        >
          <ChevronIcon />
        </button>
      )}
    </div>
  )
}

function Panel({ id, title, tip, subtitle, aside, children }) {
  return (
    <div id={id} className={`${lightPanel} p-5 sm:p-6 scroll-mt-4`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-black">
            <span>{title}</span>
            <InfoTip text={tip} />
          </h2>
          {subtitle && <div className="mt-1 text-sm leading-snug text-[#3d3d3d]">{subtitle}</div>}
        </div>
        {aside}
      </div>
      {children}
    </div>
  )
}

function Bar({ value, max, outlined = false }) {
  return (
    <span className="block h-2.5 sm:h-3 w-full rounded-full bg-[#9c1a6b]/15 overflow-hidden">
      <span
        className={`block h-full rounded-full ${outlined ? 'bg-[#fff1f8] border border-[#9c1a6b]' : 'bg-[#9c1a6b]'}`}
        style={{ width: `${max ? (value / max) * 100 : 0}%` }}
      />
    </span>
  )
}

function BarRows({ rows, empty = 'No data yet.' }) {
  const max = Math.max(1, ...rows.map((r) => r.count))
  if (!rows.length) return <p className="text-sm text-[#3d3d3d]">{empty}</p>
  return (
    <ul className="space-y-3.5">
      {rows.map((r) => (
        <li key={r.label} className="flex items-center gap-3 sm:gap-4 text-sm sm:text-base text-black">
          <span className="w-28 sm:w-44 shrink-0 leading-tight">{r.label}</span>
          <span className="flex-1"><Bar value={r.count} max={max} /></span>
          <span className="w-8 text-right font-semibold">{r.count}</span>
        </li>
      ))}
    </ul>
  )
}

function Legend() {
  return (
    <div className="flex items-center gap-5 text-sm text-black">
      <span className="flex items-center gap-2">
        <span className="h-3.5 w-3.5 rounded-full bg-[#9c1a6b]" /> Users
      </span>
      <span className="flex items-center gap-2">
        <span className="h-3.5 w-3.5 rounded-full bg-[#fff1f8] border border-[#9c1a6b]" /> Visible Recommendations
      </span>
    </div>
  )
}

function coverageStatus(c) {
  if (c.users === 0) return { label: 'No users yet', cls: 'bg-white/70 text-[#5b5b5b]' }
  if (c.needsMore) return { label: 'Needs more picks', cls: 'bg-[#fbd5d9] text-[#a3102a]' }
  return { label: 'Well covered', cls: 'bg-[#d7f2de] text-[#14532d]' }
}

// ---- page -----------------------------------------------------------------

export default function StatsPage() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    fetchConsultantStats()
      .then((data) => alive && setStats(data))
      .catch((e) => alive && setError(e.response?.data?.error || 'Could not load statistics.'))
    return () => { alive = false }
  }, [])

  const coverageMax = Math.max(1, ...(stats?.coverage ?? []).flatMap((c) => [c.users, c.recommendations]))

  return (
    <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-[90rem]">
      <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <PageTitle sub="Insights on safety rules, recommendations, and user data from GlowGuard.">
          Statistics
        </PageTitle>
        <div className={`${lightPanel} flex max-w-md items-start gap-2.5 px-4 py-3 text-xs sm:text-sm leading-snug text-[#3d3d3d]`}>
          <span className="mt-0.5 shrink-0 text-[#7a1456]"><InfoIcon size={16} /></span>
          <p>Statistics reflect current safety rules, published recommendations, and users' saved skincare products.</p>
        </div>
      </div>

      <div className="mb-5 flex justify-end">
        <ExportButton
          className={btnOutline}
          filename="glowguard-consultant-statistics"
          disabled={!stats}
          getData={() => buildConsultantStatsExport(stats)}
        />
      </div>

      {error && <p className="text-sm font-semibold text-[#a3102a] mb-4">{error}</p>}
      {!stats && !error && <Loading />}

      {stats && (
        <div className="space-y-5 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              icon={ShieldIcon}
              label="Clash Rules"
              value={stats.totals.rules}
              description="Total ingredient interaction rules in the system."
              tip="Every ingredient interaction rule saved in the system, including Info and Potential Conflict rules."
              to="/consultant/rules"
              goLabel="Open Safety Clash Rules"
            />
            <StatCard
              icon={StarIcon}
              label="Visible Recommendations"
              value={stats.totals.visibleRecs}
              description="Consultant-curated recommendations available to users."
              tip="Recommendations that are set to visible, so users can see them."
              tipRight
              to="/consultant/curation"
              goLabel="Open Curation"
            />
            <StatCard
              icon={UsersIcon}
              label="Skin Types Well Covered"
              value={`${stats.totals.wellCovered} of ${stats.totals.skinTypeCount}`}
              description="Skin types meeting the recommendation coverage threshold."
              tip="A skin type is well covered when it has at least 1 visible recommendation for every 3 users with that skin type."
              scrollTo="coverage-panel"
              goLabel="Jump to the skin type coverage chart"
            />
            <StatCard
              icon={WarnIcon}
              label="Users With Flagged Pairings"
              value={stats.totals.usersWithClash}
              description="Unique users with ingredient pairings flagged by a safety rule."
              tip="Users whose saved products contain both ingredients of at least one rule. It does not mean they use them together."
              tipRight
              scrollTo="pairings-panel"
              goLabel="Jump to the flagged pairings chart"
            />
          </div>

          <div className="grid lg:grid-cols-5 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              <Panel
                title="Interaction Rules by Classification"
                tip="How many rules exist for each classification. Info rules are compatibility notes, not warnings."
              >
                <BarRows rows={stats.severities} empty="No rules yet." />
              </Panel>
            </div>
            <div className="lg:col-span-3">
              <Panel
                id="pairings-panel"
                title="Most Common Flagged Ingredient Pairings"
                tip="Pairings of two ingredients covered by a rule, ranked by how many users have both in their saved products."
                subtitle={
                  <>
                    <p>Number of users who have both ingredients in their saved products.</p>
                    <p>A flagged pairing does not necessarily indicate unsafe use.</p>
                  </>
                }
              >
                <BarRows rows={stats.topClashes} empty="No user has a flagged pairing in their saved products." />
              </Panel>
            </div>
          </div>

          <Panel
            id="coverage-panel"
            title="Recommendations vs. Users, by Skin Type"
            tip="Compares how many users have each skin type with how many visible recommendations exist for it."
            subtitle="Compare the number of users per skin type with the available recommendations for each."
            aside={<Legend />}
          >
            <ul className="space-y-4">
              {stats.coverage.map((c) => {
                const status = coverageStatus(c)
                return (
                  <li
                    key={c.skinType}
                    className="grid grid-cols-[5.5rem_1fr_3.5rem] sm:grid-cols-[7.5rem_1fr_4rem_9rem] items-center gap-x-3 sm:gap-x-4 gap-y-1.5 text-sm sm:text-base text-black"
                  >
                    <span>{c.skinType}</span>
                    <span className="space-y-1">
                      <Bar value={c.users} max={coverageMax} />
                      <Bar value={c.recommendations} max={coverageMax} outlined />
                    </span>
                    <span className="text-right font-semibold whitespace-nowrap">{c.users} / {c.recommendations}</span>
                    <span className={`col-span-3 sm:col-span-1 justify-self-start sm:justify-self-end rounded-md px-2.5 py-1 text-xs sm:text-sm font-semibold ${status.cls}`}>
                      {status.label}
                    </span>
                  </li>
                )
              })}
            </ul>
            <p className="mt-5 text-xs sm:text-sm leading-snug text-[#3d3d3d]">
              Numbers show users / visible recommendations. "Needs more picks" means fewer than 1 visible recommendation for every 3 users.
            </p>
          </Panel>
        </div>
      )}
    </div>
  )
}