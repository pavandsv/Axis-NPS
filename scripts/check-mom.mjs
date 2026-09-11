// Verifies the dashboard against the 10 Sep 2026 MOM, item by item, by
// inspecting the code and the data rather than trusting a checklist.
import { readFileSync, readdirSync } from 'node:fs'
import { RESPONSES } from '../src/data/generated/responses.js'
import { JOURNEY_KEYS, CHANNELS, PORTFOLIOS, PERIODS } from '../src/data/config.js'
import { ROLES } from '../src/data/roles.js'
import * as A from '../src/logic/analytics.js'

const src = readdirSync(new URL('../src/components', import.meta.url))
  .filter((f) => f.endsWith('.jsx'))
  .map((f) => readFileSync(new URL(`../src/components/${f}`, import.meta.url), 'utf8')).join('\n')
  + readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
  + readFileSync(new URL('../src/logic/analytics.js', import.meta.url), 'utf8')

const rows = A.filterResponses(ROLES.admin, {})
const out = []
const check = (id, what, pass, detail = '') => out.push({ id, what, pass, detail })

check('2.5', 'SMS removed from channels and data',
  !CHANNELS.some((c) => /sms/i.test(c.key)) && !RESPONSES.some((r) => /sms/i.test(r.channel))
  && !/['"]SMS['"]/.test(src),
  CHANNELS.map((c) => c.key).join(', '))

check('3.1', 'Detractor bot-calling activity exists',
  /BotCallQueue/.test(src) && A.botCallQueue(rows).length > 0,
  `${A.botCallQueue(rows).length} in queue`)
check('3.2', 'Two agents on the bot activity',
  new Set(A.botCallQueue(rows).map((b) => b.agent)).size === 2)
check('3.3', 'Escalation email stated as internal',
  /internally to Axis Finance/.test(src))
check('3.4', 'Score bands non-overlapping (AFL to confirm)',
  RESPONSES.every((r) => (r.rating <= 6 ? r.segment === 'detractor'
    : r.rating <= 8 ? r.segment === 'passive' : r.segment === 'promoter')),
  '0–6 / 7–8 / 9–10')
check('3.5', 'Bot conversation in English and Hindi',
  new Set(A.botCallQueue(rows).map((b) => b.language)).size === 2)
check('3.x', 'Desk ticket removed as a feature',
  !/ticketId|ticketNo|createTicket|deskTicket/i.test(src)
  && !Object.keys(RESPONSES[0]).some((key) => /ticket/i.test(key)),
  'no ticket field or ticket creation anywhere')

check('5', 'Survey does not ask for name or LAN',
  !/label.*Full Name|name.*input/i.test(readFileSync(new URL('../src/components/OnDemandDashboard.jsx', import.meta.url), 'utf8').split('COLUMNS')[0])
  && !RESPONSES.some((r) => r.lan),
  'name pre-filled from LMS, never a form field')

check('6.1', 'NPS inside every widget', /npsClicked/.test(src) && /NPS \{c\.nps/.test(src))
check('6.2', 'Channel shows Sent, Delivered, Clicked',
  ['Sent', 'Delivered', 'Clicked'].every((w) => src.includes(`'${w}'`) || src.includes(`${w}`))
  && A.channelPerformance(rows).every((c) => c.sent && c.delivered && c.clicked))
check('6.3', 'Seven to eight journey views', JOURNEY_KEYS.length >= 7 && JOURNEY_KEYS.length <= 8,
  `${JOURNEY_KEYS.length} journeys`)
check('6.4', 'Age group removed, portfolio added with NPS',
  !/Age Group/.test(src) && /PortfolioPerformance/.test(src) && A.portfolioPerformance(rows).every((p) => 'nps' in p),
  PORTFOLIOS.map((p) => p.key).join(', '))
check('6.5', 'Loan type shown percent-wise', A.loanTypePerformance(rows).every((l) => 'pct' in l && 'nps' in l))
check('6.6', 'Word cloud split by positive / negative / neutral',
  /SentimentCloud/.test(src) && ['Positive', 'Neutral', 'Negative'].every((s) => A.wordCloud(rows, s, 5).length > 0))
check('6.7', 'What Worked Well — top 5', A.themes(rows, 'promoter', 5).length === 5)
check('6.8', 'Needs Improvement — top 5', A.themes(rows, 'detractor', 5).length === 5)
check('6.9', 'Map drill-down plus response by product',
  /onDrill/.test(readFileSync(new URL('../src/components/IndiaMap.jsx', import.meta.url), 'utf8'))
  && A.geography(rows).every((g) => g.byProduct.length > 0))
check('6.10', 'Monthly / quarterly / yearly slicer',
  PERIODS.length === 3 && /PeriodSlicer/.test(src))
check('6.11', 'Loan distribution progression table',
  A.loanDistribution(rows).length === 5 && /LoanDistribution/.test(src),
  A.loanDistribution(rows).map((s) => s.per100).join(' → '))
check('6.12', 'On-Demand Dashboard exposes all fields',
  /OnDemandDashboard/.test(src)
  && Object.keys(RESPONSES[0]).every((k) =>
    readFileSync(new URL('../src/components/OnDemandDashboard.jsx', import.meta.url), 'utf8').includes(`'${k}'`)
    || ['lat', 'lng', 'year'].includes(k)),
  `${Object.keys(RESPONSES[0]).length} fields on the record`)
check('6.13', 'AI Insights tab present for entitled roles',
  /AiInsights/.test(src) && ROLES.admin.ai && !ROLES.branch.ai)

const pad = (s, n) => String(s).padEnd(n)
for (const r of out) {
  console.log(`${r.pass ? '  ✓' : '  ✗'} ${pad(r.id, 5)} ${pad(r.what, 52)} ${r.detail}`)
}
const failed = out.filter((r) => !r.pass)
console.log(`\n${out.length - failed.length}/${out.length} MOM items verified`)
if (failed.length) { console.log('OUTSTANDING: ' + failed.map((f) => f.id).join(', ')); process.exit(1) }
console.log('ALL MOM ITEMS IMPLEMENTED')
