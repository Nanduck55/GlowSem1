import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { CATEGORIES } from '../api/services'
import { findDraftClashes, fetchIngredientDescriptions } from '../api/services'
import SchedulePicker, { weekdayIndex } from './SchedulePicker'

// Local-time date key (YYYY-MM-DD) — same rule as Routine.jsx.
const todayKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Close something on outside click / Escape.
function useDismiss(open, ref, close) {
  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) close()
    }
    const onKey = (e) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, ref, close])
}

// Small "i" button that shows an info card on hover, focus or tap.
function InfoTip({ title, children }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const close = () => setOpen(false)
  useDismiss(open, ref, close)

  return (
    <span
      ref={ref}
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={close}
    >
      <button
        type="button"
        aria-label={`About ${title}`}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        onBlur={close}
        className="text-ink/80 hover:text-ink transition"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" />
          <path d="M12 11v5.5" strokeLinecap="round" />
          <circle cx="12" cy="7.6" r="0.6" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div
          role="tooltip"
          className="absolute left-0 top-full mt-2 z-20 w-[min(16rem,calc(100vw-6rem))] rounded-xl bg-white text-ink border border-gg-100 shadow-pop p-4 text-left"
        >
          <p className="text-base font-bold leading-tight">{title}</p>
          <p className="text-xs leading-relaxed text-muted mt-2 font-normal">{children}</p>
        </div>
      )}
    </span>
  )
}

