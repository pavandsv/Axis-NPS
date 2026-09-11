import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { journeyLabel } from '../data/config'
import { SEGMENT, npsColor, CATEGORICAL } from '../theme/palette'
import { distribution, npsOf, themes } from '../logic/analytics'

const PAGE = 12

/**
 * The panel behind every number on the dashboard.
 *
 * Every chart, table row, map region and word opens this with the exact rows it
 * was drawn from, so a reader can always get from a figure to the individual
 * survey responses that produced it. It answers three questions in order: how
 * big is this slice, how does it break down, and what did people actually say.
 */
export default function ResponseDrawer({ title, subtitle, rows, onClose }) {
  const [page, setPage] = useState(1)
  const [seg, setSeg] = useState('all')

  const filtered = useMemo(
    () => (seg === 'all' ? rows : rows.filter((r) => r.segment === seg)),
    [rows, seg],
  )
  const dist = useMemo(() => distribution(rows), [rows])
  const topThemes = useMemo(
    () => [...themes(rows, 'detractor', 3), ...themes(rows, 'promoter', 2)],
    [rows],
  )
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE))
  const current = Math.min(page, pages)
  const slice = filtered.slice((current - 1) * PAGE, current * PAGE)

  const kpis = [
    { label: 'Responses', value: rows.length.toLocaleString('en-IN') },
    { label: 'NPS', value: npsOf(rows) >= 0 ? `+${npsOf(rows)}` : npsOf(rows), color: npsColor(npsOf(rows)) },
    { label: 'Promoters', value: `${dist.promoters}%`, color: SEGMENT.promoter },
    { label: 'Detractors', value: `${dist.detractors}%`, color: SEGMENT.detractor },
  ]

  return createPortal(
    <div className="fixed inset-0 z-[1200] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-[1px]" onClick={onClose} />
      <aside className="relative z-10 flex h-full w-full max-w-4xl flex-col bg-surface-page shadow-2xl">
        <header className="flex flex-shrink-0 items-start gap-3 border-b border-surface-line bg-white px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-bold text-ink">{title}</h2>
            <p className="mt-0.5 text-xs text-ink-faint">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-ink-faint transition-colors hover:bg-surface-page hover:text-ink"
          >
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {kpis.map((k) => (
              <div key={k.label} className="card px-3.5 py-3">
                <p className="text-lg font-bold leading-none" style={{ color: k.color || '#1D1D1F' }}>{k.value}</p>
                <p className="mt-1 text-[11px] text-ink-faint">{k.label}</p>
              </div>
            ))}
          </div>

          {/* the mix, as a single proportional bar */}
          <div className="card mt-4 p-4">
            <p className="text-[11px] font-semibold text-ink-soft">Segment mix</p>
            <div className="mt-2 flex h-2.5 overflow-hidden rounded-full">
              {['promoter', 'passive', 'detractor'].map((s) => (
                <span key={s} title={`${s} ${dist[`${s}s`]}%`} style={{ width: `${dist[`${s}s`]}%`, background: SEGMENT[s] }} />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-faint">
              {['promoter', 'passive', 'detractor'].map((s) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: SEGMENT[s] }} />
                  {s}s {dist[`${s}s`]}% · {dist.counts[`${s}s`]}
                </span>
              ))}
            </div>
          </div>

          {topThemes.length > 0 && (
            <div className="card mt-4 p-4">
              <p className="text-[11px] font-semibold text-ink-soft">What they talked about</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {topThemes.map((t, i) => (
                  <span key={t.name} className="pill" style={{ background: `${CATEGORICAL[i % CATEGORICAL.length]}18`, color: CATEGORICAL[i % CATEGORICAL.length] }}>
                    {t.name} · {t.mentions}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-1.5">
            {['all', 'promoter', 'passive', 'detractor'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setSeg(s); setPage(1) }}
                aria-pressed={seg === s}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize transition-all ${
                  seg === s ? 'bg-brand text-white' : 'border border-surface-line text-ink-muted hover:text-brand'
                }`}
              >
                {s}
              </button>
            ))}
            <span className="ml-auto text-[11px] text-ink-faint">{filtered.length.toLocaleString('en-IN')} shown</span>
          </div>

          <div className="card mt-2 overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface-alt">
                <tr className="border-b border-surface-line">
                  {['Customer', 'Journey', 'Product', 'Score', 'What they said'].map((h) => (
                    <th key={h} className="whitespace-nowrap px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-ink-faint">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slice.map((r) => (
                  <tr key={r.responseId} className="border-b border-surface-line/60">
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <span className="block text-[12px] font-semibold text-ink">{r.fullName}</span>
                      <span className="block text-[10px] text-ink-faint">{r.city ? `${r.city}, ` : ''}{r.state}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-[11px] text-ink-muted">{journeyLabel(r.journey)}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-[11px] text-ink-muted">{r.loanType}</td>
                    <td className="px-4 py-2.5">
                      <span className="pill" style={{ background: `${SEGMENT[r.segment]}18`, color: SEGMENT[r.segment] }}>
                        {r.rating}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="block max-w-[320px] text-[11px] italic text-ink-soft" title={r.improvement}>
                        {r.improvement || <span className="not-italic text-ink-faint">— no comment</span>}
                      </span>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-ink-faint">Nothing in this slice</td></tr>
                )}
              </tbody>
            </table>
            {pages > 1 && (
              <div className="flex items-center justify-between border-t border-surface-line px-4 py-2.5">
                <span className="text-[11px] text-ink-faint">Page {current} of {pages}</span>
                <span className="flex gap-1">
                  <button type="button" disabled={current <= 1} onClick={() => setPage(current - 1)}
                          className="rounded-lg border border-surface-line px-2.5 py-1 text-[11px] font-semibold text-ink-muted disabled:opacity-40">Prev</button>
                  <button type="button" disabled={current >= pages} onClick={() => setPage(current + 1)}
                          className="rounded-lg border border-surface-line px-2.5 py-1 text-[11px] font-semibold text-ink-muted disabled:opacity-40">Next</button>
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  )
}
