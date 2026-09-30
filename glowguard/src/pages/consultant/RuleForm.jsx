import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { SEVERITY_LEVELS, SOURCE_MAX_LENGTH } from '../../api/constants'
import { PageTitle, Loading } from '../admin/adminUi'
import { panelCls, inputCls, btnPrimary, btnOutline } from './consultantUi'

// One form for both screens: /consultant/rules/new (create) and /consultant/rules/:id/edit (edit).
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
    if (!editing) setForm({ a: '', b: '', severity: '', source: '', message: '' })
    else if (existing) {
      setForm({
        a: existing.a,
        b: existing.b,
        severity: existing.severity ?? '',
        source: existing.source ?? '',
        message: existing.message,
      })
    }
  }

  if (editing && !existing) {
    return dataLoaded ? <p className="text-sm text-[#59645d]">Rule not found.</p> : <Loading />
  }
  if (!form) return <Loading />

  const options = ingredients.filter((i) => i !== 'None')
  const back = editing ? `/consultant/rules/${id}` : '/consultant/rules'

  const submit = async (e) => {
    e.preventDefault()
    if (!form.a || !form.b) return notify('Choose both ingredients.', false)
    if (form.a === form.b) return notify('Ingredient A and B must be different.', false)
    if (!form.severity) return notify('Choose a severity level.', false)
    if (!form.message.trim()) return notify('Enter a rule message.', false)
    if (form.source.trim().length > SOURCE_MAX_LENGTH) {
      return notify(`Source reference must be ${SOURCE_MAX_LENGTH} characters or fewer.`, false)
    }

    setBusy(true)
    try {
      const payload = { ...form, message: form.message.trim(), source: form.source.trim() }
      if (editing) await updateClashRule({ id: existing.id, ...payload })
      else await addClashRule(payload)
      notify(editing ? 'Rule updated.' : 'Rule added.')
      navigate(editing ? `/consultant/rules/${id}` : '/consultant/rules')
    } catch (err) {
      notify(err.response?.data?.error || 'Could not save the rule.', false)
    } finally {
      setBusy(false)
    }
  }

  const renderSelect = (value, onChange, placeholder, list) => (
    <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="" disabled>{placeholder}</option>
      {list.map((i) => <option key={i} value={i}>{i}</option>)}
    </select>
  )

  const title = editing ? 'Edit Safety Clash Rule' : 'Create Safety Clash Rule'

  return (
    <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-[90rem]">
      <PageTitle>{title}</PageTitle>

      <form onSubmit={submit} className={`${panelCls} max-w-3xl mx-auto px-4 sm:px-8 py-5 sm:py-7`}>
        <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-4 sm:gap-6 mb-5 sm:mb-6">
          <div>
            <p className="text-base sm:text-lg font-medium mb-1">Ingredient A</p>
            {renderSelect(form.a, (v) => setForm({ ...form, a: v }), 'Choose Ingredient A', options)}
          </div>
          <div>
            <p className="text-base sm:text-lg font-medium mb-1">Ingredient B</p>
            {renderSelect(form.b, (v) => setForm({ ...form, b: v }), 'Choose Ingredient B', options)}
          </div>
          <div className="sm:min-w-[160px]">
            <p className="text-base sm:text-lg font-medium mb-1">Severity Level</p>
            {renderSelect(form.severity, (v) => setForm({ ...form, severity: v }), 'Severity Level', SEVERITY_LEVELS)}
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-3">
          <p className="text-base sm:text-lg font-medium">Source References</p>
          <span className="text-xs text-[#59464f]">{form.source.length}/{SOURCE_MAX_LENGTH}</span>
        </div>
        <textarea className={`${inputCls} mt-1`} rows={2} maxLength={SOURCE_MAX_LENGTH}
                  placeholder="Type Source Reference"
                  value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />

        <p className="mt-5 text-base sm:text-lg font-medium">Rule Message</p>
        <p className="text-xs mb-2">
          This message will appear when a newly added product has a recorded interaction with an ingredient already in the same routine.
        </p>
        <textarea className={inputCls} rows={4} placeholder="Type Rule Message"
                  value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />

        <div className="mt-6 flex flex-wrap justify-center gap-3 sm:gap-6">
          <button type="button" className={btnOutline} onClick={() => navigate(back)}>Cancel</button>
          <button className={btnPrimary} disabled={busy}>{editing ? 'Save Changes' : 'Add Rule'}</button>
        </div>
      </form>
    </div>
  )
}
