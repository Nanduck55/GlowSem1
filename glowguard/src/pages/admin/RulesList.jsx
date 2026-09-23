import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { PageTitle, Loading, cardCls, inputCls, btnGreen, padId } from './adminUi'

export default function RulesList() {
  const navigate = useNavigate()
  const { rules, ingredients, dataLoaded } = useApp()
  const [search, setSearch] = useState('')
  const [ingredient, setIngredient] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rules.filter((r) => {
      if (ingredient && r.a !== ingredient && r.b !== ingredient) return false
      if (q && !`${r.a} ${r.b} ${r.message}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [rules, search, ingredient])

  return (
    <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-[90rem]">
      <PageTitle sub="Manage the warning rules used when tracked active ingredients appear together in the same routine.">
        Safety Clash Rules
      </PageTitle>

      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 mb-5 sm:mb-6">
        <input className={`${inputCls} col-span-2 sm:flex-1 sm:min-w-[180px]`} placeholder="Search Ingredient or rule"
               value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className={`${inputCls} sm:!w-auto sm:min-w-[190px]`} value={ingredient} onChange={(e) => setIngredient(e.target.value)}>
          <option value="">Ingredient</option>
          {ingredients.filter((i) => i !== 'None').map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
        <button className={`${btnGreen} sm:!text-base sm:!px-6`} onClick={() => navigate('/admin/rules/new')}>
          Create Rule
        </button>
      </div>

      {!dataLoaded && <Loading />}

      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 -mr-1">
        {filtered.map((r) => (
          <div
            key={r.id}
            className={`${cardCls} px-4 sm:px-5 py-3 text-sm
              grid grid-cols-[2.5rem_1fr_1fr] gap-x-3 gap-y-2 items-center
              md:grid-cols-[3.5rem_1fr_1fr_1.6fr_auto] xl:gap-x-5 xl:px-6`}
          >
            <span className="text-[#3d4a42]">{padId(r.id)}</span>
            <span className="font-medium md:font-normal break-words">{r.a}</span>
            <span className="font-medium md:font-normal break-words">{r.b}</span>
            <span className="col-span-3 md:col-span-1 line-clamp-2 text-[#3d4a42] md:text-inherit">{r.message}</span>
            <button
              className={`${btnGreen} !py-1.5 !text-xs col-span-3 md:col-span-1 md:justify-self-end`}
              onClick={() => navigate(`/admin/rules/${r.id}`)}
            >
              View Rule
            </button>
          </div>
        ))}
        {dataLoaded && filtered.length === 0 && (
          <p className="text-sm text-[#59645d] py-6 text-center">
            {rules.length === 0 ? 'No clash rules defined yet.' : 'No rules match your search.'}
          </p>
        )}
      </div>
    </div>
  )
}
