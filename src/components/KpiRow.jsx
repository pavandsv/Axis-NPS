import { BRAND, BRAND_DARK, SEGMENT } from '../theme/palette'

/**
 * MOM 6.1 — "Add the NPS score inside each widget." Every tile now carries the
 * NPS of the slice it describes, so a reader never has to hold the headline in
 * their head while looking at a sub-metric.
 */
export default function KpiRow({ k, dist, onDrill }) {
  const cards = [
    {
      key: 'all',
      label: 'Total Responses',
      value: k.responses.toLocaleString('en-IN'),
      nps: k.nps,
      foot: `${k.sent.toLocaleString('en-IN')} surveys sent`,
    },
    {
      key: 'clicked',
      label: 'Response Rate',
      value: `${k.responseRate}%`,
      nps: k.npsClicked,
      foot: `${k.clicked.toLocaleString('en-IN')} clicked through`,
    },
    {
      key: 'detractors',
      label: 'SLA Compliance',
      value: `${k.slaCompliance}%`,
      nps: k.npsDelivered,
      foot: `${k.breached} bot-call cases breached`,
      warn: true,
    },
    {
      key: 'detractors',
      label: 'Detractor Cases',
      value: k.detractorCases.toLocaleString('en-IN'),
      cost: k.npsCost,
      foot: 'routed to the AI bot-calling activity',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <div
        className="card overflow-hidden p-5 text-white"
        style={{ background: `linear-gradient(145deg, ${BRAND} 0%, ${BRAND_DARK} 100%)` }}
      >
        <p className="kpi-label text-white/60">Overall NPS</p>
        <p className="kpi-value mt-2">{k.nps >= 0 ? `+${k.nps}` : k.nps}</p>
        <div className="mt-3 flex gap-1">
          {[
            ['promoter', dist.promoters],
            ['passive', dist.passives],
            ['detractor', dist.detractors],
          ].map(([seg, pct]) => (
            <span
              key={seg}
              title={`${seg} ${pct}%`}
              className="h-1.5 rounded-full"
              style={{ width: `${pct}%`, background: SEGMENT[seg] }}
            />
          ))}
        </div>
        <p className="mt-2 text-[10px] text-white/60">
          {dist.promoters}% promoters · {dist.passives}% passives · {dist.detractors}% detractors
        </p>
      </div>

      {cards.map((c) => (
        <button
          key={c.label}
          type="button"
          onClick={() => onDrill?.(c.key)}
          className="card flex flex-col p-5 text-left transition-all hover:-translate-y-0.5 hover:border-brand/30"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="kpi-label">{c.label}</p>
            {/* the NPS of this slice, per MOM 6.1 */}
            {c.cost != null ? (
              <span className="pill pill-red" title="Points these detractors take off the NPS">
                −{c.cost} pts NPS
              </span>
            ) : (
              <span className="pill pill-brand">NPS {c.nps >= 0 ? `+${c.nps}` : c.nps}</span>
            )}
          </div>
          <p className={`kpi-value mt-2 ${c.warn ? 'text-amber-600' : 'text-ink'}`}>{c.value}</p>
          <p className="mt-auto pt-3 text-[10px] text-ink-faint">{c.foot}</p>
        </button>
      ))}
    </div>
  )
}
