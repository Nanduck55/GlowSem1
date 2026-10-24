import { api } from './client'
import { CATEGORIES, SEVERITY_LEVELS } from './constants'

/**
 * Builds the data for every Export button (user, admin and consultant).
 * Each builder returns { title, sections: [{ heading?, columns, rows }] },
 * which components/ExportButton.jsx turns into a CSV or a printable page.
 *
 * Nothing here writes anything — exports only read what the pages already
 * load, plus one read-only endpoint (glowguard-backend/export.php) for the
 * user's own routine history.
 */

const dayOnly = (value) => (value ? String(value).slice(0, 10) : '')
const roleName = (role) =>
  role === 'consultant' ? 'Beauty Consultant' : role === 'admin' ? 'Admin' : 'User'
const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '')
const timeLabel = (t) => (t === 'Both' ? 'AM & PM' : t || '')

// Splits rows into one section per group (one Excel tab each), in a set order,
// then any other groups in the order they appear. Empty groups are left out.
function groupSections(items, keyOf, order, columns, toRow) {
  const keys = [...order, ...new Set(items.map(keyOf).filter((k) => !order.includes(k)))]
  const sections = keys
    .map((key) => ({
      heading: key || 'Other',
      columns,
      rows: items.filter((i) => keyOf(i) === key).map(toRow),
    }))
    .filter((sec) => sec.rows.length > 0)
  return sections.length ? sections : [{ columns, rows: [] }]
}

/* ------------------------------------------------------------------ */
/*  USER — own routine, progress and shelf                              */
/* ------------------------------------------------------------------ */

export const USER_RANGES = [
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'all', label: 'All time' },
]

const keyOf = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function rangeBounds(range) {
  const now = new Date()
  if (range === 'week') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    start.setDate(start.getDate() + (start.getDay() === 0 ? -6 : 1 - start.getDay()))
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    return { from: keyOf(start), to: keyOf(end) }
  }
  if (range === 'month') {
    return {
      from: keyOf(new Date(now.getFullYear(), now.getMonth(), 1)),
      to: keyOf(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    }
  }
  return {}
}

const rangeLabel = (range) => USER_RANGES.find((r) => r.value === range)?.label ?? 'All time'

async function fetchRoutineExport(range) {
  const { from, to } = rangeBounds(range)
  const { data } = await api.get('/export.php', { params: { ...(from && { from }), ...(to && { to }) } })
  return data
}

function routineSections(data) {
  return [
    {
      heading: 'Daily progress',
      columns: ['Date', 'Completed', 'Total', 'Progress'],
      rows: data.days.map((d) => [
        d.date,
        d.completed,
        d.total,
        d.total ? `${Math.round((d.completed / d.total) * 100)}%` : '—',
      ]),
    },
    {
      heading: 'Routine details',
      columns: ['Date', 'Time of day', 'Product', 'Category', 'Status'],
      rows: data.items.map((i) => [i.date, i.period, i.product, i.category, i.done ? 'Done' : 'Not done']),
    },
  ]
}

function shelfSection(products) {
  return {
    heading: 'My shelf',
    columns: ['Product', 'Category', 'Time of day', 'Active ingredients', 'Times used'],
    rows: products.map((p) => [
      p.name,
      p.category,
      timeLabel(p.timeOfDay),
      (p.actives ?? []).join('; '),
      p.uses ?? 0,
    ]),
  }
}

export async function buildRoutineExport(range) {
  const data = await fetchRoutineExport(range)
  return { title: `My Routine & Progress — ${rangeLabel(range)}`, sections: routineSections(data) }
}

export function buildShelfExport(products) {
  return { title: 'My Shelf', sections: [shelfSection(products)] }
}

// Account page: profile basics + shelf + the whole routine history.
export async function buildMyDataExport(user, products) {
  const data = await fetchRoutineExport('all')
  return {
    title: 'My GlowGuard Data',
    sections: [
      {
        heading: 'Profile',
        columns: ['Field', 'Value'],
        rows: [
          ['Name', user?.name ?? ''],
          ['Email', user?.email ?? ''],
          ['Skin type', user?.skinType ?? ''],
          ['Routine goal', user?.skinGoal ?? ''],
          ['Member since', dayOnly(user?.createdAt)],
        ],
      },
      shelfSection(products),
      ...routineSections(data),
    ],
  }
}

/* ------------------------------------------------------------------ */
/*  ADMIN                                                              */
/* ------------------------------------------------------------------ */

