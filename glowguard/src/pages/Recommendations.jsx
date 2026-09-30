import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { CATEGORIES } from '../api/constants'
import { skinTypeKey } from '../api/services'

/* =========================================================
   FOR YOU AND YOUR SKIN
   GlowCouncil recommendations (curated by Beauty Consultants)
   for the skin type saved on the person's account.

   "Add to Routine" reuses the normal shelf + routine APIs:
   it creates the product on the shelf (name, category, star
   ingredient as its active) and puts it in today's routine,
   so nothing here needs its own database tables.
========================================================= */

// Local-time date key (YYYY-MM-DD) — same rule as Routine.jsx (never toISOString(),
// which would shift the day for anyone ahead of UTC).
const dateKey = (d = new Date()) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const SKIN_BLURBS = {
  Oily: 'Oily skin produces extra sebum, so it can look shiny as the day goes on. Lightweight, non-comedogenic products can help keep it feeling fresh.',
  Dry: 'Dry skin can feel tight or flaky when it lacks moisture. Gentle, hydrating products can help it feel comfortable.',
  Combination: 'Combination skin has both oily and dry areas, usually with more oil around the T-zone. Lightweight, balancing products can keep it comfortable.',
  Balanced: 'Balanced skin is generally comfortable, neither too oily nor too dry. A consistent, gentle routine helps keep it that way.',
  Sensitive: 'Sensitive skin can react easily to new products and changes in weather. Gentle, soothing formulas are a good place to start.',
}

const SECTION_HINTS = {
  Cleanser: 'Start with a gentle cleanser suited for your skin type.',
  Toner: 'Add lightweight hydration or balancing support.',
  Serum: 'Target a specific concern with a focused active.',
  Moisturizer: 'Lock in hydration and support your skin barrier.',
  Sunscreen: 'Protect your skin during the day with a daily SPF.',
  Exfoliant: 'Gently refresh dull or uneven skin texture.',
  Mask: 'Give your skin an occasional extra treat.',
  Other: 'More picks from the GlowCouncil.',
}

const WHEN_OPTIONS = [
  { value: 'AM', label: 'AM Routine' },
  { value: 'PM', label: 'PM Routine' },
  { value: 'Both', label: 'Both' },
]

const greenBtn =
  'inline-flex items-center justify-center rounded-lg bg-[#41694b] px-5 py-1.5 text-sm font-semibold text-white ' +
  'shadow-[0_3px_6px_rgba(0,0,0,.28)] transition hover:bg-[#345a3e] disabled:opacity-50 disabled:cursor-not-allowed'

/* Soft botanical artwork for the skin-type card (purely decorative). */
function SkinArt() {
  return (
    <svg viewBox="0 0 240 200" className="h-full w-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <circle cx="190" cy="60" r="78" fill="#c9d9c5" />
      <circle cx="120" cy="170" r="70" fill="#f1d9c4" />
      <circle cx="225" cy="165" r="48" fill="#dbe6d6" />
      <g fill="none" stroke="#9db89c" strokeWidth="2" strokeLinecap="round">
        <path d="M150 190c10-40 30-70 62-96" />
        <path d="M172 150c-16-2-28-10-34-24 16 0 28 8 34 24Z" fill="#b8cfb5" />
        <path d="M190 122c-6-15-3-28 8-38 6 15 3 28-8 38Z" fill="#b8cfb5" />
        <path d="M206 104c14-4 26-1 36 8-14 4-26 1-36-8Z" fill="#b8cfb5" />
      </g>
    </svg>
  )
}

/* ---------------------- one recommendation card ---------------------- */
function RecommendationCard({ rec, onAdd }) {
  return (
    <article className="flex flex-col rounded-xl border border-[#cfdcc9] bg-[#e1eadb] p-4 shadow-[0_1px_3px_rgba(0,0,0,.12)]">
      <h3 className="text-base font-medium leading-snug text-[#1c2b22] break-words">{rec.name}</h3>

      {rec.starIngredient && (
        <>
          <p className="mt-2 text-xs font-semibold text-[#1c2b22]">Star Ingredient</p>
          <span className="mt-1 self-start rounded-md bg-[#dc9bc8] px-2 py-0.5 text-[10px] font-medium text-[#3a1030]">
            {rec.starIngredient}
          </span>
        </>
      )}

      <p className="mt-3 flex-1 text-[13px] leading-relaxed text-[#2d3a32]">{rec.description}</p>

      <button type="button" className={`${greenBtn} mt-4 self-center`} onClick={() => onAdd(rec)}>
        Add to Routine
      </button>
    </article>
  )
}