// Multi-select dropdown: pick any number of actives, shown as removable chips.
function ActivesDropdown({ options, selected, onToggle, onInfo, infoFor }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useDismiss(open, ref, () => setOpen(false))

  return (
    <div ref={ref}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="input flex items-center justify-between gap-3 text-left cursor-pointer"
      >
        <span className={selected.length ? 'text-ink' : 'text-muted'}>
          {selected.length ? `${selected.length} selected` : 'Select actives'}
        </span>
        <svg
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul className="mt-2 max-h-56 overflow-y-auto rounded-xl border-[1.5px] border-gg-200 bg-white p-1.5">
          {options.map((a) => (
            <li key={a}>
              <label className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-sm hover:bg-gg-50 transition">
                <input
                  type="checkbox"
                  checked={selected.includes(a)}
                  onChange={() => onToggle(a)}
                  className="w-4 h-4 rounded accent-gg-600"
                />
                {a}
              </label>
            </li>
          ))}
        </ul>
      )}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selected.map((a) => (
            <span
              key={a}
              className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-gg-100 text-gg-800 text-xs font-bold"
            >
              <button
                type="button"
                onClick={() => onInfo(a)}
                aria-expanded={infoFor === a}
                title="Tap to see what this active does"
                className="cursor-pointer"
              >
                {a}
              </button>
              <button
                type="button"
                onClick={() => onToggle(a)}
                aria-label={`Remove ${a}`}
                className="w-4 h-4 grid place-items-center rounded-full text-sm leading-none hover:bg-gg-200 transition"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Add / Edit product form — matches the "Edit Product" modal in your screenshots.
 * `onSaved(product)` is called after the product is stored via the PHP API.
 */
export default function ProductForm({ product, onSaved, onCancel, routineItems, showSchedule, viewedDate }) {
  const { ingredients, rules, products, loadRoutine } = useApp()

  // The routine to check clashes against. Pages that already have it loaded
  // (Routine) pass it in; otherwise (Shelf) fall back to today's routine.
  const [fetchedItems, setFetchedItems] = useState([])
  useEffect(() => {
    if (routineItems) return
    let alive = true
    loadRoutine(todayKey())
      .then((items) => alive && setFetchedItems(Array.isArray(items) ? items : []))
      .catch(() => alive && setFetchedItems([]))
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routineItems])
  const existingItems = routineItems ?? fetchedItems

  const [form, setForm] = useState({
    name: '', category: '', timeOfDay: 'Both', actives: [],
  })

  useEffect(() => {
    if (product) setForm({ ...product, actives: [...(product.actives ?? [])] })
  }, [product])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  // Descriptions for the actives (active_ingredients.description) and which
  // active's description is currently shown under the dropdown.
  const [ingredientInfo, setIngredientInfo] = useState({})
  const [infoFor, setInfoFor] = useState(null)
  useEffect(() => {
    let alive = true
    fetchIngredientDescriptions()
      .then((map) => alive && setIngredientInfo(map))
      .catch(() => alive && setIngredientInfo({}))
    return () => { alive = false }
  }, [])

  const toggleActive = (a) => {
    // Ticking an active shows its description; unticking hides it.
    setInfoFor(form.actives.includes(a) ? (infoFor === a ? null : infoFor) : a)
    setForm((f) => ({
      ...f,
      actives: f.actives.includes(a)
        ? f.actives.filter((x) => x !== a)
        : [...f.actives, a],
    }))
  }

  // Which days (and for how long) the product is added to the routine.
  // Starts as "just the day being viewed", which is what Add to Routine did before.
  const viewedWeekday = weekdayIndex(viewedDate || todayKey())
  const [days, setDays] = useState(() =>
    Array.from({ length: 7 }, (_, i) => i === viewedWeekday)
  )
  const [span, setSpan] = useState(0)

  // Live preview of safety rules this selection would trigger — both within
  // the selected actives and against products already in the same routine.
  // A placeholder id is enough for a new product; for an existing one the id
  // keeps it from clashing with itself.
  const previewProduct = { ...form, id: product?.id ?? '__draft__' }
  const previewClashes = findDraftClashes(previewProduct, existingItems, products, rules)

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    if (showSchedule) {
      if (!days.some(Boolean)) return
      onSaved({ ...form, name: form.name.trim() }, { days, span })
      return
    }
    onSaved({ ...form, name: form.name.trim() })
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className="label">Product Name</label>
        <input className="input" placeholder="e.g. Celeteque Exfoliating Cleanser"
               value={form.name} onChange={(e) => set('name', e.target.value)} required />
      </div>

      <div>
        <label className="label">Category</label>
        <select className="input" value={form.category} onChange={(e) => set('category', e.target.value)} required>
          <option value="" disabled>Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="label">When will you use this product?</label>
        <div className="flex gap-3">
          {['AM', 'PM', 'Both'].map((t) => (
            <button type="button" key={t} onClick={() => set('timeOfDay', t)}
              className={`px-5 py-2 rounded-lg border text-sm font-bold transition
                ${form.timeOfDay === t
                  ? 'bg-gg-600 text-white border-gg-600 shadow'
                  : 'bg-white text-ink border-gg-300 hover:border-gg-600'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2">
          <div className="flex items-center gap-1.5">
            <span className="label !mb-0">Actives</span>
            <InfoTip title="Active Ingredients">
              Key ingredients that give a skincare product its targeted function.
              You can usually find them highlighted on the product label or packaging.
            </InfoTip>
          </div>
          <p className="text-xs text-muted mt-0.5">Select all that apply</p>
        </div>
        <ActivesDropdown
          options={ingredients}
          selected={form.actives}
          onToggle={toggleActive}
          onInfo={(a) => setInfoFor((cur) => (cur === a ? null : a))}
          infoFor={infoFor}
        />
      </div>

      {infoFor && form.actives.includes(infoFor) && (
        <div className="bg-gg-50 border-l-4 border-gg-600 rounded-r-xl p-4">
          <p className="text-[13px] font-extrabold text-gg-900 flex items-center gap-1.5">
            <span aria-hidden="true">ⓘ</span> {infoFor}
          </p>
          <p className="text-xs text-gg-800 leading-relaxed mt-1">
            {ingredientInfo[infoFor] || 'No description available for this active yet.'}
          </p>
        </div>
      )}

      {previewClashes.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-xl p-4">
          <p className="text-[13px] font-extrabold text-amber-900 flex items-center gap-1.5">
            <span aria-hidden="true">⚠</span> Ingredient Clash Warning
          </p>
          {previewClashes.map(({ rule: r, matches }) => (
            <p key={r.id} className="text-xs text-amber-800 leading-relaxed mt-1">
              {r.severity && <b>{r.severity}: </b>}{r.message}
              {matches.length > 0 && (
                <span className="block mt-0.5 font-semibold">
                  Conflicts with your existing routine: {matches.map((m) => `${m.name} (${m.periods.join(' & ')})`).join(', ')}
                </span>
              )}
            </p>
          ))}
        </div>
      )}

      {showSchedule && (
        <SchedulePicker
          days={days}
          setDays={setDays}
          span={span}
          setSpan={setSpan}
          viewedWeekday={viewedWeekday}
        />
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-outline" onClick={onCancel}>Cancel</button>
        <button
          type="submit"
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={showSchedule && !days.some(Boolean)}
        >
          {product ? 'Save Changes' : 'Add to Routine'}
        </button>
      </div>
    </form>
  )
}