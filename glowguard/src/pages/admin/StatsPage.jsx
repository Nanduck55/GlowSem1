import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAdminStats } from '../../api/services'
import ExportButton from '../../components/ExportButton'
import { buildAdminStatsExport } from '../../api/exportData'
import {
  PageTitle, Loading, cardCls, btnGreen, btnOutline,
  UsersIcon, UserPlusIcon, PulseIcon, InboxIcon,
} from './adminUi'

const RANGES = [7, 30, 90]

// ---- small pieces ---------------------------------------------------------

const ChevronIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 6l6 6-6 6" />
  </svg>
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
        className="text-gg-600 hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#41694b]/50 rounded-full"
      >
        <InfoIcon size={small ? 16 : 18} />
      </button>
      {open && (
        <span
          role="tooltip"
          className={`absolute top-full mt-2 z-30 w-64 max-w-[calc(100vw-3rem)] whitespace-normal break-words rounded-xl bg-[#17502f] p-3 text-left text-xs font-normal normal-case tracking-normal leading-snug text-white shadow-lg ${right ? 'right-0' : 'left-0'}`}
        >
          {text}
        </span>
      )}
    </span>
  )
}

// Badge on the left, text in the middle, arrow on the right. The arrow opens
// the matching page (`to`) or scrolls to the matching chart (`scrollTo`).
function StatCard({ icon: Icon, label, value, description, tip, tipRight, to, scrollTo, goLabel }) {
  const arrowCls =
    'shrink-0 self-center -mr-1 flex h-8 w-7 items-center justify-center rounded-full text-black hover:bg-[#41694b]/15 ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#41694b]/50'
  return (
    <div className={`${cardCls} flex items-stretch gap-3 px-3.5 py-3.5`}>
      <span className="flex h-10 w-10 shrink-0 self-start items-center justify-center rounded-full bg-[#41694b]/15 text-gg-600">
        <Icon />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold tracking-tight text-black leading-tight">
          {label}
          <span className="ml-1 whitespace-nowrap"><InfoTip text={tip} right={tipRight} small /></span>
        </p>
        <p className="mt-1 text-4xl font-semibold leading-none text-black">{value}</p>
        <p className="mt-1.5 text-xs leading-snug text-muted">{description}</p>
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

function Panel({ id, title, tip, subtitle, children }) {
  return (
    <div id={id} className={`${cardCls} p-5 sm:p-6 scroll-mt-4`}>
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-black">
          <span>{title}</span>
          <InfoTip text={tip} />
        </h2>
        {subtitle && <p className="mt-1 text-sm leading-snug text-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

// A label, a bar sized against the largest value, and the number.
function BarRows({ rows, empty = 'No data yet.' }) {
  const max = Math.max(1, ...rows.map((r) => r.count))
  if (!rows.length) return <p className="text-sm text-muted">{empty}</p>
  return (
    <ul className="space-y-3.5">
      {rows.map((r) => (
        <li key={r.label} className="flex items-center gap-3 sm:gap-4 text-sm sm:text-base text-black">
          <span className="w-28 sm:w-44 shrink-0 leading-tight">{r.label}</span>
          <span className="flex-1 h-2.5 sm:h-3 rounded-full bg-[#41694b]/15 overflow-hidden">
            <span className="block h-full rounded-full bg-[#41694b]" style={{ width: `${(r.count / max) * 100}%` }} />
          </span>
          <span className="w-8 text-right font-semibold">{r.count}</span>
        </li>
      ))}
    </ul>
  )
}

// ---- page -----------------------------------------------------------------

export default function StatsPage() {
  const [days, setDays] = useState(30)
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    setError('')
    fetchAdminStats(days)
      .then((data) => alive && setStats(data))
      .catch((e) => alive && setError(e.response?.data?.error || 'Could not load statistics.'))
    return () => { alive = false }
  }, [days])

  const weekMax = Math.max(1, ...(stats?.signups ?? []).map((w) => w.count))
  const checkinRows = stats
    ? [{ label: 'AM routines', count: stats.checkins.am }, { label: 'PM routines', count: stats.checkins.pm }]
    : []

  return (
    <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[95rem]">
      <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <PageTitle sub="Insights on accounts and routine activity across GlowGuard.">Statistics</PageTitle>
        <div className={`${cardCls} flex max-w-md items-start gap-2.5 px-4 py-3 text-xs sm:text-sm leading-snug text-muted`}>
          <span className="mt-0.5 shrink-0 text-gg-600"><InfoIcon size={16} /></span>
          <p>Statistics count regular app users only. Admin and consultant accounts are not included.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5 sm:mb-6">
        {RANGES.map((d) => (
          <button key={d} className={d === days ? btnGreen : btnOutline} onClick={() => setDays(d)}>
            {d} days
          </button>
        ))}
        <div className="ml-auto">
          <ExportButton
            className={btnOutline}
            filename={`glowguard-statistics-${days}d`}
            disabled={!stats}
            getData={() => buildAdminStatsExport(stats, days)}
          />
        </div>
      </div>

      {error && <p className="text-sm font-semibold text-[#e0334c] mb-4">{error}</p>}
      {!stats && !error && <Loading />}

      {stats && (
        <div className="space-y-5 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              icon={UsersIcon}
              label="Total Users"
              value={stats.totals.users}
              description="Regular app users only, not admins or consultants."
              tip="Accounts with the User role, including deactivated ones. User Management also lists admins and consultants, so its total is higher."
              to="/admin/users"
              goLabel="Open User Management"
            />
            <StatCard
              icon={UserPlusIcon}
              label="New Users"
              value={stats.totals.newUsers}
              description={`Accounts created in the last ${days} days.`}
              tip="Regular users who signed up within the selected number of days."
              tipRight
              scrollTo="signups-panel"
              goLabel="Jump to the sign-ups chart"
            />
            <StatCard
              icon={PulseIcon}
              label="Active Users"
              value={stats.totals.activeUsers}
              description={`Users who ticked off a routine product in the last ${days} days.`}
              tip="Different users who marked at least one routine product as done within the selected number of days."
              scrollTo="checkins-panel"
              goLabel="Jump to the routine check-ins chart"
            />
            <StatCard
              icon={InboxIcon}
              label="Pending Requests"
              value={stats.totals.pendingRequests}
              description="Staff account requests waiting for approval."
              tip="Admin and consultant sign-ups that have not been approved or rejected yet. Open Requests to review them."
              tipRight
              to="/admin/requests"
              goLabel="Open Requests"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              <Panel
                id="signups-panel"
                title="New sign-ups per week"
                tip="Regular users who joined in each of the last 8 weeks. Weeks start on Monday. The 7, 30 and 90 day buttons do not change this chart."
                subtitle="Last 8 weeks, weeks start on Monday."
              >
                <div className="flex items-end gap-2 sm:gap-3 h-44">
                  {stats.signups.map((w) => (
                    <div key={w.label} className="flex-1 min-w-0 h-full flex flex-col justify-end items-center">
                      <span className="text-xs font-semibold mb-1 text-black">{w.count}</span>
                      <div className="w-full rounded-t-md bg-[#41694b]" style={{ height: `${Math.max(2, (w.count / weekMax) * 100)}%` }} />
                      <span className="mt-1 text-[10px] sm:text-xs text-muted whitespace-nowrap">{w.label}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
            <Panel
              title="Users by skin type"
              tip={'Skin type saved on each user\'s profile. "Normal Skin" and "Normal" are counted together. "Not set" means no skin type has been saved yet.'}
            >
              <BarRows rows={stats.skinTypes} />
            </Panel>
          </div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <Panel
              title="Most-added products"
              tip="Products ranked by how many different users have them on their shelf. Custom products with the same name are counted together."
              subtitle="Number of people who have the product on their shelf."
            >
              <BarRows rows={stats.topProducts.map((p) => ({ label: p.name, count: p.count }))} />
            </Panel>
            <Panel
              id="checkins-panel"
              title="Routine check-ins"
              tip="How many times a routine product was ticked off in the selected period, split into morning (AM) and evening (PM)."
              subtitle={`Products ticked off in the last ${days} days.`}
            >
              <BarRows rows={checkinRows} />
            </Panel>
          </div>
        </div>
      )}
    </div>
  )
}