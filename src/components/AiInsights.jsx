/**
 * The AI assistant writes here. Cards it creates can be pinned onto the main
 * dashboard, so this tab is a staging area rather than a report.
 */
export default function AiInsights({ items, onPin, onRemove, onOpenAssistant }) {
  if (!items.length) {
    return (
      <div className="card flex flex-col items-center px-6 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-tint text-xl text-brand">✦</span>
        <p className="mt-4 text-[15px] font-semibold text-ink">No AI components yet</p>
        <p className="mt-1.5 max-w-md text-[12px] leading-relaxed text-ink-faint">
          Open the AI assistant and ask something like “create a pie chart for
          Maharashtra and Gujarat” or “show an insight on detractors”.
        </p>
        <button
          type="button"
          onClick={onOpenAssistant}
          className="mt-5 rounded-full bg-brand px-4 py-2 text-[12px] font-semibold text-white hover:bg-brand-dark"
        >
          Open AI Assistant
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {items.map((item) => (
        <div key={item.id} className="card p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="card-title">{item.title}</p>
              <p className="card-sub">Created by the AI assistant</p>
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => onPin(item.id)}
                className="rounded-lg border border-surface-line px-2 py-1 text-[10px] font-semibold text-ink-muted hover:text-brand"
              >
                {item.pinned ? 'Unpin from dashboard' : 'Pin to dashboard'}
              </button>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="rounded-lg border border-surface-line px-2 py-1 text-[10px] font-semibold text-ink-muted hover:text-red-600"
              >
                Remove
              </button>
            </div>
          </div>
          {item.kind === 'insight' ? (
            <p className="mt-3 text-[12px] leading-relaxed text-ink-soft">{item.text}</p>
          ) : (
            <div className="mt-3 space-y-2">
              {item.data.map((d) => (
                <div key={d.label} className="flex items-center gap-2">
                  <span className="w-28 truncate text-[11px] text-ink-soft">{d.label}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-page">
                    <span
                      className="block h-full rounded-full bg-brand"
                      style={{ width: `${(d.value / Math.max(...item.data.map((x) => x.value))) * 100}%` }}
                    />
                  </span>
                  <span className="w-10 text-right text-[11px] font-semibold text-ink">{d.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
