/**
 * Export helpers — turn plain rows into a CSV download or a print-to-PDF page.
 * No libraries. Used by components/ExportButton.jsx.
 *
 * Every export is described the same way:
 *   {
 *     title: 'GlowGuard Users',
 *     sections: [{ heading?: 'Totals', columns: ['A', 'B'], rows: [[1, 'x'], ...] }],
 *   }
 */

export function todayKey() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

// ---- CSV -------------------------------------------------------------------

function csvCell(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)

  let s = String(value)
  // A text cell that starts with = + - @ would be run as a formula by Excel,
  // so it is kept as plain text (product names etc. are typed by users).
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  if (/[",\r\n]/.test(s)) s = `"${s.replace(/"/g, '""')}"`
  return s
}

function csvLine(cells) {
  return cells.map(csvCell).join(',')
}

export function buildCsv(data) {
  const lines = []
  const sections = data.sections ?? []

  sections.forEach((section, i) => {
    if (i > 0) lines.push('')
    if (section.heading) lines.push(csvLine([section.heading]))
    lines.push(csvLine(section.columns))
    section.rows.forEach((row) => lines.push(csvLine(row)))
  })

  // The BOM makes Excel read accents and symbols correctly.
  return '\uFEFF' + lines.join('\r\n') + '\r\n'
}

export function downloadBlob(filename, content, mime) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function saveCsv(data, baseName) {
  downloadBlob(`${baseName}-${todayKey()}.csv`, buildCsv(data), 'text/csv;charset=utf-8')
}

// ---- Excel (.xlsx): one sheet per section ---------------------------------
// A small writer with no libraries. An .xlsx file is a zip of XML files; the
// zip here is "stored" (no compression), which every Excel version accepts.

const enc = new TextEncoder()

let crcTable = null
function crc32(bytes) {
  if (!crcTable) {
    crcTable = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      crcTable[n] = c >>> 0
    }
  }
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i++) crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function zipStore(files) {
  const now = new Date()
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()
  const chunks = []
  const central = []
  let offset = 0

  const push = (bytes) => {
    chunks.push(bytes)
    offset += bytes.length
  }

  files.forEach(({ name, content }) => {
    const nameBytes = enc.encode(name)
    const data = enc.encode(content)
    const crc = crc32(data)

    const local = new DataView(new ArrayBuffer(30))
    local.setUint32(0, 0x04034b50, true)
    local.setUint16(4, 20, true)
    local.setUint16(6, 0x0800, true) // UTF-8 names
    local.setUint16(8, 0, true) // stored
    local.setUint16(10, dosTime, true)
    local.setUint16(12, dosDate, true)
    local.setUint32(14, crc, true)
    local.setUint32(18, data.length, true)
    local.setUint32(22, data.length, true)
    local.setUint16(26, nameBytes.length, true)
    local.setUint16(28, 0, true)

    const start = offset
    push(new Uint8Array(local.buffer))
    push(nameBytes)
    push(data)

    const cen = new DataView(new ArrayBuffer(46))
    cen.setUint32(0, 0x02014b50, true)
    cen.setUint16(4, 20, true)
    cen.setUint16(6, 20, true)
    cen.setUint16(8, 0x0800, true)
    cen.setUint16(10, 0, true)
    cen.setUint16(12, dosTime, true)
    cen.setUint16(14, dosDate, true)
    cen.setUint32(16, crc, true)
    cen.setUint32(20, data.length, true)
    cen.setUint32(24, data.length, true)
    cen.setUint16(28, nameBytes.length, true)
    cen.setUint32(42, start, true)
    central.push(new Uint8Array(cen.buffer), nameBytes)
  })

  const centralStart = offset
  central.forEach(push)
  const centralSize = offset - centralStart

  const end = new DataView(new ArrayBuffer(22))
  end.setUint32(0, 0x06054b50, true)
  end.setUint16(8, files.length, true)
  end.setUint16(10, files.length, true)
  end.setUint32(12, centralSize, true)
  end.setUint32(16, centralStart, true)
  push(new Uint8Array(end.buffer))

  return new Blob(chunks, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

const xmlEsc = (v) =>
  String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    // characters XML cannot hold
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')

function colName(i) {
  let n = i + 1
  let out = ''
  while (n > 0) {
    const r = (n - 1) % 26
    out = String.fromCharCode(65 + r) + out
    n = Math.floor((n - 1) / 26)
  }
  return out
}

// Excel sheet names: max 31 chars, none of  [ ] : * ? / \  , and unique.
function sheetNames(sections, title) {
  const used = new Set()
  return sections.map((s, i) => {
    let base = String(s.heading || (sections.length === 1 ? title : `Sheet ${i + 1}`) || `Sheet ${i + 1}`)
      .replace(/[[\]:*?/\\]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 31) || `Sheet ${i + 1}`
    let name = base
    let n = 2
    while (used.has(name.toLowerCase())) {
      const suffix = ` (${n++})`
      name = base.slice(0, 31 - suffix.length) + suffix
    }
    used.add(name.toLowerCase())
    return name
  })
}

function sheetXml(section) {
  const cols = section.columns
  const all = [cols, ...section.rows]

  // column widths from the longest value (capped)
  const widths = cols.map((_, c) =>
    Math.min(60, Math.max(10, ...all.map((r) => String(r[c] ?? '').split('\n')[0].length + 2)))
  )

  const cell = (v, r, c, header) => {
    const ref = `${colName(c)}${r + 1}`
    if (v === null || v === undefined || v === '') return ''
    if (typeof v === 'number' && Number.isFinite(v)) {
      return `<c r="${ref}"${header ? ' s="1"' : ''}><v>${v}</v></c>`
    }
    // Text stays text (no formula injection: it is stored as a string, not run).
    return `<c r="${ref}" t="inlineStr"${header ? ' s="1"' : ''}><is><t xml:space="preserve">${xmlEsc(v)}</t></is></c>`
  }

  const rows = all
    .map((row, r) => `<row r="${r + 1}">${row.map((v, c) => cell(v, r, c, r === 0)).join('')}</row>`)
    .join('')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>
<sheetData>${rows}</sheetData>
</worksheet>`
}

export function buildXlsx(data) {
  const sections = (data.sections ?? []).length
    ? data.sections
    : [{ columns: ['Nothing to show'], rows: [] }]
  const names = sheetNames(sections, data.title)

  const files = [
    {
      name: '[Content_Types].xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
${sections.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('\n')}
</Types>`,
    },
    {
      name: '_rels/.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
    },
    {
      name: 'xl/workbook.xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>${names.map((n, i) => `<sheet name="${xmlEsc(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets>
</workbook>`,
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${sections.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('\n')}
<Relationship Id="rId${sections.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
    },
    {
      name: 'xl/styles.xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE1EADB"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`,
    },
    ...sections.map((s, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, content: sheetXml(s) })),
  ]

  return zipStore(files)
}

export function saveXlsx(data, baseName) {
  const blob = buildXlsx(data)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${baseName}-${todayKey()}.xlsx`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ---- Print / Save as PDF ----------------------------------------------------

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildPrintHtml(data) {
  const sections = (data.sections ?? [])
    .map((s) => {
      const head = s.columns.map((c) => `<th>${esc(c)}</th>`).join('')
      const body = s.rows.length
        ? s.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')
        : `<tr><td colspan="${s.columns.length}" class="empty">Nothing to show.</td></tr>`
      return `${s.heading ? `<h2>${esc(s.heading)}</h2>` : ''}
        <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`
    })
    .join('')

  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(data.title)}</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;color:#1f2a24;margin:24px}
  h1{font-size:20px;margin:0 0 4px;color:#17502f}
  p.meta{font-size:12px;color:#59645d;margin:0 0 18px}
  h2{font-size:15px;margin:20px 0 6px;color:#17502f}
  table{width:100%;border-collapse:collapse;font-size:12px}
  th,td{border:1px solid #b7c0b1;padding:5px 7px;text-align:left;vertical-align:top}
  th{background:#e1eadb}
  tr{page-break-inside:avoid}
  td.empty{color:#59645d;text-align:center}
</style></head><body>
<h1>${esc(data.title)}</h1>
<p class="meta">Exported from GlowGuard on ${esc(todayKey())}</p>
${sections}
</body></html>`
}

export function printPdf(data) {
  const frame = document.createElement('iframe')
  frame.setAttribute('aria-hidden', 'true')
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'
  document.body.appendChild(frame)

  const doc = frame.contentWindow.document
  doc.open()
  doc.write(buildPrintHtml(data))
  doc.close()

  const cleanup = () => setTimeout(() => frame.remove(), 500)
  frame.contentWindow.onafterprint = cleanup

  // Give the page a moment to lay out before the print dialog opens.
  setTimeout(() => {
    frame.contentWindow.focus()
    frame.contentWindow.print()
    // Some browsers never fire `afterprint`; tidy up anyway.
    setTimeout(() => frame.isConnected && frame.remove(), 60000)
  }, 250)
}