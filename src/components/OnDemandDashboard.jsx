import { useMemo, useState } from 'react'
import { journeyLabel } from '../data/config'
import { SEGMENT, npsColor, CATEGORICAL } from '../theme/palette'
import { GROUPABLE, facets, groupBy, npsOf, distribution, loanDistribution } from '../logic/analytics'
import { LoanDistribution } from './Panels'

const COLUMNS = [
  { key: 'responseId', label: 'Response ID', hint: 'Unique per submitted survey' },
  { key: 'submittedOn', label: 'Submitted', hint: 'Date the customer submitted' },
  { key: 'journey', label: 'Journey', hint: 'Which survey this response belongs to', fmt: journeyLabel },
  { key: 'fullName', label: 'Customer', hint: 'Pre-filled from LMS — not asked on the form' },
  { key: 'state', label: 'State', hint: 'From the customer record' },
  { key: 'city', label: 'City', hint: 'From the customer record' },
  { key: 'loanType', label: 'Loan type', hint: 'Survey question 2 — one of six options' },
  { key: 'portfolio', label: 'Portfolio', hint: 'Derived from loan type' },
  { key: 'loanAmount', label: 'Loan amount', hint: 'Survey question 1 — optional, blank when skipped',
    fmt: (v) => (v == null ? '—' : `₹${v.toLocaleString('en-IN')}`) },
  { key: 'rating', label: 'Rating 0–10', hint: 'Survey question 3 — the recommendation score' },
  { key: 'segment', label: 'Segment', hint: 'Derived: 0–6 detractor, 7–8 passive, 9–10 promoter' },
  { key: 'sentiment', label: 'Sentiment', hint: 'Derived from the segment' },
  { key: 'theme', label: 'AI theme', hint: 'Extracted from the free-text answer' },
  { key: 'improvement', label: 'What could be better', hint: 'Survey question 4 — free text, optional' },
  { key: 'channel', label: 'Channel', hint: 'Email, WhatsApp or AI Call — SMS out of scope' },
  { key: 'delivered', label: 'Delivered', hint: 'Survey delivery confirmed', fmt: (v) => (v ? 'Yes' : 'No') },
  { key: 'clicked', label: 'Clicked', hint: 'Customer opened the survey link', fmt: (v) => (v ? 'Yes' : 'No') },
  { key: 'gender', label: 'Gender', hint: 'From the customer record' },
  { key: 'ageBracket', label: 'Age bracket', hint: 'From the customer record — off the dashboard per MOM 6.4' },
  { key: 'month', label: 'Month', hint: 'Slicer bucket' },
  { key: 'quarter', label: 'Quarter', hint: 'Slicer bucket' },
]

const PAGE = 25

/**
 * MOM 6.12 — "Must expose all underlying data, not a subset. Data clarity to be
 * strong — clear labels and definitions."
 *
 * So: every column on the record, each with a plain-English definition on hover
 * and in the definitions panel, plus search, sort and CSV export. Nothing is
 * hidden behind an aggregate here — this is the table the aggregates come from.
 */
const FILTERS = [
  ['journey', 'Journey'],
  ['state', 'State'],
  ['loanType', 'Loan type'],
  ['portfolio', 'Portfolio'],
  ['channel', 'Channel'],
  ['segment', 'Segment'],
]

