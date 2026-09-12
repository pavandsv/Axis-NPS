import { useMemo, useState } from 'react'
import Chart from './charts/Chart'
import { PROMPTS } from '../data/prompts'
import { GROUPABLE, groupBy, npsOf, distribution } from '../logic/analytics'
import { journeyLabel } from '../data/config'
import { CATEGORICAL, CHROME, SEGMENT, npsColor } from '../theme/palette'

/**
 * MOM 6.12 / 6.13 — the On-Demand Dashboard, driven by a prompt.
 *
 * There is no model behind this and it does not pretend otherwise: each prompt
 * is a saved question with a fixed recipe, so the same question always builds
 * the same dashboard. When a model is wired in later it only has to emit the
 * same recipe shape — the rendering below does not change.
 */
export default function PromptDashboard({ rows, onDrill }) {
  const [id, setId] = useState(PROMPTS[0].id)
  const [open, setOpen] = useState(false)
  const prompt = PROMPTS.find((p) => p.id === id)

  const { data, scoped } = useMemo(() => {
    const scopedRows = rows.filter((r) =>
      Object.entries(prompt.filter || {}).every(([k, v]) => r[k] === v),
    )
    let g = groupBy(scopedRows, prompt.groupBy).map((x) => ({
      ...x,
      label: prompt.groupBy === 'journey' ? journeyLabel(x.value) : x.value,
    }))
    if (prompt.order) {
      g = prompt.order.map((o) => g.find((x) => x.value === o)).filter(Boolean)
    } else if (prompt.sort === 'asc') {
      g = [...g].sort((a, b) => a[prompt.metric] - b[prompt.metric])
    } else if (prompt.sort === 'desc') {
      g = [...g].sort((a, b) => b[prompt.metric] - a[prompt.metric])
    }
    return { data: g, scoped: scopedRows }
  }, [rows, prompt])

  const dist = distribution(scoped)
  const values = data.map((d) => d[prompt.metric])
  const isNps = prompt.metric === 'nps'

  return (
    <div className="space-y-4">
      {/* ---- the prompt bar ---------------------------------------------- */}
      <div className="card p-5">
        <p className="card-title">Ask the dashboard</p>
        <p className="card-sub">
          Pick a question and the dashboard builds itself · {PROMPTS.length} prompts configured
        </p>

        <div className="relative mt-4">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex w-full items-center gap-3 rounded-xl border border-surface-line bg-white px-4 py-3 text-left transition-colors hover:border-brand/40"
          >
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand-tint text-[13px] text-brand">✦</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-semibold text-ink">{prompt.q}</span>
              <span className="block truncate text-[11px] text-ink-faint">{prompt.hint}</span>
            </span>
            <span className="flex-shrink-0 text-ink-faint">{open ? '▲' : '▼'}</span>
          </button>

          {open && (
            <div className="absolute z-20 mt-2 max-h-[340px] w-full overflow-y-auto rounded-xl border border-surface-line bg-white p-1.5 shadow-lg">
              {PROMPTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { setId(p.id); setOpen(false) }}
                  className={`flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors ${
                    p.id === id ? 'bg-brand-tint' : 'hover:bg-surface-alt'
                  }`}
                >
                  <span className="mt-0.5 text-[11px] text-brand">✦</span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-medium text-ink">{p.q}</span>
                    <span className="block text-[11px] text-ink-faint">{p.hint}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---- the answer --------------------------------------------------- */}
      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="card-title">{prompt.q}</p>
            <p className="card-sub">
              {scoped.length.toLocaleString('en-IN')} responses · grouped by{' '}
              {GROUPABLE.find((g) => g.key === prompt.groupBy)?.label.toLowerCase()}
            </p>
          </div>
          <div className="flex gap-2">
            <span className="pill pill-grey">{scoped.length.toLocaleString('en-IN')} responses</span>
            {scoped.length > 0 && (
              <span className="pill pill-brand">NPS {npsOf(scoped) >= 0 ? `+${npsOf(scoped)}` : npsOf(scoped)}</span>
            )}
          </div>
        </div>

        {data.length === 0 ? (
          <p className="py-16 text-center text-[12px] text-ink-faint">
            Nothing matches this question in the current selection.
          </p>
        ) : (
          <>
            <div className="mt-4">
              <Chart
                type={prompt.chart}
                height={260}
                onSelect={(i) => onDrill?.(prompt.groupBy, data[i].value, prompt.filter)}
                data={{
                  labels: data.map((d) => d.label),
                  datasets: [{
                    data: values,
                    backgroundColor: isNps
                      ? data.map((d) => npsColor(d.nps))
                      : data.map((_, i) => CATEGORICAL[i % CATEGORICAL.length]),
                    borderColor: CATEGORICAL[0],
                    borderWidth: prompt.chart === 'line' ? 2 : 0,
                    fill: prompt.chart === 'line',
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: CATEGORICAL[0],
                    borderRadius: 6,
                    maxBarThickness: 44,
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: prompt.chart === 'bar' && data.length > 7 ? 'y' : 'x',
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (c) => {
                          const d = data[c.dataIndex]
                          return isNps
                            ? `NPS ${d.nps >= 0 ? '+' : ''}${d.nps} · ${d.responses} responses`
                            : `${d.responses} responses · ${d.pct}% · NPS ${d.nps >= 0 ? '+' : ''}${d.nps}`
                        },
                      },
                    },
                  },
                  scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 10 }, color: CHROME.axis } },
                    y: { grid: { color: CHROME.grid }, ticks: { font: { size: 10 }, color: CHROME.axis } },
                  },
                }}
              />
            </div>

            <div className="mt-4 flex gap-3 rounded-xl bg-brand-tint p-3.5">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand text-[11px] text-white">✦</span>
              <div>
                <p className="text-[12px] font-semibold text-brand">What this says</p>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{prompt.takeaway(data)}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ---- the numbers behind it ---------------------------------------- */}
      {data.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-5 pb-3">
            <p className="card-title">The numbers behind it</p>
            <p className="card-sub">Click any row to read those responses</p>
          </div>
          <div className="max-h-[380px] overflow-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-surface-alt">
                <tr className="border-y border-surface-line">
                  {[GROUPABLE.find((g) => g.key === prompt.groupBy)?.label, 'Responses', 'Share', 'Mix', 'Avg rating', 'NPS'].map((h) => (
                    <th key={h} className="whitespace-nowrap px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-ink-faint">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr
                    key={d.value}
                    onClick={() => onDrill?.(prompt.groupBy, d.value, prompt.filter)}
                    className="cursor-pointer border-b border-surface-line/60 transition-colors hover:bg-surface-alt"
                  >
                    <td className="whitespace-nowrap px-5 py-2.5 text-[12px] font-semibold text-ink">{d.label}</td>
                    <td className="px-5 py-2.5 text-[12px] text-ink-muted">{d.responses.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-2.5 text-[12px] text-ink-muted">{d.pct}%</td>
                    <td className="px-5 py-2.5">
                      <span className="flex h-1.5 w-24 overflow-hidden rounded-full">
                        <span style={{ width: `${(d.promoters / d.responses) * 100}%`, background: SEGMENT.promoter }} />
                        <span style={{ width: `${(d.passives / d.responses) * 100}%`, background: SEGMENT.passive }} />
                        <span style={{ width: `${(d.detractors / d.responses) * 100}%`, background: SEGMENT.detractor }} />
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-[12px] text-ink-muted">{d.avgRating}</td>
                    <td className="px-5 py-2.5 text-[12px] font-bold" style={{ color: npsColor(d.nps) }}>
                      {d.nps >= 0 ? `+${d.nps}` : d.nps}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
