import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function Admin() {
  const {
    ingredients, rules,
    addIngredient, deleteIngredient, addClashRule, deleteClashRule,
  } = useApp()

  const [newIngredient, setNewIngredient] = useState('')
  const [newRule, setNewRule] = useState({ a: '', b: '', message: '' })

  const submitIngredient = (e) => {
    e.preventDefault()
    if (!newIngredient.trim()) return
    addIngredient(newIngredient.trim())
    setNewIngredient('')
  }

  const submitRule = (e) => {
    e.preventDefault()
    if (!newRule.a || !newRule.b || !newRule.message.trim()) return
    addClashRule({ ...newRule, message: newRule.message.trim() })
    setNewRule({ a: '', b: '', message: '' })
  }

  const IngredientSelect = ({ value, onChange }) => (
    <select className="input" value={value} onChange={(e) => onChange(e.target.value)} required>
      <option value="" disabled>Select active</option>
      {ingredients.filter((i) => i !== 'None').map((i) => <option key={i} value={i}>{i}</option>)}
    </select>
  )

  return (
    <div className="max-w-4xl mx-auto px-5 py-8">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">Admin Panel</h1>
      <p className="text-muted text-sm mb-8">Manage the active ingredient dictionary and safety clash rules.</p>

      {/* -------- Ingredients dictionary -------- */}
      <section className="card p-6 mb-8">
        <h2 className="font-extrabold text-lg mb-4">Active Ingredient Dictionary</h2>
        <form onSubmit={submitIngredient} className="flex gap-2 mb-4">
          <input className="input flex-1" placeholder="e.g. Azelaic Acid" value={newIngredient}
                 onChange={(e) => setNewIngredient(e.target.value)} />
          <button className="btn-primary whitespace-nowrap">Add ingredient</button>
        </form>
        <div className="flex flex-wrap gap-2">
          {ingredients.map((i) => (
            <span key={i} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gg-100 border border-gg-200 text-gg-800 text-xs font-bold">
              {i}
              {i !== 'None' && (
                <button onClick={() => confirm(`Remove "${i}"?`) && deleteIngredient(i)}
                        className="text-muted hover:text-red-600 font-extrabold" aria-label={`Remove ${i}`}>×</button>
              )}
            </span>
          ))}
        </div>
      </section>

      {/* -------- Clash rules -------- */}
      <section className="card p-6">
        <h2 className="font-extrabold text-lg mb-4">Safety Clash Rules</h2>
        <form onSubmit={submitRule} className="grid sm:grid-cols-[1fr_auto_1fr] gap-2 mb-3">
          <IngredientSelect value={newRule.a} onChange={(v) => setNewRule({ ...newRule, a: v })} />
          <span className="self-center text-muted font-extrabold text-sm text-center">+</span>
          <IngredientSelect value={newRule.b} onChange={(v) => setNewRule({ ...newRule, b: v })} />
          <textarea className="input sm:col-span-3" rows={2} placeholder="Safety message shown to users…"
                    value={newRule.message} onChange={(e) => setNewRule({ ...newRule, message: e.target.value })} required />
          <button className="btn-primary sm:col-span-3 justify-self-end">Add rule</button>
        </form>

        <div className="divide-y divide-gg-100">
          {rules.map((r) => (
            <div key={r.id} className="py-3.5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-extrabold text-gg-900">{r.a} + {r.b}</p>
                <p className="text-xs text-muted mt-0.5">{r.message}</p>
              </div>
              <button className="btn-danger !py-1 !px-3 !text-xs whitespace-nowrap"
                      onClick={() => confirm('Delete this clash rule?') && deleteClashRule(r.id)}>Delete</button>
            </div>
          ))}
          {rules.length === 0 && <p className="text-muted text-sm py-4 text-center">No clash rules defined.</p>}
        </div>
      </section>
    </div>
  )
}
