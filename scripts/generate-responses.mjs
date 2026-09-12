// ---------------------------------------------------------------------------
// Survey response generator.
//
// Built from the five fields on AFL's own onboarding survey form:
//
//   Full Name                                        (text)
//   Loan amount                                      (number, NOT mandatory)
//   Type of loan                                     (6 options)
//   "…how likely are you to recommend Axis Finance
//    to a friend or colleague?"                      (rating 0–10)
//   "What could Axis Finance have done better
//    during your onboarding?"                        (free text, optional)
//
// Everything the dashboard shows is then DERIVED from these responses — NPS,
// the promoter/passive/detractor split, sentiment, themes, the map. Nothing is
// asserted separately, so the figures cannot drift apart from the data the way
// the original build's did.
//
// Run: node scripts/generate-responses.mjs
// ---------------------------------------------------------------------------
import { writeFileSync } from 'node:fs'
import { STATE_NPS, CITY_NPS } from '../src/data/geo.js'
import { FIRST, LAST } from './name-pool.mjs'
import { DETRACTOR_VERBATIMS, PASSIVE_VERBATIMS, PROMOTER_VERBATIMS } from './verbatims.mjs'
import { JOURNEY_KEYS, portfolioOf } from '../src/data/config.js'

const TOTAL = 2480   // MOM 6.3: eight journeys now, not one
const SEED = 20260611

// Deterministic PRNG — the dataset must be identical on every run, or a demo
// contradicts the screenshots taken the day before.
let seed = SEED
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296)
const pick = (arr) => arr[Math.floor(rnd() * arr.length)]
const int = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1))

// --------------------------------------------------------------- form options
const LOAN_TYPES = [
  ['Home Loan', 620],
  ['Personal Loan', 785],
  ['Business Loan', 404],
  ['Loan Against Property', 231],
  ['Vehicle Loan', 305],
  ['Other', 135],
]

// Ticket sizes differ enormously by product; a single range would make the
// "loan amount" field meaningless.
const TICKET = {
  'Home Loan': [1500000, 12000000],
  'Personal Loan': [80000, 1500000],
  'Business Loan': [500000, 8000000],
  'Loan Against Property': [2000000, 20000000],
  'Vehicle Loan': [250000, 3500000],
  Other: [50000, 900000],
}

// MOM 2.5 — SMS removed. Weighting kept roughly proportional to the original.
const CHANNELS = [['Email', 1090], ['WhatsApp', 940], ['AI Call', 450]]
const GENDERS = [['Male', 1510], ['Female', 900], ['Not specified', 70]]
// Age is off the dashboard per MOM 6.4 but stays on the record for the ODD.
const AGES = [['18–25', 300], ['26–35', 840], ['36–45', 700], ['46–55', 440], ['55+', 200]]
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
// The original's own trend line, used as the monthly response weighting.
const MONTH_WEIGHT = [29, 31, 35, 33, 38, 41]

/** Expand [value, count] pairs into a flat bag, then deal from it. */
// Journeys do not perform alike — closure delights, collections does not — and
// a flat split would make the journey filter pointless.
const JOURNEY_MIX = [
  ['onboarding', 0.20, 35],
  ['sanction', 0.14, 41],
  ['servicing', 0.15, 33],
  ['refund', 0.08, 28],
  ['closure', 0.12, 44],
  ['noc', 0.09, 30],
  ['collections', 0.10, 18],
  ['digital', 0.12, 26],
]

const bag = (pairs) => pairs.flatMap(([v, n]) => Array.from({ length: n }, () => v))
const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}

