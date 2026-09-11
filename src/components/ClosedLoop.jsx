import { useState } from 'react'
import { CLOSED_LOOP_CASES } from '../data/cases'

const STATUS_LABEL = {
  breached: 'SLA Breached',
  inprogress: 'In Progress',
  resolved: 'Resolved',
  assigned: 'Assigned',
}

/**
 * Closing the loop on detractors. Clicking a row opens the AI-drafted reply —
 * the draft is the product feature, so it is one click away, not buried.
 */
export default function ClosedLoop({ aiEnabled }) {
  const [open, setOpen] = useState(null)
  const breached = CLOSED_LOOP_CASES.filter((c) => c.statusType === 'breached').length

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-2 p-5 pb-4">
        <div>
          <p className="card-title">Closed-Loop Management</p>
          <p className="card-sub">Click a row to view AI-drafted response</p>
        </div>
        <div className="flex gap-2">
          <span className="pill pill-amber">14 Open</span>
          <span className="pill pill-red">{breached} Breached SLA</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-alt">
            <tr className="border-y border-surface-line">
              {['Customer', 'Journey', 'Score', 'AI Theme', 'AI Draft', 'Status'].map((h) => (
                <th key={h} className="whitespace-nowrap px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CLOSED_LOOP_CASES.map((c) => (
              <>
                <tr
                  key={c.name}
                  onClick={() => setOpen(open === c.name ? null : c.name)}
                  className="cursor-pointer border-b border-surface-line/70 transition-colors hover:bg-surface-alt"
                >
                  <td className="whitespace-nowrap px-5 py-3 text-[12px] font-semibold text-ink">{c.name}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-[12px] text-ink-muted">{c.journey}</td>
                  <td className="px-5 py-3">
                    <span className={`pill ${c.score <= 2 ? 'pill-red' : c.score <= 3 ? 'pill-amber' : 'pill-green'}`}>
                      {c.score}
                    </span>
                  </td>
                  <td className="px-5 py-3"><span className={`pill ${c.thBadge}`}>{c.theme}</span></td>
                  <td className="px-5 py-3">
                    <span className={`pill ${aiEnabled ? 'pill-brand' : 'pill-grey'}`}>
                      {aiEnabled ? '✦' : '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`pill ${c.statusCls}`}>{STATUS_LABEL[c.statusType] || c.statusType}</span>
                  </td>
                </tr>
                {open === c.name && (
                  <tr key={`${c.name}-draft`} className="border-b border-surface-line/70 bg-surface-alt">
                    <td colSpan={6} className="px-5 py-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Customer feedback</p>
                      <p className="mt-1 text-[12px] italic text-ink-soft">“{c.feedback}”</p>
                      {aiEnabled ? (
                        <>
                          <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-brand">AI-drafted response</p>
                          <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{c.reply}</p>
                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(c.reply) }}
                              className="rounded-lg border border-surface-line px-2.5 py-1 text-[11px] font-semibold text-ink-muted hover:text-brand"
                            >
                              Copy text
                            </button>
                          </div>
                        </>
                      ) : (
                        <p className="mt-3 text-[11px] text-ink-faint">
                          AI-drafted responses are restricted for this role.
                        </p>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-surface-line px-5 py-3 text-[11px] text-ink-faint">
        <span>SLA Compliance <strong className="text-ink-soft">88%</strong></span>
        <span>Avg Resolution <strong className="text-ink-soft">1.8 days</strong></span>
        <span>Total cases <strong className="text-ink-soft">49</strong></span>
        <span>AI drafts ready <strong className="text-ink-soft">14</strong></span>
      </div>
    </div>
  )
}
