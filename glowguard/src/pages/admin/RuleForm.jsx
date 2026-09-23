import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { PageTitle, Loading, cardCls, inputCls, btnGreen, btnOutline } from './adminUi'

// One form for both screens: /admin/rules/new (create) and /admin/rules/:id/edit (edit).
export default function RuleForm({ mode }) {
  const editing = mode === 'edit'
  const { id } = useParams()
  const navigate = useNavigate()
  const { rules, ingredients, dataLoaded, addClashRule, updateClashRule, notify } = useApp()

  const existing = editing ? rules.find((r) => String(r.id) === String(id)) : null
  const [form, setForm] = useState(null)
  const [busy, setBusy] = useState(false)

  // Initialise once the rule is available (it may still be loading on a hard refresh).
  if (form === null) {
    if (!editing) setForm({ a: '', b: '', message: '' })
    else if (existing) setForm({ a: existing.a, b: existing.b, message: existing.message })
  }

  if (editing && !existing) {
    return dataLoaded ? <p className="text-sm text-[#59645d]">Rule not found.</p> : <Loading />
  }
  if (!form) return <Loading />

  const options = ingredients.filter((i) => i !== 'None')
  const back = editing ? `/admin/rules/${id}` : '/admin/rules'

  const submit = async (e) => {
    e.preventDefault()
    if (!form.a || !form.b) return notify('Choose both ingredients.', false)
    if (form.a === form.b) return notify('Ingredient A and B must be different.', false)
    if (!form.message.trim()) return notify('Enter a warning message.', false)

    setBusy(true)
    try {
      const payload = { ...form, message: form.message.trim() }
      if (editing) await updateClashRule({ id: existing.id, ...payload })
      else await addClashRule(payload)
      notify(editing ? 'Rule updated.' : 'Rule added.')
      navigate(editing ? `/admin/rules/${id}` : '/admin/rules')
    } catch (err) {
      notify(err.response?.data?.error || 'Could not save the rule.', false)
    } finally {
      setBusy(false)
    }
  }

  const renderSelect = (value, onChange, placeholder) => (
    <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="" disabled>{placeholder}</option>
      {options.map((i) => <option key={i} value={i}>{i}</option>)}
    </select>
  )

  const title = editing ? 'Edit Safety Clash Rule' : 'Create Safety Clash Rule'

  return (
    <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-[90rem]">
      <PageTitle>{title}</PageTitle>

      <form onSubmit={submit} className={`${cardCls} max-w-3xl mx-auto px-4 sm:px-8 py-5 sm:py-7`}>
        <h2 className="text-xl sm:text-2xl font-medium text-center mb-5 sm:mb-6">
          {editing ? 'Edit' : 'Create'} Safety Clash Rules Details
        </h2>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-5 sm:mb-6">
          <div>
            <p className="text-base sm:text-lg font-medium mb-1">Ingredient A</p>
            {renderSelect(form.a, (v) => setForm({ ...form, a: v }), 'Choose Ingredient A')}
          </div>
          <div>
            <p className="text-base sm:text-lg font-medium mb-1">Ingredient B</p>
            {renderSelect(form.b, (v) => setForm({ ...form, b: v }), 'Choose Ingredient B')}
          </div>
        </div>

        <p className="text-base sm:text-lg font-medium">Warning Message</p>
        <p className="text-xs mb-2">
          Users will see this warning when a newly added product conflicts with an ingredient already in the same routine.
        </p>
        <textarea className={inputCls} rows={4} placeholder="Type Warning Message"
                  value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />

        <div className="mt-6 flex flex-wrap justify-center gap-3 sm:gap-6">
          <button type="button" className={btnOutline} onClick={() => navigate(back)}>Cancel</button>
          <button className={btnGreen} disabled={busy}>{editing ? 'Edit Rule' : 'Add Rule'}</button>
        </div>
      </form>
    </div>
  )
}