export function buildUsersExport(users) {
  return {
    title: 'GlowGuard Users',
    sections: [
      {
        columns: ['Name', 'Email', 'Role', 'Status', 'Joined'],
        rows: users.map((u) => [
          u.name,
          u.email,
          roleName(u.role),
          u.active ? 'Active' : 'Deactivated',
          dayOnly(u.createdAt),
        ]),
      },
    ],
  }
}

export function buildRequestsExport(requests) {
  return {
    title: 'GlowGuard Staff Requests',
    sections: [
      {
        columns: ['Name', 'Email', 'Requested role', 'Status', 'Requested on'],
        rows: requests.map((u) => [
          u.name,
          u.email,
          roleName(u.role),
          capitalize(u.status),
          dayOnly(u.createdAt),
        ]),
      },
    ],
  }
}

export function buildAdminStatsExport(stats, days) {
  return {
    title: `GlowGuard Statistics — last ${days} days`,
    sections: [
      {
        heading: 'Totals',
        columns: ['Measure', 'Value'],
        rows: [
          ['Total users', stats.totals.users],
          [`New users (last ${days} days)`, stats.totals.newUsers],
          [`Active users (last ${days} days)`, stats.totals.activeUsers],
          ['Pending staff requests', stats.totals.pendingRequests],
        ],
      },
      {
        heading: 'New users per week',
        columns: ['Week starting', 'New users'],
        rows: stats.signups.map((w) => [w.label, w.count]),
      },
      {
        heading: 'Users by skin type',
        columns: ['Skin type', 'Users'],
        rows: stats.skinTypes.map((s) => [s.label, s.count]),
      },
      {
        heading: 'Products on the most shelves',
        columns: ['Product', 'Users'],
        rows: stats.topProducts.map((p) => [p.name, p.count]),
      },
      {
        heading: `Routine check-ins (last ${days} days)`,
        columns: ['Routine', 'Products ticked off'],
        rows: [
          ['AM', stats.checkins.am],
          ['PM', stats.checkins.pm],
        ],
      },
    ],
  }
}

/* ------------------------------------------------------------------ */
/*  BEAUTY CONSULTANT                                                  */
/* ------------------------------------------------------------------ */

export function buildRulesExport(rules) {
  return {
    title: 'Safety Clash Rules',
    // One tab per severity: Potential Conflict, Caution, Info.
    sections: groupSections(
      rules,
      (r) => r.severity ?? '',
      SEVERITY_LEVELS,
      ['Ingredient A', 'Ingredient B', 'Severity', 'Source reference', 'Warning'],
      (r) => [r.a, r.b, r.severity ?? '', r.source ?? '', r.message ?? '']
    ),
  }
}

export function buildCurationExport(recommendations) {
  return {
    title: 'GlowCouncil Curation',
    // One tab per product category (Cleanser, Toner, Serum, ...), like the page.
    sections: groupSections(
      recommendations,
      (r) => r.category ?? '',
      CATEGORIES,
      ['Product', 'Category', 'Skin type', 'Time of day', 'Star ingredient', 'Note', 'Visible to users'],
      (r) => [
        r.name,
        r.category,
        r.skinType,
        r.timeOfDay === 'AM' ? 'AM' : r.timeOfDay === 'PM' ? 'PM' : 'Both',
        r.starIngredient ?? '',
        r.description ?? '',
        r.visible ? 'Yes' : 'No',
      ]
    ),
  }
}

export function buildConsultantStatsExport(stats) {
  return {
    title: 'Consultant Statistics',
    sections: [
      {
        heading: 'Totals',
        columns: ['Measure', 'Value'],
        rows: [
          ['Clash rules', stats.totals.rules],
          ['Visible recommendations', stats.totals.visibleRecs],
          [`Skin types well covered (of ${stats.totals.skinTypeCount})`, stats.totals.wellCovered],
          ['Users with a clash on their shelf', stats.totals.usersWithClash],
        ],
      },
      {
        heading: 'Rules by severity',
        columns: ['Severity', 'Rules'],
        rows: stats.severities.map((s) => [s.label, s.count]),
      },
      {
        heading: 'Most common clashes',
        columns: ['Clash', 'Users affected'],
        rows: stats.topClashes.map((c) => [c.label, c.count]),
      },
      {
        heading: 'Recommendation coverage',
        columns: ['Skin type', 'Users', 'Visible recommendations', 'Needs more picks'],
        rows: stats.coverage.map((c) => [c.skinType, c.users, c.recommendations, c.needsMore ? 'Yes' : 'No']),
      },
    ],
  }
}