// ------------------------------------------------------------------ geography
// The source data's per-state counts sum to 942 against a stated total of 847.
// Scale them so the parts add up to the whole.
const rawStates = Object.entries(STATE_NPS)
const rawTotal = rawStates.reduce((a, [, s]) => a + s.responses, 0)
const stateCounts = rawStates.map(([name, s]) => [name, Math.max(1, Math.round((s.responses / rawTotal) * TOTAL))])
let drift = TOTAL - stateCounts.reduce((a, [, n]) => a + n, 0)
for (let i = 0; drift !== 0; i = (i + 1) % stateCounts.length) {
  stateCounts[i][1] += drift > 0 ? 1 : -1
  drift += drift > 0 ? -1 : 1
}

/**
 * Segment mix for a state, chosen so the state's NPS comes out at its target.
 * NPS is promoters% − detractors%, so fixing one fixes the other.
 */
function mixFor(npsTarget) {
  const d = Math.min(0.34, Math.max(0.04, 0.15 - ((npsTarget - 38) / 100) * 0.55))
  const p = Math.min(0.92, d + npsTarget / 100)
  return { p, d, s: Math.max(0, 1 - p - d) }
}

const ratingFor = (segment) =>
  segment === 'promoter' ? int(9, 10) : segment === 'passive' ? int(7, 8) : int(0, 6)

function improvementFor(segment) {
  if (segment === 'promoter') return rnd() < 0.72 ? ['', ''] : pick(PROMOTER_VERBATIMS)
  if (segment === 'passive') return rnd() < 0.45 ? ['', ''] : pick(PASSIVE_VERBATIMS)
  return rnd() < 0.08 ? ['', ''] : pick(DETRACTOR_VERBATIMS)   // detractors nearly always explain
}

// ---------------------------------------------------------------------- build
const loanBag = shuffle(bag(LOAN_TYPES))
const channelBag = shuffle(bag(CHANNELS))
const genderBag = shuffle(bag(GENDERS))
const ageBag = shuffle(bag(AGES))
const monthBag = shuffle(bag(MONTHS.map((m, i) => [m, Math.round((MONTH_WEIGHT[i] / MONTH_WEIGHT.reduce((a, b) => a + b, 0)) * TOTAL)])))
while (monthBag.length < TOTAL) monthBag.push('Jun')

const usedNames = new Set()
const uniqueName = () => {
  for (let i = 0; i < 400; i++) {
    const n = `${pick(FIRST)} ${pick(LAST)}`
    if (!usedNames.has(n)) { usedNames.add(n); return n }
  }
  return `${pick(FIRST)} ${pick(LAST)} ${usedNames.size}`
}

const rows = []
let n = 0

// Two dimensions have to read correctly at once: a journey's NPS and a state's.
// Blending the two targets keeps both filters honest instead of one dominating.
const stateWeight = Object.fromEntries(stateCounts.map(([k, v]) => [k, v / TOTAL]))

