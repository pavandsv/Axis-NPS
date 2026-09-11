import Chart from './charts/Chart'
import { JOURNEY_DATA } from '../data/journeys'

const TILES = [
  { key: 'onboarding', label: 'Onboarding' },
  { key: 'refund', label: 'Excess Refund' },
  { key: 'closure', label: 'Loan Closure' },
  { key: 'service', label: 'Cust. Service' },
]
// Excess Refund has no slice of its own in the source data — it is a headline
// figure only, so selecting it is not offered.
const SCORES = { onboarding: '+35', refund: '+28', closure: '+44', service: '+32' }
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

export default function JourneyScores({ journey, onJourney, trend }) {
  return (
    <div className="card p-5 lg:col-span-2">
      <p className="card-title">Journey NPS Scores</p>
      <p className="card-sub">Click a journey to filter the dashboard</p>

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {TILES.map((t) => {
          const selectable = t.key !== 'refund'
          const active = journey === t.key
          return (
            <button
              key={t.key}
              type="button"
              disabled={!selectable}
              onClick={() => onJourney(active ? 'all' : t.key)}
              className={`rounded-xl border px-3 py-3 text-center transition-all ${
                active ? 'border-brand bg-brand-tint' : 'border-surface-line bg-surface-alt'
              } ${selectable ? 'hover:border-brand/40' : 'cursor-default opacity-90'}`}
            >
              <span className={`block text-xl font-bold ${active ? 'text-brand' : 'text-ink'}`}>
                {SCORES[t.key]}
              </span>
              <span className="mt-0.5 block text-[11px] text-ink-faint">{t.label}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-4">
        <Chart
          type="line"
          height={130}
          data={{
            labels: MONTHS,
            datasets: [{
              data: trend,
              borderColor: '#97144D',
              backgroundColor: 'rgba(151,20,77,0.08)',
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointRadius: 3,
              pointBackgroundColor: '#97144D',
            }],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#8E8E93' } },
              y: { grid: { color: '#F2F2F7' }, ticks: { font: { size: 10 }, color: '#8E8E93' } },
            },
          }}
        />
      </div>
    </div>
  )
}
