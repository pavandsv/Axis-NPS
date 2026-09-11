import { ROLES, USERS } from '../data/roles'
import { JOURNEYS } from '../data/config'

const initials = (name) => name.split(' ').map((w) => w[0]).join('')

/** Top bar + scope strip. The scope strip is doing real work: it states which
 *  slice of the country the signed-in role is allowed to see, and whether the
 *  AI features are available to them. */
export default function Header({ roleKey, journey, onJourney, onSignOut }) {
  const role = ROLES[roleKey]
  const user = USERS[roleKey]

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-surface-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden>
              <path d="M16 3 L28 29 H21 L16 17 L11 29 H4 Z" fill="#97144D" />
            </svg>
            <span className="text-[13px] font-bold tracking-tight text-ink">AXIS FINANCE</span>
          </div>

          <div className="mr-auto border-l border-surface-line pl-3">
            <p className="text-[13px] font-semibold text-ink">NPS Intelligence Platform</p>
            <p className="text-[10px] text-ink-faint">Customer Experience · Real-time Analytics</p>
          </div>

          <div className="flex max-w-[640px] flex-wrap items-center gap-0.5 rounded-full bg-surface-page p-1">
            {JOURNEYS.map((j) => (
              <button
                key={j.key}
                type="button"
                onClick={() => onJourney(j.key)}
                aria-pressed={journey === j.key}
                className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-all ${
                  journey === j.key ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {j.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Export PDF
          </button>

          <div className="flex items-center gap-2.5 rounded-full border border-surface-line py-1 pl-1 pr-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
              {initials(user.name)}
            </span>
            <span className="leading-tight">
              <span className="block text-[12px] font-semibold text-ink">{user.name}</span>
              <span className="block text-[10px] text-ink-faint">{role.name}</span>
            </span>
            <button
              type="button"
              onClick={onSignOut}
              title="Sign out"
              className="ml-1 text-ink-faint transition-colors hover:text-brand"
            >
              ⏻
            </button>
          </div>
        </div>
      </header>

      <div className="border-b border-surface-line bg-white">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2 px-5 py-2 text-[11px]">
          <span className={`pill ${role.badge}`}>{role.level}</span>
          <span className="text-ink-faint">Data scope:</span>
          <strong className="font-semibold text-ink-soft">{role.scopeLabel}</strong>
          <span className={`ml-auto ${role.ai ? 'text-emerald-600' : 'text-ink-faint'}`}>
            {role.ai ? 'AI features enabled' : 'AI features restricted for this role'}
          </span>
        </div>
      </div>
    </>
  )
}
