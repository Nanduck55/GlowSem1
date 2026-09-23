import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { CATEGORIES } from '../api/services'
import { findClashes } from '../api/services'

/**
 * Add / Edit product form — matches the "Edit Product" modal in your screenshots.
 * `onSaved(product)` is called after the product is stored via the PHP API.
 */
export default function ProductForm({ product, onSaved, onCancel }) {
  const { ingredients, rules, products } = useApp()
  const [form, setForm] = useState({
    name: '', category: '', timeOfDay: 'Both', actives: [],
  })

  useEffect(() => {
    if (product) setForm({ ...product, actives: [...(product.actives ?? [])] })
  }, [product])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const toggleActive = (a) =>
    setForm((f) => ({
      ...f,
      actives: f.actives.includes(a)
        ? f.actives.filter((x) => x !== a)
        : [...f.actives, a],
    }))

  // Live preview of safety rules this selection would trigger.
  // Works for both a new product (no id yet) and an existing one —
  // a placeholder id is enough since findClashes only needs something
  // to match the routine entry back to the product being edited.
  const previewProduct = { ...form, id: product?.id ?? '__draft__' }
  const previewClashes = findClashes(
    [{ productId: previewProduct.id, completed: false }],
    [previewProduct],
    rules
  )

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
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
        <label className="label">Actives <span className="font-normal text-muted">— select all that apply</span></label>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
          {ingredients.map((a) => (
            <label key={a} className="flex items-center gap-2.5 cursor-pointer text-sm">
              <input type="checkbox" checked={form.actives.includes(a)} onChange={() => toggleActive(a)}
                     className="w-4 h-4 rounded accent-gg-600" />
              {a}
            </label>
          ))}
        </div>
      </div>

      {form.actives.length > 1 && previewClashes.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-xl p-4">
          <p className="text-[13px] font-extrabold text-amber-900 flex items-center gap-1.5">
            <span aria-hidden="true">⚠</span> Ingredient Clash Warning
          </p>
          {previewClashes.map((r) => (
            <p key={r.id} className="text-xs text-amber-800 leading-relaxed mt-1">{r.message}</p>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">{product ? 'Save Changes' : 'Add to Routine'}</button>
      </div>
    </form>
  )
}