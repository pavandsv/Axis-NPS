import Chart from './charts/Chart'
import { CATEGORICAL, CHROME, SEGMENT, npsColor } from '../theme/palette'

const npsChip = (n) => (n >= 0 ? `+${n}` : `${n}`)

/** NPS distribution — the definition of the score. */
export function NpsDistribution({ dist, onDrill }) {
  const parts = [
    { label: 'Promoters', seg: 'promoter', value: dist.promoters, count: dist.counts.promoters, color: SEGMENT.promoter },
    { label: 'Passives', seg: 'passive', value: dist.passives, count: dist.counts.passives, color: SEGMENT.passive },
    { label: 'Detractors', seg: 'detractor', value: dist.detractors, count: dist.counts.detractors, color: SEGMENT.detractor },
  ]
  return (
    <div className="card p-5">
      <p className="card-title">NPS Distribution</p>
      <p className="card-sub">Promoters 9–10 · Passives 7–8 · Detractors 0–6</p>
      <Chart
        type="doughnut"
        height={160}
        data={{
          labels: parts.map((p) => p.label),
          datasets: [{ data: parts.map((p) => p.value), backgroundColor: parts.map((p) => p.color), borderWidth: 0, cutout: '68%' }],
        }}
        options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
      />
      <p className="mt-3 text-center text-[10px] font-medium text-brand">✣ Click a segment to read those responses</p>
      <div className="mt-2 grid grid-cols-3 text-center">
        {parts.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => onDrill?.(p.seg, p.label)}
            className="rounded-lg py-1 transition-colors hover:bg-surface-alt"
          >
            <p className="text-lg font-bold" style={{ color: p.color }}>{p.value}%</p>
            <p className="text-[11px] text-ink-faint">{p.label}</p>
            <p className="text-[10px] text-ink-faint">{p.count.toLocaleString('en-IN')}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

/** MOM 6.3 — a card per journey, each carrying its own NPS. */
export function JourneyScores({ scores, journey, onJourney, trend }) {
  return (
    <div className="card p-5 lg:col-span-2">
      <p className="card-title">Journey NPS Scores</p>
      <p className="card-sub">{scores.length} journeys · click one to filter the dashboard</p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {scores.map((s) => {
          const active = journey === s.key
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => onJourney(active ? 'all' : s.key)}
              className={`rounded-xl border px-2.5 py-2.5 text-center transition-all ${
                active ? 'border-brand bg-brand-tint' : 'border-surface-line bg-surface-alt hover:border-brand/40'
              }`}
            >
              <span className="block text-lg font-bold" style={{ color: npsColor(s.nps) }}>{npsChip(s.nps)}</span>
              <span className="mt-0.5 block truncate text-[11px] text-ink-soft" title={s.label}>{s.label}</span>
              <span className="block text-[10px] text-ink-faint">{s.responses} resp</span>
            </button>
          )
        })}
      </div>

      <div className="mt-4">
        <Chart
          type="line"
          height={120}
          data={{
            labels: trend.map((t) => t.label),
            datasets: [{
              data: trend.map((t) => t.nps),
              borderColor: CATEGORICAL[0],
              backgroundColor: 'rgba(151,20,77,0.08)',
              borderWidth: 2, fill: true, tension: 0.4, pointRadius: 3,
              pointBackgroundColor: CATEGORICAL[0],
            }],
          }}
          options={{
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { display: false }, ticks: { font: { size: 10 }, color: CHROME.axis } },
              y: { grid: { color: CHROME.grid }, ticks: { font: { size: 10 }, color: CHROME.axis } },
            },
          }}
        />
      </div>
    </div>
  )
}

