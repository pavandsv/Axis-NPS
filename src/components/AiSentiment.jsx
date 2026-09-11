import Chart from './charts/Chart'

const PARTS = [
  { label: 'Positive', color: '#10B981' },
  { label: 'Neutral', color: '#F59E0B' },
  { label: 'Negative', color: '#EF4444' },
]

/** Auto-classified open text. Gated on the role's AI entitlement. */
export default function AiSentiment({ sentiment, aiEnabled }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="card-title">AI Sentiment</p>
          <p className="card-sub">Auto-classified open text</p>
        </div>
        <span className={`pill ${aiEnabled ? 'pill-brand' : 'pill-grey'}`}>
          {aiEnabled ? 'AI Powered' : 'Restricted'}
        </span>
      </div>

      {aiEnabled ? (
        <>
          <Chart
            type="doughnut"
            height={150}
            data={{
              labels: PARTS.map((p) => p.label),
              datasets: [{
                data: sentiment,
                backgroundColor: PARTS.map((p) => p.color),
                borderWidth: 0,
                cutout: '68%',
              }],
            }}
            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
          />
          <div className="mt-4 space-y-2">
            {PARTS.map((p, i) => (
              <div key={p.label} className="flex items-center gap-2.5">
                <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: p.color }} />
                <span className="text-[12px] text-ink-soft">{p.label}</span>
                <span className="ml-auto h-1 w-16 overflow-hidden rounded-full bg-surface-page">
                  <span className="block h-full rounded-full" style={{ width: `${sentiment[i]}%`, background: p.color }} />
                </span>
                <span className="w-8 text-right text-[12px] font-semibold text-ink">{sentiment[i]}%</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="py-14 text-center text-xs text-ink-faint">
          AI sentiment is not available for this role.
        </p>
      )}
    </div>
  )
}