for (const [journey, share, journeyNps] of JOURNEY_MIX) {
  const journeyTotal = Math.round(TOTAL * share)

  for (const [stateName, ] of stateCounts) {
    const count = Math.max(1, Math.round(journeyTotal * stateWeight[stateName]))
    const blended = Math.round((journeyNps + STATE_NPS[stateName].nps) / 2)
    const { p, d } = mixFor(blended)
    const promoters = Math.round(count * p)
    const detractors = Math.round(count * d)
    const segments = shuffle([
      ...Array.from({ length: promoters }, () => 'promoter'),
      ...Array.from({ length: detractors }, () => 'detractor'),
      ...Array.from({ length: Math.max(0, count - promoters - detractors) }, () => 'passive'),
    ])
    const statesCities = CITY_NPS.filter((c) => c.state === stateName)

    for (const segment of segments) {
      const loanType = loanBag[n % loanBag.length]
      const [lo, hi] = TICKET[loanType]
      const city = statesCities.length ? pick(statesCities) : null
      const [theme, improvement] = improvementFor(segment)
      const month = monthBag[n % monthBag.length]
      const channel = channelBag[n % channelBag.length]

      // MOM 6.2 — a response implies its survey was delivered and clicked.
      // Non-responders live in the dispatch log, not here.
      const delivered = rnd() > 0.04
      const clicked = delivered && rnd() > 0.02

      // MOM 3 — every detractor enters the bot-calling activity. SLA is 48
      // hours, so resolution beyond 2 days is a breach. Both are recorded per
      // case; the dashboard measures them instead of assuming a rate.
      const isDetractor = segment === 'detractor'
      // Most cases close well inside the 48-hour SLA; a minority run long. A
      // single wide distribution put ~38% over the line, which is not a service
      // desk anyone would ship.
      const resolutionDays = isDetractor
        ? +(rnd() < 0.88 ? 0.3 + rnd() * 1.5 : 2.2 + rnd() * 5).toFixed(1)
        : null
      const slaBreached = isDetractor ? resolutionDays > 2 : null

      rows.push({
        responseId: `AFL-NPS-${String(n + 1).padStart(6, '0')}`,
        submittedOn: `2026-${String(MONTHS.indexOf(month) + 1).padStart(2, '0')}-${String(int(1, 28)).padStart(2, '0')}`,
        month,
        quarter: `Q${Math.floor(MONTHS.indexOf(month) / 3) + 1}`,
        year: 2026,

        // ---- what the customer actually answers ----------------------------
        // MOM 5: name and LAN are NOT asked; they are pre-filled from LMS/CRM.
        loanAmount: rnd() < 0.19 ? null : Math.round(int(lo, hi) / 10000) * 10000,
        loanType,
        rating: ratingFor(segment),
        improvement,

        // ---- pre-filled from LMS / CRM, not collected on the form ----------
        fullName: uniqueName(),
        journey,
        state: stateName,
        city: city?.city || null,
        lat: city?.lat ?? null,
        lng: city?.lng ?? null,
        portfolio: portfolioOf(loanType),
        channel,
        delivered,
        clicked,
        resolutionDays,
        slaBreached,
        gender: genderBag[n % genderBag.length],
        ageBracket: ageBag[n % ageBag.length],

        // ---- derived from the rating ---------------------------------------
        segment,
        theme: theme || null,
        sentiment: segment === 'promoter' ? 'Positive' : segment === 'passive' ? 'Neutral' : 'Negative',
      })
      n += 1
    }
  }
}

const out = `// AUTO-GENERATED by scripts/generate-responses.mjs — do not edit by hand.
// ${rows.length} survey responses · seed ${SEED}
//
// One row per submitted survey. The five customer-entered fields are fullName,
// loanAmount (nullable — the form does not require it), loanType, rating and
// improvement. Everything else is either derived from the rating or carried
// across from the customer record.

export const RESPONSES = ${JSON.stringify(rows)}
`
writeFileSync(new URL('../src/data/generated/responses.js', import.meta.url), out)

const c = (f) => rows.filter(f).length
const promoters = c((r) => r.segment === 'promoter')
const detractors = c((r) => r.segment === 'detractor')
// Compute on counts, not on rounded percentages — subtracting two rounded
// figures is how a dashboard ends up claiming +38 next to a donut that says +23.
const nps = Math.round(((promoters - detractors) / rows.length) * 100)
console.log(`${rows.length} responses written · ${(out.length / 1024).toFixed(0)} KB`)
const byJourney = {}
for (const r of rows) byJourney[r.journey] = (byJourney[r.journey] || 0) + 1
console.log('journeys:', Object.entries(byJourney).map(([k, v]) => `${k} ${v}`).join(' · '))
console.log(`NPS ${nps >= 0 ? '+' : ''}${nps}  ·  promoters ${Math.round(promoters / rows.length * 100)}%  passives ${Math.round(c((r) => r.segment === 'passive') / rows.length * 100)}%  detractors ${Math.round(detractors / rows.length * 100)}%`)
console.log(`loan amount skipped by ${c((r) => r.loanAmount === null)} respondents (field is optional)`)
console.log(`free text left blank by ${c((r) => !r.improvement)}`)
