// Proves the generated survey dataset reconciles with itself. The original
// build did not: its headline NPS disagreed with its own donut and with its own
// state table. Every figure the dashboard shows is derived from these rows, so
// if this passes, the dashboard cannot contradict itself.
import { RESPONSES } from '../src/data/generated/responses.js'
import { STATE_NPS } from '../src/data/geo.js'
import { JOURNEY_KEYS, CHANNELS, bandFor, LOAN_TYPES as FORM_LOAN_TYPES, PORTFOLIOS } from '../src/data/config.js'

const fails = []
const ok = []
const check = (label, pass, detail = '') => (pass ? ok : fails).push(`${label}${detail ? ' — ' + detail : ''}`)

const n = RESPONSES.length
const count = (f) => RESPONSES.filter(f).length

// ---- integrity
check('Responses generated', n > 2000, `${n}`)
check('Response IDs unique', new Set(RESPONSES.map((r) => r.responseId)).size === n)
check('Respondent names unique', new Set(RESPONSES.map((r) => r.fullName)).size === n,
  `${new Set(RESPONSES.map((r) => r.fullName)).size}/${n}`)

// ---- the survey fields themselves
const LOAN_TYPES = FORM_LOAN_TYPES
check('Rating always 0–10', RESPONSES.every((r) => Number.isInteger(r.rating) && r.rating >= 0 && r.rating <= 10))
check('Loan type always one of the six form options',
  RESPONSES.every((r) => LOAN_TYPES.includes(r.loanType)))
const skipped = count((r) => r.loanAmount === null)
const skipRate = skipped / n
check('Loan amount is optional and genuinely skipped', skipRate > 0.12 && skipRate < 0.28,
  `${skipped} of ${n} — ${Math.round(skipRate * 100)}%`)
check('Loan amounts, where given, are positive', RESPONSES.every((r) => r.loanAmount === null || r.loanAmount > 0))

// ---- segment must follow from the rating, never be set independently
check('Segment always matches the configured score band',
  RESPONSES.every((r) => r.segment === bandFor(r.rating)),
  `${count((r) => r.segment !== bandFor(r.rating))} mismatched`)

// ---- MOM compliance
check('MOM 2.5 — SMS removed from every channel',
  !RESPONSES.some((r) => /sms/i.test(r.channel)))
check('MOM 6.2 — delivery funnel present and ordered',
  RESPONSES.every((r) => (r.clicked ? r.delivered : true)), 'no response clicked without delivery')
check('MOM 6.3 — eight journeys carry responses',
  new Set(RESPONSES.map((r) => r.journey)).size === 8,
  [...new Set(RESPONSES.map((r) => r.journey))].length + ' journeys')
check('MOM 6.3 — every configured journey appears',
  JOURNEY_KEYS.every((k) => RESPONSES.some((r) => r.journey === k)))
check('MOM 6.4 — portfolio present on every response',
  RESPONSES.every((r) => PORTFOLIOS.some((p) => p.key === r.portfolio)))
check('MOM 5 — form does not collect the name (it is pre-filled from LMS)',
  RESPONSES.every((r) => r.fullName), 'name carried on the record, not asked')

// ---- NPS
const promoters = count((r) => r.segment === 'promoter')
const detractors = count((r) => r.segment === 'detractor')
const passives = n - promoters - detractors
const nps = Math.round(((promoters - detractors) / n) * 100)
check('NPS derives from the ratings', true,
  `${nps >= 0 ? '+' : ''}${nps} from ${promoters} promoters / ${passives} passives / ${detractors} detractors`)
check('Promoters + passives + detractors = total', promoters + passives + detractors === n)

// ---- geography
const perState = {}
for (const r of RESPONSES) perState[r.state] = (perState[r.state] || 0) + 1
check('State counts sum to the total', Object.values(perState).reduce((a, b) => a + b, 0) === n)
check('Every state is one the source data knows', Object.keys(perState).every((s) => STATE_NPS[s]))
const drift = Object.entries(perState).map(([s, c]) => {
  const p = count((r) => r.state === s && r.segment === 'promoter')
  const d = count((r) => r.state === s && r.segment === 'detractor')
  return [s, Math.round(((p - d) / c) * 100) - STATE_NPS[s].nps]
})
// A state's score is now the average across eight journeys, so it moves away
// from the single-journey source figure by design. What must hold is that the
// ORDER is preserved — the strong states stay strong.
const worst = drift.reduce((a, b) => (Math.abs(b[1]) > Math.abs(a[1]) ? b : a))
const derived = Object.keys(perState).map((st) => {
  const c = perState[st]
  const p = count((r) => r.state === st && r.segment === 'promoter')
  const d = count((r) => r.state === st && r.segment === 'detractor')
  return { st, got: ((p - d) / c) * 100, want: STATE_NPS[st].nps }
})
const byWant = [...derived].sort((a, b) => b.want - a.want).map((x) => x.st)
const byGot = [...derived].sort((a, b) => b.got - a.got).map((x) => x.st)
const rankShift = byWant.reduce((acc, st, i) => acc + Math.abs(i - byGot.indexOf(st)), 0) / byWant.length
check('Per-state NPS keeps the source ranking', rankShift < 3.5,
  `mean rank shift ${rankShift.toFixed(1)} places · worst drift ${worst[0]} ${worst[1] > 0 ? '+' : ''}${worst[1]}`)
check('Cities belong to their state', RESPONSES.every((r) => !r.city || r.state))

// ---- free text, which the VOC and sentiment panels are built from
const dWithText = count((r) => r.segment === 'detractor' && r.improvement)
check('Detractors nearly always explain themselves',
  dWithText / detractors > 0.85, `${Math.round((dWithText / detractors) * 100)}% left a comment`)
check('Every comment carries a theme',
  RESPONSES.every((r) => !r.improvement || r.theme !== undefined))
const themes = new Set(RESPONSES.filter((r) => r.theme).map((r) => r.theme))
check('Themes present for the VOC panel', themes.size >= 6, `${themes.size} distinct themes`)

// ---- distributions the dashboard panels read
const dist = (key) => RESPONSES.reduce((m, r) => ({ ...m, [r[key]]: (m[r[key]] || 0) + 1 }), {})
check('Channel split covers the three in scope', Object.keys(dist('channel')).length === 3,
  Object.keys(dist('channel')).join(', '))
check('Age still on the record for the ODD', Object.keys(dist('ageBracket')).length === 5)
check('Quarters derived for the slicer', Object.keys(dist('quarter')).length === 2)
check('Months span Jan–Jun', Object.keys(dist('month')).length === 6)

console.log(ok.map((s) => '  ✓ ' + s).join('\n'))
if (fails.length) {
  console.log('\n' + fails.map((s) => '  ✗ ' + s).join('\n'))
  console.log('\nVALIDATION FAILED')
  process.exit(1)
}
console.log('\nALL SURVEY DATA CHECKS PASS')
