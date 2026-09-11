import { useEffect, useMemo, useRef, useState } from 'react'
import { wordCloud, sentimentSplit } from '../logic/analytics'
import { layoutCloud } from '../logic/cloudLayout'
import { SEGMENT } from '../theme/palette'

const LANES = [
  { key: 'Positive', seg: 'promoter' },
  { key: 'Neutral', seg: 'passive' },
  { key: 'Negative', seg: 'detractor' },
]

/**
 * MOM 6.6 — word cloud split by positive / negative / neutral.
 *
 * One cloud rather than three columns: the words compete for the same space, so
 * the eye reads the balance of the feedback directly. Size is frequency, colour
 * is sentiment, and the ring on the left is the sentiment analyser itself —
 * three arcs on one dial, so the split is a shape rather than three numbers.
 *
 * Every word is a button: clicking drills to the responses that used it.
 */
export default function SentimentCloud({ rows, onDrill }) {
  const [focus, setFocus] = useState('all')
  const [hover, setHover] = useState(null)
  const host = useRef(null)
  const [size, setSize] = useState({ w: 900, h: 340 })

  useEffect(() => {
    if (!host.current) return undefined
    const ro = new ResizeObserver(([e]) => {
      const { width } = e.contentRect
      setSize({ w: Math.max(320, width), h: width < 640 ? 360 : 270 })
    })
    ro.observe(host.current)
    return () => ro.disconnect()
  }, [])

  const split = useMemo(() => sentimentSplit(rows), [rows])
  const pctOf = { Positive: split.positive, Neutral: split.neutral, Negative: split.negative }

  const words = useMemo(() => {
    const lanes = focus === 'all' ? LANES : LANES.filter((l) => l.key === focus)
    // Fewer words, chosen well: a cloud stops communicating once it becomes a
    // wall. Top words per lane only.
    const perLane = focus === 'all' ? 9 : 20
    const all = lanes.flatMap((l) =>
      wordCloud(rows, l.key, perLane).map((w) => ({ ...w, sentiment: l.key, seg: l.seg })),
    )
    const max = Math.max(1, ...all.map((w) => w.value))
    return all.map((w) => ({ ...w, weight: w.value / max }))
  }, [rows, focus])

  const placed = useMemo(
    () => layoutCloud(words, {
      width: size.w,
      height: size.h,
      minSize: 14,
      maxSize: size.w < 640 ? 28 : 38,   // a gentler range reads calmer
      padding: 12,
      rotate: false,
      centred: true,
    }),
    [words, size],
  )

  // The dial: three arcs on one ring, proportional to the split.
  const R = 46
  const C = 2 * Math.PI * R
  let offset = 0
  const arcs = LANES.map((l) => {
    const len = (pctOf[l.key] / 100) * C
    const seg = { ...l, len, offset }
    offset += len
    return seg
  })

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="card-title">Voice of Customer — Sentiment Analyser</p>
          <p className="card-sub">
            The words customers used most, sized by how often · click any word to read those responses
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

      <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-[200px_1fr]">
        {/* the analyser dial */}
        <div className="flex flex-row items-center gap-4 lg:flex-col lg:items-stretch">
          <svg viewBox="0 0 120 120" className="h-[120px] w-[120px] flex-shrink-0 lg:mx-auto">
            <circle cx="60" cy="60" r={R} fill="none" stroke="#F0EEF1" strokeWidth="13" />
            {arcs.map((a) => (
              <circle
                key={a.key}
                cx="60" cy="60" r={R}
                fill="none"
                stroke={SEGMENT[a.seg]}
                strokeWidth={hover?.sentiment === a.key || focus === a.key ? 16 : 13}
                strokeDasharray={`${a.len} ${C - a.len}`}
                strokeDashoffset={-a.offset}
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-width 160ms ease' }}
              />
            ))}
            <text x="60" y="56" textAnchor="middle" className="fill-ink" style={{ fontSize: 22, fontWeight: 700 }}>
              {split.positive}%
            </text>
            <text x="60" y="72" textAnchor="middle" className="fill-ink-faint" style={{ fontSize: 9 }}>
              positive
            </text>
          </svg>

          <div className="flex-1 space-y-1.5">
            {LANES.map((l) => (
              <button
                key={l.key}
                type="button"
                onClick={() => setFocus(focus === l.key ? 'all' : l.key)}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors ${
                  focus === l.key ? 'bg-surface-page' : 'hover:bg-surface-alt'
                }`}
              >
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: SEGMENT[l.seg] }} />
                <span className="text-[12px] text-ink-soft">{l.key}</span>
                <span className="ml-auto text-[13px] font-bold" style={{ color: SEGMENT[l.seg] }}>
                  {pctOf[l.key]}%
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* the cloud */}
        <div ref={host} className="relative rounded-xl bg-surface-alt/60 p-1">
          <svg width="100%" height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} role="img"
               aria-label="Word cloud of customer feedback, sized by frequency and coloured by sentiment">
            {placed.map((w) => {
              const active = hover?.text === w.text && hover?.sentiment === w.sentiment
              return (
                <text
                  key={`${w.sentiment}-${w.text}`}
                  x={w.x}
                  y={w.y}
                  textAnchor={w.anchor}
                  onMouseEnter={() => setHover(w)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => onDrill?.(w)}
                  style={{
                    fontSize: w.size,
                    fontWeight: w.fontWeight,
                    fill: SEGMENT[w.seg],
                    opacity: hover && !active ? 0.28 : 0.7 + w.weight * 0.3,
                    cursor: 'pointer',
                    transition: 'opacity 140ms ease',
                  }}
                >
                  {w.text}
                  <title>{`“${w.text}” — ${w.value} mentions · ${w.sentiment.toLowerCase()}`}</title>
                </text>
              )
            })}
          </svg>

          {hover && (
            <div className="pointer-events-none absolute left-3 top-3 rounded-xl bg-white px-3 py-2 shadow-lg ring-1 ring-surface-line">
              <p className="text-[13px] font-bold" style={{ color: SEGMENT[hover.seg] }}>“{hover.text}”</p>
              <p className="text-[11px] text-ink-faint">
                {hover.value} mentions · {hover.sentiment.toLowerCase()} · click to read them
              </p>
            </div>
          )}

          {!placed.length && (
            <p className="py-20 text-center text-[12px] text-ink-faint">No comments in this slice</p>
          )}
        </div>
      </div>
    </div>
  )
}
