import { useMemo, useState } from 'react'
import { wordCloud, sentimentSplit } from '../logic/analytics'
import { SEGMENT } from '../theme/palette'

const LANES = [
  { key: 'Positive', seg: 'promoter', label: 'Positive' },
  { key: 'Neutral', seg: 'passive', label: 'Neutral' },
  { key: 'Negative', seg: 'detractor', label: 'Negative' },
]

/**
 * MOM 6.6 — "Add a word cloud split by positive / negative / neutral."
 *
 * Three lanes rather than one tangled cloud, because the split IS the insight:
 * seeing "documents" tower over the negative lane while "quick" leads the
 * positive one says more than any single blended cloud could. Word size is
 * frequency; the lane supplies the sentiment, so colour never has to carry
 * meaning on its own. Every word keeps its count on hover and in the title.
 */
export default function WordCloud({ rows }) {
  const [focus, setFocus] = useState('all')
  const split = useMemo(() => sentimentSplit(rows), [rows])
  const clouds = useMemo(
    () => Object.fromEntries(LANES.map((l) => [l.key, wordCloud(rows, l.key, 22)])),
    [rows],
  )

  const lanes = focus === 'all' ? LANES : LANES.filter((l) => l.key === focus)
  const pctOf = { Positive: split.positive, Neutral: split.neutral, Negative: split.negative }

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="card-title">Voice of Customer — Sentiment Cloud</p>
          <p className="card-sub">
            Auto-classified from the free-text answer · split by positive, neutral and negative
          </p>
        </div>
        <div className="flex items-center gap-0.5 rounded-full bg-surface-page p-1">
          {['all', ...LANES.map((l) => l.key)].map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setFocus(k)}
              aria-pressed={focus === k}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize transition-all ${
                focus === k ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* The sentiment split as one continuous bar — the proportions the lanes
          below are drawn from, so the reader sees the weighting first. */}
      <div className="mt-4 flex h-2 overflow-hidden rounded-full">
        {LANES.map((l) => (
          <span
            key={l.key}
            title={`${l.label} ${pctOf[l.key]}%`}
            style={{ width: `${pctOf[l.key]}%`, background: SEGMENT[l.seg] }}
          />
        ))}
      </div>

      <div className={`mt-4 grid gap-4 ${lanes.length === 1 ? '' : 'md:grid-cols-3'}`}>
        {lanes.map((lane) => {
          const words = clouds[lane.key]
          const color = SEGMENT[lane.seg]
          return (
            <div key={lane.key} className="rounded-xl border border-surface-line p-4">
              <div className="flex items-baseline justify-between">
                <span className="flex items-center gap-1.5 text-[12px] font-semibold text-ink">
                  <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                  {lane.label}
                </span>
                <span className="text-[13px] font-bold" style={{ color }}>
                  {pctOf[lane.key]}%
                </span>
              </div>
              <div className="mt-1 h-0.5 w-full rounded-full" style={{ background: `${color}33` }}>
                <div className="h-full rounded-full" style={{ width: `${pctOf[lane.key]}%`, background: color }} />
              </div>

              <div className="mt-3 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                {words.length ? (
                  words.map((w) => (
                    <span
                      key={w.text}
                      title={`${w.text} — ${w.value} mentions`}
                      style={{
                        // 11px to 30px by frequency; opacity carries the tail so
                        // rare words recede instead of competing.
                        fontSize: `${11 + w.weight * 19}px`,
                        lineHeight: 1.15,
                        fontWeight: w.weight > 0.55 ? 700 : w.weight > 0.3 ? 600 : 500,
                        color,
                        opacity: 0.45 + w.weight * 0.55,
                      }}
                    >
                      {w.text}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-ink-faint">No comments in this slice</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
