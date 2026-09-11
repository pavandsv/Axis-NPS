// ---------------------------------------------------------------------------
// Programme configuration — MOM, 10 Sep 2026.
// ---------------------------------------------------------------------------

/**
 * MOM 3.4 states "Detractor 0–6, Passive 6–8, Promoter 8–10", which overlaps at
 * 6 and at 8 — a customer scoring either would fall in two bands and NPS would
 * be undefined. Encoded here as the standard non-overlapping split; AFL to
 * confirm under their action A3.
 */
export const SCORE_BANDS = [
  { key: 'detractor', label: 'Detractor', min: 0, max: 6, color: '#C2185B' },
  { key: 'passive', label: 'Passive', min: 7, max: 8, color: '#E8A33D' },
  { key: 'promoter', label: 'Promoter', min: 9, max: 10, color: '#2E9E6B' },
]

export const bandFor = (rating) =>
  SCORE_BANDS.find((b) => rating >= b.min && rating <= b.max)?.key || 'detractor'

/**
 * MOM 6.3 — "7–8 views covering Onboarding, Loan Closure and the rest".
 * The final list is AFL's action A7; this is the working set.
 */
export const JOURNEYS = [
  { key: 'all', label: 'All Journeys', question: null },
  { key: 'onboarding', label: 'Onboarding', question: 'Based on your onboarding experience, how likely are you to recommend Axis Finance to a friend or colleague?' },
  { key: 'sanction', label: 'Sanction & Disbursal', question: 'Based on your sanction and disbursal experience, how likely are you to recommend Axis Finance?' },
  { key: 'servicing', label: 'Loan Servicing', question: 'Based on how we service your loan, how likely are you to recommend Axis Finance?' },
  { key: 'refund', label: 'Excess Refund', question: 'Based on your excess refund experience, how likely are you to recommend Axis Finance?' },
  { key: 'closure', label: 'Loan Closure', question: 'Based on your loan closure experience, how likely are you to recommend Axis Finance?' },
  { key: 'noc', label: 'NOC & Foreclosure', question: 'Based on your NOC and foreclosure experience, how likely are you to recommend Axis Finance?' },
  { key: 'collections', label: 'Collections', question: 'Based on your recent interaction with our collections team, how likely are you to recommend Axis Finance?' },
  { key: 'digital', label: 'Digital Experience', question: 'Based on your experience with our app and portal, how likely are you to recommend Axis Finance?' },
]

export const JOURNEY_KEYS = JOURNEYS.filter((j) => j.key !== 'all').map((j) => j.key)
export const journeyLabel = (key) => JOURNEYS.find((j) => j.key === key)?.label || key

/**
 * MOM 2.5 — SMS is out of scope and removed from the channel configuration.
 * MOM 6.2 — channel performance reports Sent, Delivered and Clicked.
 */
export const CHANNELS = [
  { key: 'Email', label: 'Email', sub: 'via Zoho', color: '#97144D' },
  { key: 'WhatsApp', label: 'WhatsApp', sub: 'via Gupshup', color: '#B8336A' },
  { key: 'AI Call', label: 'AI Call', sub: 'AI voice agent', color: '#7A2E52' },
]

/** MOM 6.4 — Age Group comes off the dashboard; portfolio replaces it. */
export const PORTFOLIOS = [
  { key: 'Retail Secured', loanTypes: ['Home Loan', 'Loan Against Property'] },
  { key: 'Retail Unsecured', loanTypes: ['Personal Loan', 'Other'] },
  { key: 'Wheels', loanTypes: ['Vehicle Loan'] },
  { key: 'Commercial', loanTypes: ['Business Loan'] },
]

export const LOAN_TYPES = [
  'Home Loan', 'Personal Loan', 'Business Loan',
  'Loan Against Property', 'Vehicle Loan', 'Other',
]

export const portfolioOf = (loanType) =>
  PORTFOLIOS.find((p) => p.loanTypes.includes(loanType))?.key || 'Other'

/** MOM 6.10 — monthly / quarterly / yearly slicer at dashboard level. */
export const PERIODS = [
  { key: 'monthly', label: 'Monthly' },
  { key: 'quarterly', label: 'Quarterly' },
  { key: 'yearly', label: 'Yearly' },
]

/** MOM 3 — the Desk ticket is gone; detractors go into a bot-calling activity. */
export const BOT_CALL_STATUSES = ['Queued', 'Bot Calling', 'Analysed', 'Escalated', 'Resolved']
export const BOT_AGENTS = ['Agent 1', 'Agent 2']   // MOM 3.2 — two agents
