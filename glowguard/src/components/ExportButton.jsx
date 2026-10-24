import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { saveCsv, saveXlsx, printPdf } from '../api/exportFile'

/**
 * One Export button used by the user, admin and consultant pages.
 *
 *   getData(range)  -> (or a promise of) { title, sections: [{ heading?, columns, rows }] }
 *   filename        -> base name of the CSV (the date is added)
 *   ranges          -> optional [{ value, label }]; shows a "Range" picker in the menu
 *   className       -> the page's own button style, so it matches each portal
 *   disabled        -> e.g. while the page is still loading
 */
export default function ExportButton({
  getData,
  filename,
  ranges,
  className = '',
  disabled = false,
  label = 'Export',
}) {
  const { notify } = useApp()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [range, setRange] = useState(ranges?.[0]?.value ?? null)
  const wrapRef = useRef(null)

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const run = async (kind) => {
    setBusy(true)
    try {
      const data = await getData(range)
      if (kind === 'csv') saveCsv(data, filename)
      else if (kind === 'xlsx') saveXlsx(data, filename)
      else printPdf(data)
      setOpen(false)
    } catch (err) {
      notify(err?.response?.data?.error || 'Could not prepare the export.', false)
    } finally {
      setBusy(false)
    }
  }

  const itemCls =
    'block w-full px-3 py-2 text-left text-sm text-[#202621] hover:bg-black/5 disabled:opacity-60'

  return (
    <div ref={wrapRef} className="relative inline-block">
      <button
        type="button"
        className={className}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {label}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-xl border border-black/15 bg-white py-1 shadow-lg"
        >
          {ranges && (
            <label className="block px-3 py-2 text-xs font-semibold text-[#202621]">
              Range
              <select
                className="mt-1 w-full rounded-lg border border-black/25 bg-white px-2 py-1 text-sm font-normal text-[#202621]"
                value={range}
                onChange={(e) => setRange(e.target.value)}
              >
                {ranges.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </label>
          )}
          <button type="button" role="menuitem" className={itemCls} disabled={busy} onClick={() => run('xlsx')}>
            {busy ? 'Preparing…' : 'Download CSV'}
          </button>
          <button type="button" role="menuitem" className={itemCls} disabled={busy} onClick={() => run('pdf')}>
            Print / Save as PDF
          </button>
        </div>
      )}
    </div>
  )
}