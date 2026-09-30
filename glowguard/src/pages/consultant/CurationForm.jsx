import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { CATEGORIES, SKIN_TYPES } from '../../api/constants'
import { PageTitle, Loading } from '../admin/adminUi'
import { panelCls, inputCls, btnPrimary, btnOutline, VisibilityPill } from './consultantUi'

const DESCRIPTION_MAX = 500

// One form for both screens: /consultant/curation/new (add) and /consultant/curation/:id/edit (edit).
export default function CurationForm({ mode }) {
  const editing = mode === 'edit'
  const { id } = useParams()
  const navigate = useNavigate()
  const { recommendations, recsLoaded, ingredients, addRecommendation, updateRecommendation, notify } = useApp()

  const existing = editing ? recommendations.find((r) => String(r.id) === String(id)) : null
  const [form, setForm] = useState(null)
  const [busy, setBusy] = useState(false)

  // Initialise once the recommendation is available (it may still be loading on a hard refresh).
  if (form === null) {
    if (!editing) {
      setForm({ name: '', category: '', skinType: '', starIngredient: '', description: '', visible: true })
    } else if (existing) {
      setForm({
        name: existing.name,
        category: existing.category,
        skinType: existing.skinType,
        starIngredient: existing.starIngredient ?? '',
        description: existing.description ?? '',
        visible: existing.visible !== false,
      })
    }
  }

  if (editing && !existing) {
    return recsLoaded ? <p className="text-sm text-[#59645d]">Recommendation not found.</p> : <Loading />
  }
  if (!form) return <Loading />

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const back = editing ? `/consultant/curation/${id}` : '/consultant/curation'
  const starOptions = ingredients.filter((i) => i !== 'None')

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return notify('Enter a product name.', false)
    if (!form.category) return notify('Choose a product type.', false)
    if (!form.skinType) return notify('Choose the skin type this is recommended for.', false)
    if (!form.description.trim()) return notify('Enter a description.', false)

    setBusy(true)
    try {
      const payload = { ...form, name: form.name.trim(), description: form.description.trim() }
      if (editing) await updateRecommendation({ id: existing.id, ...payload })
      else await addRecommendation(payload)
      notify(editing ? 'Recommendation updated.' : 'Recommendation added.')
      navigate(back)
    } catch (err) {
      notify(err.response?.data?.error || 'Could not save the recommendation.', false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-[90rem]">
      <PageTitle sub={`${editing ? 'Edit' : 'Create'} a GlowCouncil recommendation for a specific skin type.`}>
        {editing ? 'Edit Recommendation' : 'Add Recommendation'}
      </PageTitle>

      <form onSubmit={submit} className={`${panelCls} max-w-3xl mx-auto px-4 sm:px-8 py-5 sm:py-7`}>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 sm:gap-y-5">
          <div className="sm:col-span-2">
            <p className="text-base sm:text-lg font-medium mb-1">Product Name</p>
            <input className={inputCls} placeholder="Product Name" maxLength={150}
                   value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>

          <div>
            <p className="text-base sm:text-lg font-medium mb-1">Product Type</p>
            <select className={`${inputCls} sm:!w-56`} value={form.category} onChange={(e) => set('category', e.target.value)}>
              <option value="" disabled>Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <p className="text-base sm:text-lg font-medium mb-1">Recommended For</p>
            <select className={`${inputCls} sm:!w-56`} value={form.skinType} onChange={(e) => set('skinType', e.target.value)}>
              <option value="" disabled>Skin Type</option>
              {SKIN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <p className="text-base sm:text-lg font-medium mb-1">Star Ingredient</p>
            <select className={`${inputCls} sm:!w-56`} value={form.starIngredient} onChange={(e) => set('starIngredient', e.target.value)}>
              <option value="">None</option>
              {starOptions.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          <div>
            <p className="text-base sm:text-lg font-medium mb-1">Visibility</p>
            <VisibilityPill visible={form.visible} onClick={() => set('visible', !form.visible)} />
          </div>

          <div className="sm:col-span-2">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-base sm:text-lg font-medium mb-1">Description</p>
              <span className="text-xs text-[#59464f]">{form.description.length}/{DESCRIPTION_MAX}</span>
            </div>
            <textarea className={inputCls} rows={4} maxLength={DESCRIPTION_MAX} placeholder="Type Description"
                      value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3 sm:gap-6">
          <button type="button" className={btnOutline} onClick={() => navigate(back)}>Cancel</button>
          <button className={btnPrimary} disabled={busy}>{editing ? 'Save Changes' : 'Add Recommendation'}</button>
        </div>
      </form>
    </div>
  )
}
