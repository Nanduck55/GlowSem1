import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { PageTitle, Loading, StatusBadge, cardCls, inputCls, btnGreen, btnRed } from './adminUi'

export default function RuleDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { rules, dataLoaded, deleteClashRule, notify } = useApp()
  const [busy, setBusy] = useState(false)

  const rule = rules.find((r) => String(r.id) === String(id))
  if (!rule) return dataLoaded ? <p className="text-sm text-[#59645d]">Rule not found.</p> : <Loading />

  const remove = async () => {
    if (!confirm(`Delete the ${rule.a} + ${rule.b} rule?`)) return
    setBusy(true)
    try {
      await deleteClashRule(rule.id)
      notify('Clash rule deleted.', false)
      navigate('/admin/rules', { replace: true })
    } catch (err) {
      notify(err.response?.data?.error || 'Could not delete the rule.', false)
      setBusy(false)
    }
  }

  return (
    <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-[90rem]">
      <PageTitle>Safety Clash Rule Details</PageTitle>

      <section className={`${cardCls} px-4 sm:px-8 py-5 sm:py-7`}>
        <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-x-6 gap-y-4 sm:gap-y-5 items-start">
          <div>
            <p className="text-base sm:text-lg font-medium mb-1">Ingredient A</p>
            <input className={inputCls} value={rule.a} readOnly />
          </div>
          <div>
            <p className="text-base sm:text-lg font-medium mb-1">Ingredient B</p>
            <input className={inputCls} value={rule.b} readOnly />
          </div>
          <div>
            <p className="text-base sm:text-lg font-medium mb-1">Status</p>
            <StatusBadge active={rule.active !== false} large />
          </div>

          <div className="sm:col-span-2">
            <p className="text-base sm:text-lg font-medium mb-1">Warning Message</p>
            <textarea className={inputCls} rows={2} value={rule.message} readOnly />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3 sm:gap-6">
          <button className={btnGreen} onClick={() => navigate(`/admin/rules/${rule.id}/edit`)}>Edit Rule</button>
          <button className={btnRed} onClick={remove} disabled={busy}>Delete Rule</button>
        </div>
      </section>
    </div>
  )
}
