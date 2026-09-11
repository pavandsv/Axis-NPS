import Chart from './charts/Chart'

/** Promoters / passives / detractors — the definition of the score itself. */
export default function NpsDistribution({ promoters, passives, detractors }) {
  const parts = [
    { label: 'Promoters', value: promoters, color: '#10B981' },
    { label: 'Passives', value: passives, color: '#F59E0B' },
    { label: 'Detractors', value: detractors, color: '#EF4444' },
  ]

  return (
    <div className="card p-5">
      <p className="card-title">NPS Distribution</p>
      <p className="card-sub">Promoters · Passives · Detractors</p>

      <Chart
        type="doughnut"
        height={170}
        data={{
          labels: parts.map((p) => p.label),
          datasets: [{
            data: parts.map((p) => p.value),
            backgroundColor: parts.map((p) => p.color),
            borderWidth: 0,
            cutout: '68%',
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
        }}
      />

      <div className="mt-4 grid grid-cols-3 text-center">
        {parts.map((p) => (
          <div key={p.label}>
            <p className="text-lg font-bold" style={{ color: p.color }}>{p.value}%</p>
            <p className="text-[11px] text-ink-faint">{p.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
