import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { CATEGORIES, SKIN_TYPES } from '../../api/constants'
import { PageTitle, Loading } from '../admin/adminUi'
import { inputCls, btnPrimary, btnSoft, btnDanger, VisibilityDot } from './consultantUi'

function RecommendationCard({ rec, onView, onEdit, onDelete, busy }) {
  return (
    <article className="bg-white rounded-xl shadow-[0_2px_5px_rgba(0,0,0,.2)] p-4 flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-medium text-black break-words">{rec.name}</h3>
        <VisibilityDot visible={rec.visible} />
      </div>

      {rec.starIngredient && (
        <span className="mt-1.5 self-start rounded-md bg-[#dc9bc8] px-2 py-0.5 text-[10px] font-medium text-[#3a1030]">
          {rec.starIngredient}
        </span>
      )}

      <p className="mt-2 text-xs text-black">
        Recommended Skin Type: <b className="font-semibold">{rec.skinType}</b>
      </p>
      <p className="mt-1.5 text-xs text-[#3d3d3d] leading-relaxed line-clamp-3 flex-1">{rec.description}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={btnSoft} onClick={onView}>View</button>
        <button type="button" className={btnSoft} onClick={onEdit}>Edit Product</button>
        <button type="button" className={`${btnDanger} !px-3 !py-1 !text-xs !shadow-none`} onClick={onDelete} disabled={busy}>
          Delete Product
        </button>
      </div>
    </article>
  )
}

export default function CurationList() {
  const navigate = useNavigate()
  const { recommendations, recsLoaded, deleteRecommendation, notify } = useApp()
  const [search, setSearch] = useState('')
  const [skinType, setSkinType] = useState('')
  const [category, setCategory] = useState('')
  const [busyId, setBusyId] = useState(null)

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = recommendations.filter((r) => {
      if (skinType && r.skinType !== skinType) return false
      if (category && r.category !== category) return false
      if (q && !`${r.name} ${r.starIngredient} ${r.description}`.toLowerCase().includes(q)) return false
      return true
    })
    // Follow the order of CATEGORIES; anything unexpected lands at the end.
    const order = [...CATEGORIES, ...new Set(filtered.map((r) => r.category).filter((c) => !CATEGORIES.includes(c)))]
    return order
      .map((c) => ({ category: c, items: filtered.filter((r) => r.category === c) }))
      .filter((g) => g.items.length > 0)
  }, [recommendations, search, skinType, category])

  const remove = async (rec) => {
    if (!confirm(`Delete "${rec.name}"? It will no longer be recommended to anyone.`)) return
    setBusyId(rec.id)
    try {
      await deleteRecommendation(rec.id)
      notify('Recommendation deleted.', false)
    } catch (err) {
      notify(err.response?.data?.error || 'Could not delete the recommendation.', false)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-[90rem]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageTitle sub="Create and manage recommendations by skin type.">GlowCouncil Curation</PageTitle>
        <button className={`${btnPrimary} sm:!text-base sm:!px-6 sm:mt-14`} onClick={() => navigate('/consultant/curation/new')}>
          Add Recommendation
        </button>
      </div>

      <div className="grid grid-cols-2 sm:flex gap-3 mb-5 sm:mb-6">
        <input className={`${inputCls} col-span-2 sm:flex-1`} placeholder="Search recommendation"
               value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className={`${inputCls} sm:!w-[170px]`} value={skinType} onChange={(e) => setSkinType(e.target.value)}>
          <option value="">Skin Type</option>
          {SKIN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className={`${inputCls} sm:!w-[170px]`} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Category</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {!recsLoaded && <Loading />}

      <div className="space-y-6">
        {groups.map(({ category: c, items }) => (
          <section key={c} className="rounded-2xl bg-[#e8cddf] px-4 sm:px-6 py-5 shadow-[0_2px_4px_rgba(0,0,0,.18)]">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1f4d36]">{c}</h2>
            <p className="mt-1 mb-4 text-base sm:text-lg font-medium text-black">
              {items.length} Recommendation{items.length === 1 ? '' : 's'}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  rec={rec}
                  busy={busyId === rec.id}
                  onView={() => navigate(`/consultant/curation/${rec.id}`)}
                  onEdit={() => navigate(`/consultant/curation/${rec.id}/edit`)}
                  onDelete={() => remove(rec)}
                />
              ))}
            </div>
          </section>
        ))}

        {recsLoaded && groups.length === 0 && (
          <p className="text-sm text-[#59645d] py-6 text-center">
            {recommendations.length === 0
              ? 'No recommendations yet. Use "Add Recommendation" to create the first one.'
              : 'No recommendations match your filters.'}
          </p>
        )}
      </div>
    </div>
  )
}
