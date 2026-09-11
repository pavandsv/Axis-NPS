/** The themes AI pulled out of detractor free text, with a representative
 *  quote under each — the quote is what makes the number persuasive. */
export default function VoiceOfCustomer({ themes, insight, aiEnabled }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="card-title">Voice of Customer — Top Themes</p>
          <p className="card-sub">AI-extracted · Detractor responses only</p>
        </div>
        <span className={`pill ${aiEnabled ? 'pill-brand' : 'pill-grey'}`}>
          {aiEnabled ? 'AI Extracted' : 'Restricted'}
        </span>
      </div>

      <div className="mt-4 space-y-4">
        {themes.map((t) => (
          <div key={t.name}>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-ink">{t.name}</span>
              <span className={`pill ${t.badge}`}>{t.impact}</span>
              <span className="ml-auto text-[13px] font-bold" style={{ color: t.color }}>{t.pct}%</span>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-page">
              <div className="h-full rounded-full" style={{ width: `${t.pct * 2}%`, background: t.color }} />
            </div>
            <p className="mt-1.5 text-[11px] italic text-ink-faint">{t.quote}</p>
          </div>
        ))}
      </div>

      {aiEnabled && insight && (
        <div className="mt-5 flex gap-3 rounded-xl bg-brand-tint p-3.5">
          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand text-[11px] text-white">✦</span>
          <div>
            <p className="text-[12px] font-semibold text-brand">AI Insight</p>
            <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">{insight}</p>
          </div>
        </div>
      )}
    </div>
  )
}
