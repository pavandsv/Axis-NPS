import { PERIODS } from '../data/config'

const BUCKETS = {
  monthly: ['all', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  quarterly: ['all', 'Q1', 'Q2'],
  yearly: ['all', '2026'],
}

/** MOM 6.10 — monthly / quarterly / yearly slicer at dashboard level. */
export default function PeriodSlicer({ period, bucket, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-semibold text-ink-faint">Period</span>
      <div className="flex items-center gap-0.5 rounded-full bg-surface-page p-1">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => onChange(p.key, 'all')}
            aria-pressed={period === p.key}
            className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-all ${
              period === p.key ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {BUCKETS[period].map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => onChange(period, b)}
            aria-pressed={bucket === b}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
              bucket === b ? 'bg-brand text-white' : 'border border-surface-line text-ink-muted hover:text-brand'
            }`}
          >
            {b === 'all' ? 'All' : b}
          </button>
        ))}
      </div>
    </div>
  )
}
