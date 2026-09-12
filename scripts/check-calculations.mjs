// Every figure the dashboard shows must reconcile against the rows it claims to
// describe. This exists because three "calculations" were previously circular
// constants: the response rate was pinned at 31%, SLA compliance at 91% and
// average resolution at a hardcoded 1.8 days, none of which moved when the
// selection changed.
import { RESPONSES } from '../src/data/generated/responses.js'
import { DISPATCH } from '../src/data/generated/dispatch.js'
import { ROLES } from '../src/data/roles.js'
import { JOURNEY_KEYS, bandFor } from '../src/data/config.js'
import * as A from '../src/logic/analytics.js'

const fails = []
const ok = []
const check = (label, pass, detail = '') => (pass ? ok : fails).push(`${label}${detail ? ' — ' + detail : ''}`)

const role = ROLES.admin
const all = A.filterResponses(role, {})

// ---- NPS identity
const k = A.headline(all, all, {})
const d = A.distribution(all)
check('NPS equals promoters% − detractors% on counts',
  A.npsOf(all) === Math.round(((d.counts.promoters - d.counts.detractors) / all.length) * 100),
  `${A.npsOf(all)}`)
check('Segment counts sum to the total',
  d.counts.promoters + d.counts.passives + d.counts.detractors === all.length)
check('Every segment follows from its rating',
  all.every((r) => r.segment === bandFor(r.rating)))

// ---- rates must MOVE, which is what the old constants never did
const rates = JOURNEY_KEYS.map((j) => {
  const rows = A.filterResponses(role, { journey: j })
  return A.headline(rows, all, { journey: j })
})
check('Response rate varies by journey',
  new Set(rates.map((x) => x.responseRate)).size > 3,
  rates.map((x) => x.responseRate + '%').join(' '))
check('SLA compliance varies by journey',
  new Set(rates.map((x) => x.slaCompliance)).size > 3,
  rates.map((x) => x.slaCompliance + '%').join(' '))
check('Average resolution varies by journey',
  new Set(rates.map((x) => x.avgResolution)).size > 3,
  rates.map((x) => x.avgResolution + 'd').join(' '))

// ---- rates must be arithmetically right
check('Response rate = responses / sent', k.responseRate === Math.round((k.responses / k.sent) * 100),
  `${k.responses}/${k.sent} = ${k.responseRate}%`)
check('Responses never exceed surveys sent', k.responses <= k.sent)
check('Clicked never exceeds delivered, delivered never exceeds sent',
  k.clicked <= k.delivered && k.delivered <= k.sent,
  `${k.sent} sent → ${k.delivered} delivered → ${k.clicked} clicked`)
const breached = all.filter((r) => r.slaBreached).length
check('SLA compliance = 1 − breached / detractor cases',
  k.slaCompliance === 100 - Math.round((breached / k.detractorCases) * 100),
  `${breached} of ${k.detractorCases} breached → ${k.slaCompliance}%`)
check('Only detractors carry a bot-call record',
  all.every((r) => (r.resolutionDays == null) === (r.segment !== 'detractor')))
check('Every SLA breach is a case over two days',
  all.filter((r) => r.slaBreached).every((r) => r.resolutionDays > 2))

// ---- dispatch integrity
check('Dispatch log covers every response',
  DISPATCH.reduce((a, x) => a + x.responses, 0) === RESPONSES.length,
  `${DISPATCH.reduce((a, x) => a + x.responses, 0)} of ${RESPONSES.length}`)
check('No dispatch cell reports more responses than sends',
  DISPATCH.every((x) => x.responses <= x.sent))

// ---- group-bys must partition, not double count
for (const key of ['journey', 'state', 'loanType', 'channel', 'segment', 'portfolio']) {
  const g = A.groupBy(all, key)
  check(`Group by ${key} partitions the set`,
    g.reduce((a, x) => a + x.responses, 0) === all.length,
    `${g.length} groups`)
  check(`Group by ${key} — each NPS matches its own rows`,
    g.every((x) => x.nps === A.npsOf(all.filter((r) => String(r[key] ?? '—') === x.value))))
}

// ---- drill-downs return what the panel promised
const journeys = A.journeyScores(role, {})
check('Journey cards match a direct recount',
  journeys.every((j) => j.responses === all.filter((r) => r.journey === j.key).length
    && j.nps === A.npsOf(all.filter((r) => r.journey === j.key))))
const geo = A.geography(all)
check('State totals sum to the whole set',
  geo.reduce((a, g) => a + g.responses, 0) === all.length)
check('Each state NPS matches its own rows',
  geo.every((g) => g.nps === A.npsOf(all.filter((r) => r.state === g.state))))
check('City totals never exceed their state',
  geo.every((g) => g.cities.reduce((a, c) => a + c.responses, 0) <= g.responses))
const ch = A.channelPerformance(all, {})
check('Channel responses sum to the whole set',
  ch.reduce((a, c) => a + c.responses, 0) === all.length)

// ---- role scoping
for (const rk of ['leadership', 'regional', 'branch']) {
  const scoped = A.filterResponses(ROLES[rk], {})
  check(`${ROLES[rk].name} sees only states in remit`,
    scoped.every((r) => ROLES[rk].states === 'all' || ROLES[rk].states.includes(r.state)),
    `${scoped.length} responses`)
}

console.log(ok.map((s) => '  ✓ ' + s).join('\n'))
if (fails.length) {
  console.log('\n' + fails.map((s) => '  ✗ ' + s).join('\n'))
  console.log('\nCALCULATION CHECKS FAILED')
  process.exit(1)
}
console.log('\nALL CALCULATIONS RECONCILE')