/* ---------------------- Add to Routine modal ---------------------- */
function AddToRoutineModal({ rec, onClose }) {
  const { products, rules, loadRoutine, saveProduct, addToRoutine, setPeriodRemoved, notify } = useApp()
  const [when, setWhen] = useState('')
  const [busy, setBusy] = useState(false)
  const today = dateKey()

  // Today's routine, so we can warn about clashes with what is already in it
  // and avoid shifting an existing product into a period it wasn't in.
  const [todayItems, setTodayItems] = useState(null)
  useEffect(() => {
    let alive = true
    loadRoutine(today)
      .then((items) => alive && setTodayItems(Array.isArray(items) ? items : []))
      .catch(() => alive && setTodayItems([]))
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !busy && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [busy, onClose])

  const periods = when === 'Both' ? ['AM', 'PM'] : when ? [when] : []

  // Rules the star ingredient would trigger against actives already in today's routine.
  const warnings = useMemo(() => {
    if (!rec.starIngredient || !todayItems || periods.length === 0) return []

    const inPeriod = (p, period) => {
      const t = String(p.timeOfDay || '').toUpperCase()
      return t === period || t === 'BOTH' || t === ''
    }

    const existingActives = new Set()
    todayItems.forEach((item) => {
      const p = products.find((x) => String(x.id) === String(item.productId))
      if (!p) return
      // removedAM / removedPM come from the database with today's routine.
      const shown = periods.some(
        (per) => inPeriod(p, per) && (per === 'PM' ? item.removedPM : item.removedAM) !== true
      )
      if (shown) (p.actives ?? []).forEach((a) => existingActives.add(a))
    })

    return rules.filter(
      (r) =>
        (r.a === rec.starIngredient && existingActives.has(r.b)) ||
        (r.b === rec.starIngredient && existingActives.has(r.a))
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rec, todayItems, when, products, rules])

  const confirmAdd = async () => {
    if (!when || busy) return
    setBusy(true)

    try {
      const sameName = products.find(
        (p) => p.name.trim().toLowerCase() === rec.name.trim().toLowerCase()
      )

      let productId
      let finalTime = when

      if (sameName) {
        // Already on the shelf — reuse it instead of creating a duplicate.
        // If it was set to a different time of day, widen it to AM + PM rather
        // than taking a period away from a product the person already uses.
        productId = sameName.id
        const current = String(sameName.timeOfDay || 'Both')
        finalTime = current.toUpperCase() === when.toUpperCase() ? current : 'Both'
        if (finalTime !== current) await saveProduct({ ...sameName, timeOfDay: finalTime })
      } else {
        const saved = await saveProduct({
          name: rec.name,
          category: rec.category,
          timeOfDay: when,
          actives: rec.starIngredient ? [rec.starIngredient] : [],
        })
        productId = saved.id
      }

      const todayRow = (todayItems ?? []).find((i) => String(i.productId) === String(productId))
      const rowExisted = Boolean(todayRow)
      await addToRoutine(today, productId)

      // A "Both" product is one routine row shared by AM and PM (see Routine.jsx).
      // When only one period was picked, keep it out of the other one for today.
      if (!rowExisted && finalTime.toUpperCase() === 'BOTH' && when !== 'Both') {
        await setPeriodRemoved(today, productId, when === 'AM' ? 'PM' : 'AM', true)
      }

      // It was already in today's routine but had been taken out of a period
      // that was just picked again: bring it back there.
      if (rowExisted) {
        for (const per of periods) {
          if ((per === 'PM' ? todayRow.removedPM : todayRow.removedAM) === true) {
            await setPeriodRemoved(today, productId, per, false)
          }
        }
      }

      const label = when === 'Both' ? 'AM and PM routines' : `${when} routine`
      notify(`"${rec.name}" added to your ${label}.`)
      onClose()
    } catch (error) {
      notify(error.response?.data?.error || 'Could not add this product to your routine.', false)
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && !busy && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-routine-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#c5d3bf] bg-[#e1eadb] px-6 py-8 text-center shadow-[0_12px_32px_rgba(0,0,0,.3)] sm:px-10"
      >
        <h2 id="add-routine-title" className="text-2xl font-semibold text-[#1c2b22]">Add to Routine</h2>
        <p className="mt-1 text-sm font-medium text-[#3a4a40]">{rec.name}</p>
        <p className="mt-4 text-lg font-medium text-[#1c2b22]">Choose when you&rsquo;d like to use this product.</p>

        <div className="mt-6 flex flex-wrap justify-center gap-3" role="radiogroup" aria-label="When to use this product">
          {WHEN_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={when === o.value}
              onClick={() => setWhen(o.value)}
              className={`rounded-lg border px-4 py-1.5 text-base transition ${
                when === o.value
                  ? 'border-[#41694b] bg-[#41694b] text-white'
                  : 'border-[#1c2b22] bg-transparent text-[#1c2b22] hover:bg-white/60'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {warnings.length > 0 && (
          <div className="mt-6 rounded-r-xl border-l-4 border-amber-500 bg-amber-50 p-4 text-left">
            <p className="flex items-center gap-1.5 text-[13px] font-extrabold text-amber-900">
              <span aria-hidden="true">⚠</span> Ingredient Clash Warning
            </p>
            {warnings.map((r) => (
              <p key={r.id} className="mt-1 text-xs leading-relaxed text-amber-800">
                <b>{r.severity}:</b> {r.message}
              </p>
            ))}
            <p className="mt-2 text-[11px] text-amber-800/80">You can still add it — just keep this in mind.</p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="inline-flex items-center justify-center rounded-lg border border-[#1c2b22] bg-[#fbfdf9] px-6 py-1.5 text-sm font-medium text-[#1c2b22] transition hover:bg-[#f1f5ee] disabled:opacity-50"
          >
            Cancel
          </button>
          <button type="button" onClick={confirmAdd} disabled={!when || busy} className={greenBtn}>
            {busy ? 'Adding…' : 'Add to Routine'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------ page ------------------------------ */
export default function Recommendations() {
  const navigate = useNavigate()
  const { user, recommendations, recsLoaded } = useApp()
  const [picked, setPicked] = useState(null)

  const skinType = skinTypeKey(user?.skinType)
  const firstName = user?.name?.trim()?.split(/\s+/)[0] ?? 'Your'

  const sections = useMemo(() => {
    if (!skinType) return []
    const mine = recommendations.filter((r) => r.visible !== false && r.skinType === skinType)
    const order = [...CATEGORIES, ...new Set(mine.map((r) => r.category).filter((c) => !CATEGORIES.includes(c)))]
    return order
      .map((category) => ({ category, items: mine.filter((r) => r.category === category) }))
      .filter((s) => s.items.length > 0)
  }, [recommendations, skinType])

  return (
    <div className="page">
      {/* ---------- header ---------- */}
      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,460px)] lg:items-center">
        <div>
          <h1 className="rec-heading font-serif text-4xl font-bold leading-tight text-gg-900 sm:text-5xl">
            For You and your Skin
          </h1>
          <p className="mt-3 text-base text-ink">
            {skinType
              ? `Products curated by GlowCouncil for ${skinType} Skin.`
              : 'Products curated by GlowCouncil, matched to your skin type.'}
          </p>
        </div>

        <div className="card relative overflow-hidden p-5 sm:p-6">
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-2/5 opacity-90 sm:block">
            <SkinArt />
          </div>
          <div className="relative sm:max-w-[62%]">
            {skinType ? (
              <>
                <p className="text-sm text-muted">{firstName === 'Your' ? 'Your' : `${firstName}\u2019s`} Skin Type</p>
                <p className="mt-1 text-2xl font-semibold text-ink">{skinType} Skin</p>
                <p className="mt-2 text-sm leading-relaxed text-ink">{SKIN_BLURBS[skinType]}</p>
              </>
            ) : (
              <>
                <p className="text-sm text-muted">Skin Type</p>
                <p className="mt-1 text-2xl font-semibold text-ink">Not set yet</p>
                <p className="mt-2 text-sm leading-relaxed text-ink">
                  Take the skin profile quiz and we&rsquo;ll show products that suit your skin.
                </p>
                <button
                  type="button"
                  className={`${greenBtn} mt-4`}
                  onClick={() => navigate('/', { state: { scrollTo: 'quiz' } })}
                >
                  Take Skin Profile Quiz
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ---------- recommendation sections ---------- */}
      <div className="mt-10 space-y-8">
        {skinType && !recsLoaded && <p className="py-10 text-center text-sm text-muted">Loading recommendations…</p>}

        {sections.map(({ category, items }, index) => (
          <section key={category} className="card px-4 py-6 sm:px-7">
            <h2 className="rec-heading font-serif text-3xl font-bold text-gg-900 sm:text-4xl">
              {index + 1}. {category}
            </h2>
            <p className="mt-1 text-base text-ink sm:ml-8">{SECTION_HINTS[category] ?? ''}</p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:px-2">
              {items.map((rec) => (
                <RecommendationCard key={rec.id} rec={rec} onAdd={setPicked} />
              ))}
            </div>
          </section>
        ))}

        {skinType && recsLoaded && sections.length === 0 && (
          <div className="card px-6 py-10 text-center">
            <p className="text-lg font-semibold text-ink">No recommendations for {skinType} Skin yet</p>
            <p className="mt-1 text-sm text-muted">The GlowCouncil is still curating products for your skin type — check back soon.</p>
          </div>
        )}
      </div>

      {picked && <AddToRoutineModal rec={picked} onClose={() => setPicked(null)} />}
    </div>
  )
}
