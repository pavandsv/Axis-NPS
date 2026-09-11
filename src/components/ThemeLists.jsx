import { THEME_RATINGS } from '../data/themes'

function ThemePanel({ title, sub, rows, tone, aiEnabled }) {
  const color = tone === 'good' ? '#10B981' : '#EF4444'
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <span
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[13px]"
            style={{ background: tone === 'good' ? '#D1FAE5' : '#FEE2E2' }}
          >
            {tone === 'good' ? '👍' : '👎'}
          </span>
          <div>
            <p className="card-title">{title}</p>
            <p className="card-sub">{sub}</p>
          </div>
        </div>
        <span className={`pill ${aiEnabled ? (tone === 'good' ? 'pill-green' : 'pill-red') : 'pill-grey'}`}>
          {aiEnabled ? 'AI Extracted' : 'Restricted'}
        </span>
      </div>

      <div className="mt-4 space-y-3.5">
        {rows.map((r) => (
          <div key={r.theme}>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-ink-soft">{r.theme}</span>
              <span className="ml-auto text-[12px] font-bold" style={{ color }}>{r.rating}/5 ★</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="h-1 flex-1 overflow-hidden rounded-full bg-surface-page">
                <span className="block h-full rounded-full" style={{ width: `${(r.rating / 5) * 100}%`, background: color }} />
              </span>
              <span className="w-20 text-right text-[10px] text-ink-faint">{r.mentions} mentions</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function WhatWorkedWell({ aiEnabled }) {
  return (
    <ThemePanel
      title="What Worked Well"
      sub="Themes highly rated by promoters"
      rows={THEME_RATINGS.worked}
      tone="good"
      aiEnabled={aiEnabled}
    />
  )
}

export function NeedsImprovement({ aiEnabled }) {
  return (
    <ThemePanel
      title="Needs Improvement"
      sub="Key pain points from detractors"
      rows={THEME_RATINGS.failed}
      tone="bad"
      aiEnabled={aiEnabled}
    />
  )
}
