import Chart from './charts/Chart'
import { DEMOGRAPHICS } from '../data/demographics'

export function GenderNps() {
  const { gender } = DEMOGRAPHICS
  return (
    <div className="card p-5">
      <p className="card-title">Gender — NPS</p>
      <p className="card-sub">Response distribution &amp; avg NPS</p>
      <Chart
        type="doughnut"
        height={150}
        data={{
          labels: gender.map((g) => g.label),
          datasets: [{
            data: gender.map((g) => g.count),
            backgroundColor: gender.map((g) => g.color),
            borderWidth: 0,
            cutout: '66%',
          }],
        }}
        options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
      />
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {gender.map((g) => (
          <div key={g.label} className="rounded-xl bg-surface-alt p-3">
            <p className="flex items-center gap-1.5 text-[12px] font-semibold text-ink">
              <span className="h-2 w-2 rounded-full" style={{ background: g.color }} />
              {g.label}
            </p>
            <p className="mt-1 text-[11px] text-ink-faint">{g.count} resp</p>
            <p className="mt-0.5 text-[12px] font-bold" style={{ color: g.color }}>NPS +{g.nps}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AgeGroupNps() {
  const { ageGroups } = DEMOGRAPHICS
  const palette = ['#97144D', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']
  return (
    <div className="card p-5">
      <p className="card-title">Age Group — NPS Scores</p>
      <p className="card-sub">Average NPS by customer age bracket</p>
      <div className="mt-4">
        <Chart
          type="bar"
          height={200}
          data={{
            labels: ageGroups.map((a) => a.label),
            datasets: [{
              data: ageGroups.map((a) => a.nps),
              backgroundColor: palette,
              borderRadius: 6,
              maxBarThickness: 46,
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

export function LoanTypePerformance() {
  const { loanTypes } = DEMOGRAPHICS
  const max = Math.max(...loanTypes.map((l) => l.nps))
  return (
    <div className="card p-5">
      <p className="card-title">Loan Type Performance</p>
      <p className="card-sub">NPS score and response volume by product</p>
      <div className="mt-5 space-y-4">
        {loanTypes.map((l) => (
          <div key={l.label}>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: l.color }} />
              <span className="text-[12px] font-medium text-ink-soft">{l.label}</span>
              <span className="ml-auto text-[13px] font-bold text-emerald-600">+{l.nps}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="h-1 flex-1 overflow-hidden rounded-full bg-surface-page">
                <span className="block h-full rounded-full" style={{ width: `${(l.nps / max) * 100}%`, background: l.color }} />
              </span>
              <span className="w-16 text-right text-[10px] text-ink-faint">{l.responses} resp</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
