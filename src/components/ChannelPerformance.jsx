import { CHANNELS } from '../data/roles'

/** Response rate by delivery channel. The vendor under each name is part of
 *  AFL's own stack — Karix, Gupshup, Zoho — so it stays on screen. */
export default function ChannelPerformance() {
  return (
    <div className="card p-5">
      <p className="card-title">Channel Performance</p>
      <p className="card-sub">Response rate by delivery channel</p>

      <div className="mt-5 space-y-3">
        {CHANNELS.map((c) => (
          <div key={c.label} className="rounded-xl border border-surface-line p-3.5">
            <div className="flex items-center gap-3">
              <span
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[11px] font-bold"
                style={{ background: c.tint, color: c.color }}
              >
                {c.label[0]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-ink">{c.label}</span>
                <span className="block text-[10px] text-ink-faint">{c.sub}</span>
              </span>
              <span className="text-right">
                <span className="block text-[15px] font-bold text-ink">{c.pct}%</span>
                <span className="block text-[10px] text-ink-faint">{c.responses} responses</span>
              </span>
            </div>
            <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-surface-page">
              <div className="h-full rounded-full" style={{ width: `${c.pct * 2.4}%`, background: c.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
