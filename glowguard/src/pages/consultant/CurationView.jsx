import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { PageTitle, Loading } from '../admin/adminUi'
import { panelCls, inputCls, btnPrimary, btnDanger, VisibilityPill } from './consultantUi'

export default function CurationView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { recommendations, recsLoaded, deleteRecommendation, notify } = useApp()
  const [busy, setBusy] = useState(false)

  const rec = recommendations.find((r) => String(r.id) === String(id))
  if (!rec) return recsLoaded ? <p className="text-sm text-[#59645d]">Recommendation not found.</p> : <Loading />

  const remove = async () => {
    if (!confirm(`Delete "${rec.name}"? It will no longer be recommended to anyone.`)) return
    setBusy(true)
    try {
      await deleteRecommendation(rec.id)
      notify('Recommendation deleted.', false)
      navigate('/consultant/curation', { replace: true })
    } catch (err) {
      notify(err.response?.data?.error || 'Could not delete the recommendation.', false)
      setBusy(false)
    }
  }

  return (
    <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-[90rem]">
      <PageTitle>View Recommendation</PageTitle>

      <section className={`${panelCls} px-4 sm:px-8 py-5 sm:py-7`}>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 sm:gap-y-5">
          <div className="sm:col-span-2">
            <p className="text-base sm:text-lg font-medium mb-1">Product Name</p>
            <input className={inputCls} value={rec.name} readOnly />
          </div>
          <div>
            <p className="text-base sm:text-lg font-medium mb-1">Product Type</p>
            <input className={`${inputCls} sm:!w-56`} value={rec.category} readOnly />
          </div>
          <div>
            <p className="text-base sm:text-lg font-medium mb-1">Recommended For</p>
            <input className={`${inputCls} sm:!w-56`} value={rec.skinType} readOnly />
          </div>
          <div>
            <p className="text-base sm:text-lg font-medium mb-1">Star Ingredient</p>
            <input className={`${inputCls} sm:!w-56`} value={rec.starIngredient} placeholder="None" readOnly />
          </div>
          <div>
            <p className="text-base sm:text-lg font-medium mb-1">Visibility</p>
            <VisibilityPill visible={rec.visible} />
          </div>
          <div className="sm:col-span-2">
            <p className="text-base sm:text-lg font-medium mb-1">Description</p>
            <textarea className={inputCls} rows={3} value={rec.description} readOnly />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3 sm:gap-6">
          <button className={btnPrimary} onClick={() => navigate(`/consultant/curation/${rec.id}/edit`)}>Edit Recommendation</button>
          <button className={btnDanger} onClick={remove} disabled={busy}>Delete Product</button>
        </div>
      </section>
    </div>
  )
}