export default function OnDemandDashboard({ rows: allRows, onDrill }) {
  const [filters, setFilters] = useState({})
  const [groupKey, setGroupKey] = useState('journey')

  // Filters compose: each one narrows what the next sees, and every panel below
  // reads the same narrowed set.
  const rows = useMemo(
    () => allRows.filter((r) => Object.entries(filters).every(([k, v]) => !v || String(r[k]) === v)),
    [allRows, filters],
  )
  const options = useMemo(() => facets(allRows), [allRows])
  const grouped = useMemo(() => groupBy(rows, groupKey), [rows, groupKey])
  const dist = useMemo(() => distribution(rows), [rows])
  const setFilter = (k, v) => setFilters((f) => ({ ...f, [k]: v || undefined }))
  const clearAll = () => setFilters({})
  const activeCount = Object.values(filters).filter(Boolean).length

  const [query, setQuery] = useState('')
  const [sort, setSort] = useState({ key: 'responseId', dir: 'asc' })
  const [page, setPage] = useState(1)
  const [showDefs, setShowDefs] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const out = q
      ? rows.filter((r) => COLUMNS.some((c) => String(r[c.key] ?? '').toLowerCase().includes(q)))
      : rows
    return [...out].sort((a, b) => {
      const x = a[sort.key] ?? ''
      const y = b[sort.key] ?? ''
      const cmp = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [rows, query, sort])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE))
  const current = Math.min(page, pages)
  const slice = filtered.slice((current - 1) * PAGE, current * PAGE)

  const exportCsv = () => {
    const head = COLUMNS.map((c) => c.label).join(',')
    const body = filtered.map((r) =>
      COLUMNS.map((c) => `"${String(r[c.key] ?? '').replace(/"/g, '""')}"`).join(','),
    ).join('\n')
    const blob = new Blob([`${head}\n${body}`], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `afl-nps-responses-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="space-y-4">
      {/* ---- filters ------------------------------------------------------ */}
      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="card-title">Explore the data</p>
            <p className="card-sub">
              Filter, group and drill — every figure on the dashboard can be reproduced here
            </p>
          </div>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="rounded-full border border-surface-line px-3 py-1.5 text-[11px] font-semibold text-ink-muted hover:text-brand"
            >
              Clear {activeCount} filter{activeCount === 1 ? '' : 's'}
            </button>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {FILTERS.map(([key, label]) => (
            <label key={key} className="block">
              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-ink-faint">{label}</span>
              <select
                value={filters[key] || ''}
                onChange={(e) => setFilter(key, e.target.value)}
                className="h-9 w-full rounded-xl border border-surface-line bg-white px-2.5 text-[12px] text-ink-soft outline-none focus:border-brand"
              >
                <option value="">All</option>
                {options[key].map((v) => (
                  <option key={v} value={v}>{key === 'journey' ? journeyLabel(v) : v}</option>
                ))}
              </select>
            </label>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Responses', value: rows.length.toLocaleString('en-IN') },
            { label: 'NPS', value: npsOf(rows) >= 0 ? `+${npsOf(rows)}` : npsOf(rows), color: npsColor(npsOf(rows)) },
            { label: 'Promoters', value: `${dist.promoters}%`, color: SEGMENT.promoter },
            { label: 'Detractors', value: `${dist.detractors}%`, color: SEGMENT.detractor },
          ].map((m) => (
            <div key={m.label} className="rounded-xl bg-surface-alt px-3.5 py-3">
              <p className="text-xl font-bold leading-none" style={{ color: m.color || '#1D1D1F' }}>{m.value}</p>
              <p className="mt-1 text-[11px] text-ink-faint">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ---- group-by explorer -------------------------------------------- */}
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 p-5 pb-3">
          <div>
            <p className="card-title">Break it down</p>
            <p className="card-sub">Group the current selection by any dimension · click a row to read those responses</p>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {GROUPABLE.map((g) => (
              <button
                key={g.key}
                type="button"
                onClick={() => setGroupKey(g.key)}
                aria-pressed={groupKey === g.key}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                  groupKey === g.key ? 'bg-brand text-white' : 'border border-surface-line text-ink-muted hover:text-brand'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[420px] overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-surface-alt">
              <tr className="border-y border-surface-line">
                {[GROUPABLE.find((g) => g.key === groupKey)?.label, 'Responses', 'Share', 'Mix', 'Avg rating', 'NPS'].map((h) => (
                  <th key={h} className="whitespace-nowrap px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-ink-faint">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grouped.map((g) => (
                <tr
                  key={g.value}
                  onClick={() => onDrill?.(groupKey, g.value)}
                  className="cursor-pointer border-b border-surface-line/60 transition-colors hover:bg-surface-alt"
                >
                  <td className="whitespace-nowrap px-5 py-2.5 text-[12px] font-semibold text-ink">
                    {groupKey === 'journey' ? journeyLabel(g.value) : g.value}
                  </td>
                  <td className="px-5 py-2.5 text-[12px] text-ink-muted">{g.responses.toLocaleString('en-IN')}</td>
                  <td className="px-5 py-2.5">
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-page">
                        <span className="block h-full rounded-full" style={{ width: `${g.pct}%`, background: CATEGORICAL[0] }} />
                      </span>
                      <span className="text-[11px] text-ink-faint">{g.pct}%</span>
                    </span>
                  </td>
                  <td className="px-5 py-2.5">
                    <span className="flex h-1.5 w-28 overflow-hidden rounded-full" title={`${g.promoters} / ${g.passives} / ${g.detractors}`}>
                      <span style={{ width: `${(g.promoters / g.responses) * 100}%`, background: SEGMENT.promoter }} />
                      <span style={{ width: `${(g.passives / g.responses) * 100}%`, background: SEGMENT.passive }} />
                      <span style={{ width: `${(g.detractors / g.responses) * 100}%`, background: SEGMENT.detractor }} />
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-[12px] text-ink-muted">{g.avgRating}</td>
                  <td className="px-5 py-2.5 text-[12px] font-bold" style={{ color: npsColor(g.nps) }}>
                    {g.nps >= 0 ? `+${g.nps}` : g.nps}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOM 6.11 — the progression table lives here so users can play with it */}
      <LoanDistribution stages={loanDistribution(rows)} />

      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="card-title">On-Demand Dashboard</p>
            <p className="card-sub">
              Every field behind the dashboard — {rows.length.toLocaleString('en-IN')} responses, {COLUMNS.length} columns, nothing aggregated away
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDefs((s) => !s)}
              className="rounded-full border border-surface-line px-3 py-1.5 text-[11px] font-semibold text-ink-muted hover:text-brand"
            >
              {showDefs ? 'Hide definitions' : 'Show definitions'}
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="rounded-full bg-brand px-3.5 py-1.5 text-[11px] font-semibold text-white hover:bg-brand-dark"
            >
              Export CSV
            </button>
          </div>
        </div>

        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1) }}
          placeholder="Search any field — customer, state, theme, loan type…"
          className="mt-4 h-9 w-full rounded-xl border border-surface-line bg-white px-3.5 text-sm outline-none focus:border-brand"
        />

        {showDefs && (
          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-1.5 rounded-xl bg-surface-alt p-4 sm:grid-cols-2 lg:grid-cols-3">
            {COLUMNS.map((c) => (
              <p key={c.key} className="text-[11px] leading-snug">
                <strong className="text-ink">{c.label}</strong>
                <span className="text-ink-faint"> — {c.hint}</span>
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="max-h-[620px] overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-surface-alt">
              <tr className="border-b border-surface-line">
                {COLUMNS.map((c) => (
                  <th
                    key={c.key}
                    title={c.hint}
                    onClick={() => setSort((s) => ({ key: c.key, dir: s.key === c.key && s.dir === 'asc' ? 'desc' : 'asc' }))}
                    className="cursor-pointer whitespace-nowrap px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-ink-faint hover:text-brand"
                  >
                    {c.label}{sort.key === c.key ? (sort.dir === 'asc' ? ' ↑' : ' ↓') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slice.map((r) => (
                <tr key={r.responseId} className="border-b border-surface-line/60 hover:bg-surface-alt">
                  {COLUMNS.map((c) => (
                    <td
                      key={c.key}
                      className="whitespace-nowrap px-3 py-2 text-[11px] text-ink-soft"
                      style={c.key === 'segment' ? { color: SEGMENT[r.segment], fontWeight: 600 } : undefined}
                    >
                      {c.key === 'improvement'
                        ? <span className="block max-w-[280px] truncate" title={r.improvement}>{r.improvement || '—'}</span>
                        : c.fmt ? c.fmt(r[c.key]) : (r[c.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-surface-line px-5 py-3">
          <p className="text-[11px] text-ink-faint">
            Showing <strong className="text-ink-soft">{slice.length}</strong> of{' '}
            {filtered.length.toLocaleString('en-IN')} responses
          </p>
          <div className="flex items-center gap-1">
            <button type="button" disabled={current <= 1} onClick={() => setPage(current - 1)}
                    className="rounded-lg border border-surface-line px-2.5 py-1 text-[11px] font-semibold text-ink-muted disabled:opacity-40">
              Prev
            </button>
            <span className="px-2 text-[11px] text-ink-faint">{current} / {pages}</span>
            <button type="button" disabled={current >= pages} onClick={() => setPage(current + 1)}
                    className="rounded-lg border border-surface-line px-2.5 py-1 text-[11px] font-semibold text-ink-muted disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
