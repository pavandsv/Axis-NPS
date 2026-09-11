import { useState } from 'react'
import { SEGMENT, npsColor } from '../theme/palette'

const STATUS_PILL = {
  Escalated: 'pill-red',
  'Bot Calling': 'pill-amber',
  Analysed: 'pill-blue',
  Queued: 'pill-grey',
  Resolved: 'pill-green',
}

/**
 * MOM 3 — the Desk ticket is removed. A ticket does not tell Axis Finance WHY a
 * customer is unhappy, so a detractor now goes into a bot-calling activity: the
 * bot places the call, the transcript is analysed, and that feeds the dashboard.
 *
 * MOM 3.2 — two agents. MOM 3.3 — escalation goes INTERNALLY to Axis Finance,
 * never to the customer. MOM 3.5 — the conversation supports English and Hindi.
 */
export default function BotCallQueue({ queue, k }) {
  const [open, setOpen] = useState(null)

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-2 p-5 pb-4">
        <div>
          <p className="card-title">Detractor Closed Loop — AI bot calling</p>
          <p className="card-sub">
            Desk ticket removed · the bot calls to understand the concern, then the transcript is analysed
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="pill pill-grey">2 agents</span>
          <span className="pill pill-amber">{queue.length} in queue</span>
          <span className="pill pill-red">{k.breached} SLA breached</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-alt">
            <tr className="border-y border-surface-line">
              {['Customer', 'Journey', 'Score', 'AI Theme', 'Agent', 'Language', 'Status'].map((h) => (
                <th key={h} className="whitespace-nowrap px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {queue.map((c) => (
              <>
                <tr
                  key={c.responseId}
                  onClick={() => setOpen(open === c.responseId ? null : c.responseId)}
                  className="cursor-pointer border-b border-surface-line/70 transition-colors hover:bg-surface-alt"
                >
                  <td className="whitespace-nowrap px-5 py-3">
                    <span className="block text-[12px] font-semibold text-ink">{c.name}</span>
                    <span className="block text-[10px] text-ink-faint">{c.state}</span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-[12px] text-ink-muted">{c.journey}</td>
                  <td className="px-5 py-3">
                    <span className="pill" style={{ background: `${SEGMENT.detractor}18`, color: SEGMENT.detractor }}>
                      {c.rating}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[11px] text-ink-soft">{c.theme}</td>
                  <td className="px-5 py-3 text-[11px] text-ink-muted">{c.agent}</td>
                  <td className="px-5 py-3">
                    <span className="pill pill-grey">{c.language}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`pill ${STATUS_PILL[c.status]}`}>{c.status}</span>
                  </td>
                </tr>
                {open === c.responseId && (
                  <tr key={`${c.responseId}-x`} className="border-b border-surface-line/70 bg-surface-alt">
                    <td colSpan={7} className="px-5 py-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                        What the customer said
                      </p>
                      <p className="mt-1 text-[12px] italic text-ink-soft">“{c.feedback}”</p>

                      <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-brand">
                        Bot call outcome
                      </p>
                      <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
                        Bot called in {c.language} and confirmed the concern is <strong>{c.theme}</strong>.
                        Transcript analysed and attached to the response record.
                        Assigned to <strong>{c.agent}</strong>.
                      </p>

                      <p className="mt-3 rounded-lg bg-white px-3 py-2 text-[11px] text-ink-muted ring-1 ring-surface-line">
                        Escalation email goes <strong>internally to Axis Finance</strong>, not to the
                        customer, so the responsible team acts on this activity.
                      </p>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-surface-line px-5 py-3 text-[11px] text-ink-faint">
        <span>SLA compliance <strong className="text-ink-soft">{k.slaCompliance}%</strong></span>
        <span>Avg resolution <strong className="text-ink-soft">{k.avgResolution} days</strong></span>
        <span>Detractor cases <strong className="text-ink-soft">{k.detractorCases}</strong></span>
        <span>Bot conversation <strong className="text-ink-soft">English &amp; Hindi</strong></span>
      </div>
    </div>
  )
}