/** MOM 6.2 — Sent, Delivered, Clicked. SMS removed from scope entirely. */
export function ChannelPerformance({ channels, onDrill }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="card-title">Channel Performance</p>
          <p className="card-sub">Sent · Delivered · Clicked — SMS out of scope</p>
          <p className="mt-1 text-[10px] font-medium text-brand">✣ Click a channel to read its responses</p>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {channels.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => onDrill?.(c.key)}
            className="w-full rounded-xl border border-surface-line p-3.5 text-left transition-colors hover:border-brand/40 hover:bg-surface-alt"
          >
            <div className="flex items-center gap-3">
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-ink">{c.label}</span>
                <span className="block text-[10px] text-ink-faint">{c.sub}</span>
              </span>
              <span className="pill pill-brand">NPS {npsChip(c.nps)}</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[['Sent', c.sent, 100], ['Delivered', c.delivered, c.deliveredPct], ['Clicked', c.clicked, c.clickedPct]].map(
                ([label, value, pct]) => (
                  <div key={label}>
                    <p className="text-[13px] font-bold text-ink" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {value.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-ink-faint">{label} · {pct}%</p>
                  </div>
                ),
              )}
            </div>
            <div className="mt-2 flex h-1 overflow-hidden rounded-full bg-surface-page">
              <span style={{ width: `${c.clickedPct}%`, background: c.color }} />
              <span style={{ width: `${c.deliveredPct - c.clickedPct}%`, background: `${c.color}55` }} />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

/** MOM 6.5 — loan type performance shown percent-wise, with NPS. */
export function LoanTypePerformance({ rows, onDrill }) {
  return (
    <div className="card p-5">
      <p className="card-title">Loan Type Performance</p>
      <p className="card-sub">Share of responses and NPS by product</p>
      <p className="mt-1 text-[10px] font-medium text-brand">✣ Click a product to drill in</p>
      <div className="mt-4 space-y-3.5">
        {rows.map((l, i) => (
          <button key={l.label} type="button" onClick={() => onDrill?.(l.label)} className="block w-full text-left">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: CATEGORICAL[i % CATEGORICAL.length] }} />
              <span className="text-[12px] font-medium text-ink-soft">{l.label}</span>
              <span className="ml-auto text-[12px] font-bold" style={{ color: npsColor(l.nps) }}>NPS {npsChip(l.nps)}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-page">
                <span className="block h-full rounded-full" style={{ width: `${l.pct}%`, background: CATEGORICAL[i % CATEGORICAL.length] }} />
              </span>
              <span className="w-16 text-right text-[10px] text-ink-faint">{l.pct}% · {l.responses}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

/** MOM 6.4 — portfolio replaces the age-group panel, keeping the NPS linkage. */
export function PortfolioPerformance({ rows, onDrill }) {
  return (
    <div className="card p-5">
      <p className="card-title">Portfolio — NPS</p>
      <p className="card-sub">Replaces age-group view · NPS retained per MOM 6.4</p>
      <Chart
        type="bar"
        height={180}
        data={{
          labels: rows.map((r) => r.label),
          datasets: [{
            data: rows.map((r) => r.nps),
            backgroundColor: rows.map((r) => npsColor(r.nps)),
            borderRadius: 6, maxBarThickness: 46,
          }],
        }}
        options={{
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 }, color: CHROME.axis } },
            y: { grid: { color: CHROME.grid }, ticks: { font: { size: 10 }, color: CHROME.axis } },
          },
        }}
      />
      <div className="mt-3 space-y-1.5">
        {rows.map((r) => (
          <button
            key={r.label}
            type="button"
            onClick={() => onDrill?.(r.label)}
            className="flex w-full items-center gap-2 rounded-lg px-1 py-0.5 text-[11px] transition-colors hover:bg-surface-alt"
          >
            <span className="text-ink-soft">{r.label}</span>
            <span className="text-ink-faint">{r.loanTypes.join(' · ')}</span>
            <span className="ml-auto font-semibold text-ink">{r.pct}%</span>
            <span className="w-12 text-right font-bold" style={{ color: npsColor(r.nps) }}>{npsChip(r.nps)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/** MOM 6.7 / 6.8 — top 5 recommendations, not four. */
export function ThemePanel({ title, sub, rows, tone, onDrill }) {
  const color = tone === 'good' ? SEGMENT.promoter : SEGMENT.detractor
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="card-title">{title}</p>
          <p className="card-sub">{sub}</p>
        </div>
        <span className="pill pill-grey">Top {rows.length}</span>
      </div>
      <div className="mt-4 space-y-3.5">
        {rows.map((r, i) => (
          <button key={r.name} type="button" onClick={() => onDrill?.(r.name)} className="block w-full text-left">
            <div className="flex items-center gap-2">
              <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded text-[9px] font-bold"
                    style={{ background: `${color}22`, color }}>
                {i + 1}
              </span>
              <span className="text-[12px] font-medium text-ink-soft">{r.name}</span>
              <span className="ml-auto text-[12px] font-bold" style={{ color }}>{r.pct}%</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-page">
                <span className="block h-full rounded-full" style={{ width: `${r.pct}%`, background: color }} />
              </span>
              <span className="w-20 text-right text-[10px] text-ink-faint">{r.mentions} mentions</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

/** MOM 6.11 — of 100 customers who took a loan, how many progressed. */
export function LoanDistribution({ stages, onDrill }) {
  return (
    <div className="card overflow-hidden">
      <div className="p-5 pb-3">
        <p className="card-title">Loan Distribution — stage progression</p>
        <p className="card-sub">Of every 100 customers who applied, how many reached each stage</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-alt">
            <tr className="border-y border-surface-line">
              {['Stage', 'Per 100 customers', 'Customers', 'Drop-off', 'NPS'].map((h) => (
                <th key={h} className="whitespace-nowrap px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-ink-faint">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stages.map((s, i) => (
              <tr
                key={s.stage}
                onClick={() => onDrill?.(s.stage)}
                className="cursor-pointer border-b border-surface-line/70 transition-colors hover:bg-surface-alt"
              >
                <td className="whitespace-nowrap px-5 py-3 text-[12px] font-semibold text-ink">{s.stage}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-28 overflow-hidden rounded-full bg-surface-page">
                      <span className="block h-full rounded-full" style={{ width: `${s.per100}%`, background: CATEGORICAL[0] }} />
                    </span>
                    <span className="text-[12px] font-bold text-ink">{s.per100}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-[12px] text-ink-muted">{s.customers.toLocaleString('en-IN')}</td>
                <td className="px-5 py-3 text-[12px]">
                  {i === 0 ? <span className="text-ink-faint">—</span>
                    : <span style={{ color: SEGMENT.detractor }}>−{s.dropOff}</span>}
                </td>
                <td className="px-5 py-3 text-[12px] font-bold" style={{ color: npsColor(s.nps) }}>{npsChip(s.nps)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
