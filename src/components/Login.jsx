import { useState } from 'react'
import { ROLES, ROLE_ORDER, USERS, DEMO_PASSWORD } from '../data/roles'

const FEATURES = ['Real-time NPS', 'AI sentiment & VOC', 'Geo drill-down', 'Closed-loop']

/** Split sign-in: the brand panel carries the pitch, the right side the choice
 *  of demo persona. The password is pre-filled because this is a demo — the
 *  point is to show the four role experiences, not to test typing. */
export default function Login({ onSignIn }) {
  const [roleKey, setRoleKey] = useState('admin')
  const [password, setPassword] = useState(DEMO_PASSWORD)

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[52%_48%]">
      <div
        className="relative flex flex-col justify-between overflow-hidden p-10 lg:p-14"
        style={{ background: 'linear-gradient(150deg, #6B0E36 0%, #97144D 55%, #B41B5C 100%)' }}
      >
        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
            <path d="M16 3 L28 29 H21 L16 17 L11 29 H4 Z" fill="#fff" />
          </svg>
          <span className="text-[15px] font-bold tracking-tight text-white">AXIS FINANCE</span>
        </div>

        <div className="max-w-md">
          <h1 className="text-[42px] font-bold leading-[1.08] tracking-tight text-white">
            Customer loyalty,
            <br />
            measured by AI.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-white/70">
            NPS Intelligence turns every survey into live insight — journeys,
            sentiment, geography and closed-loop action, with an AI analyst built in.
          </p>
          <div className="mt-8 flex flex-wrap gap-2.5">
            {FEATURES.map((f) => (
              <span key={f} className="rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-medium text-white">
                {f}
              </span>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-white/50">
          NPS Intelligence · Built for Axis Finance · Powered by Fristine Tech
        </p>
      </div>

      <div className="flex items-center justify-center bg-surface-page p-8">
        <div className="w-full max-w-[420px]">
          <h2 className="text-[26px] font-bold tracking-tight text-ink">Sign in</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Choose a demo profile to explore the role-based experience.
          </p>

          <p className="mt-6 text-xs font-semibold text-ink-soft">Sign in as</p>
          <div className="mt-2 grid grid-cols-2 gap-2.5">
            {ROLE_ORDER.map((key) => {
              const role = ROLES[key]
              const user = USERS[key]
              const active = roleKey === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRoleKey(key)}
                  className={`rounded-xl border px-3.5 py-3 text-left transition-all ${
                    active
                      ? 'border-brand bg-brand-tint ring-1 ring-brand/30'
                      : 'border-surface-line bg-white hover:border-brand/30'
                  }`}
                >
                  <span className="block text-[13px] font-semibold text-ink">{role.name}</span>
                  <span className="mt-0.5 block truncate text-[11px] text-ink-faint">
                    {user.name.split(' ')[0]} · {role.dept}
                  </span>
                </button>
              )
            })}
          </div>

          <label className="mt-5 block text-xs font-semibold text-ink-soft" htmlFor="pwd">
            Password
          </label>
          <input
            id="pwd"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-surface-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand"
          />

          <button
            type="button"
            onClick={() => onSignIn(roleKey)}
            className="mt-5 w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Enter NPS Intelligence →
          </button>
          <p className="mt-3.5 text-center text-[11px] text-ink-faint">
            Demo password pre-filled · <strong className="text-ink-soft">{DEMO_PASSWORD}</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
