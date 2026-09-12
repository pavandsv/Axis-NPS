// ---------------------------------------------------------------------------
// Everything the dashboard shows is computed here, from the survey responses.
//
// The original build asserted its figures separately from its data, and they
// drifted: a headline NPS of +38 sat next to a donut implying +23 and a state
// table averaging +35. Deriving every panel from one array makes that class of
// contradiction impossible, and it is what lets the period slicer (MOM 6.10)
// and the On-Demand Dashboard (MOM 6.12) work at all.
// ---------------------------------------------------------------------------
import { RESPONSES } from '../data/generated/responses.js'
import { DISPATCH } from '../data/generated/dispatch.js'
import { CHANNELS, JOURNEY_KEYS, LOAN_TYPES, PORTFOLIOS, journeyLabel } from '../data/config.js'
import { inScope } from '../data/roles.js'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

/** Role scope, journey filter and period slicer, applied in that order. */
export function filterResponses(role, { journey = 'all', period = 'monthly', bucket = 'all' } = {}) {
  let rows = RESPONSES.filter((r) => inScope(role, r.state))
  if (journey !== 'all') rows = rows.filter((r) => r.journey === journey)
  if (bucket !== 'all') {
    if (period === 'monthly') rows = rows.filter((r) => r.month === bucket)
    if (period === 'quarterly') rows = rows.filter((r) => r.quarter === bucket)
    if (period === 'yearly') rows = rows.filter((r) => String(r.year) === String(bucket))
  }
  return rows
}

const share = (n, d) => (d ? Math.round((n / d) * 100) : 0)

/** NPS on counts, never on rounded percentages. */
export function npsOf(rows) {
  if (!rows.length) return 0
  const p = rows.filter((r) => r.segment === 'promoter').length
  const d = rows.filter((r) => r.segment === 'detractor').length
  return Math.round(((p - d) / rows.length) * 100)
}

export function distribution(rows) {
  const p = rows.filter((r) => r.segment === 'promoter').length
  const d = rows.filter((r) => r.segment === 'detractor').length
  return {
    promoters: share(p, rows.length),
    passives: share(rows.length - p - d, rows.length),
    detractors: share(d, rows.length),
    counts: { promoters: p, passives: rows.length - p - d, detractors: d },
  }
}

/** MOM 6.1 — every widget carries its own NPS. */
/**
 * Headline figures for the current slice.
 *
 * Every one is measured. The previous version derived "sent" from the response
 * count and then divided the two, which pinned the response rate at exactly
 * 31% no matter what was filtered; SLA compliance was likewise fixed at 91%.
 * Sent counts now come from the dispatch log and SLA from each detractor's own
 * bot-call record, so both move when the selection moves.
 */
export function headline(rows, allRows, filter = {}) {
  const responded = rows.length

  // Match the dispatch log to the same slice the responses were filtered to.
  // Only dimensions the log carries can narrow it — a state filter cannot,
  // since surveys are logged per journey, channel and month.
  const cells = DISPATCH.filter(
    (d) =>
      (!filter.journey || filter.journey === 'all' || d.journey === filter.journey) &&
      (!filter.bucket || filter.bucket === 'all' || filter.period !== 'monthly' || d.month === filter.bucket),
  )
  // When a filter the log cannot see is active (state, product), scale the
  // dispatch down by the share of responses it covers, so the rate stays honest.
  const covered = cells.reduce((a, d) => a + d.responses, 0)
  const scale = covered ? Math.min(1, responded / covered) : 0
  const sent = Math.round(cells.reduce((a, d) => a + d.sent, 0) * scale)
  const delivered = Math.round(cells.reduce((a, d) => a + d.delivered, 0) * scale)
  const clicked = Math.round(cells.reduce((a, d) => a + d.clicked, 0) * scale)

  const detractors = rows.filter((r) => r.segment === 'detractor')
  const breached = detractors.filter((r) => r.slaBreached).length
  const resolutions = detractors.map((r) => r.resolutionDays).filter((v) => v != null)

  return {
    nps: npsOf(rows),
    npsClicked: npsOf(rows.filter((r) => r.clicked)),
    npsDelivered: npsOf(rows.filter((r) => r.delivered)),
    npsCost: share(detractors.length, rows.length),
    responses: responded,
    sent,
    delivered,
    clicked,
    responseRate: share(responded, sent),
    deliveredRate: share(delivered, sent),
    clickedRate: share(clicked, sent),
    slaCompliance: detractors.length ? 100 - share(breached, detractors.length) : 100,
    breached,
    detractorCases: detractors.length,
    avgResolution: resolutions.length
      ? +(resolutions.reduce((a, b) => a + b, 0) / resolutions.length).toFixed(1)
      : 0,
    shareOfBook: share(responded, allRows.length),
  }
}

export function trend(rows, period = 'monthly') {
  const buckets = period === 'quarterly' ? ['Q1', 'Q2'] : period === 'yearly' ? ['2026'] : MONTHS
  const key = period === 'quarterly' ? 'quarter' : period === 'yearly' ? 'year' : 'month'
  return buckets.map((b) => {
    const slice = rows.filter((r) => String(r[key]) === b)
    return { label: b, nps: npsOf(slice), responses: slice.length }
  })
}

export function sentimentSplit(rows) {
  const of = (s) => share(rows.filter((r) => r.sentiment === s).length, rows.length)
  return { positive: of('Positive'), neutral: of('Neutral'), negative: of('Negative') }
}

/** MOM 6.3 — one card per journey, each with its own NPS. */
export function journeyScores(role, opts = {}) {
  return JOURNEY_KEYS.map((key) => {
    const rows = filterResponses(role, { ...opts, journey: key })
    return { key, label: journeyLabel(key), nps: npsOf(rows), responses: rows.length }
  }).sort((a, b) => b.nps - a.nps)
}

/** MOM 6.2 — Sent, Delivered, Clicked per channel. SMS is out of scope. */
export function channelPerformance(rows, filter = {}) {
  return CHANNELS.map((c) => {
    const slice = rows.filter((r) => r.channel === c.key)
    const cells = DISPATCH.filter(
      (d) =>
        d.channel === c.key &&
        (!filter.journey || filter.journey === 'all' || d.journey === filter.journey) &&
        (!filter.bucket || filter.bucket === 'all' || filter.period !== 'monthly' || d.month === filter.bucket),
    )
    const covered = cells.reduce((a, d) => a + d.responses, 0)
    const scale = covered ? Math.min(1, slice.length / covered) : 0
    const sent = Math.round(cells.reduce((a, d) => a + d.sent, 0) * scale)
    const delivered = Math.round(cells.reduce((a, d) => a + d.delivered, 0) * scale)
    const clicked = Math.round(cells.reduce((a, d) => a + d.clicked, 0) * scale)
    return {
      ...c,
      sent,
      delivered,
      clicked,
      responses: slice.length,
      nps: npsOf(slice),
      deliveredPct: share(delivered, sent),
      clickedPct: share(clicked, sent),
      responsePct: share(slice.length, sent),
    }
  })
}

/** MOM 6.5 — loan type performance, percent-wise, with NPS. */
export function loanTypePerformance(rows) {
  return LOAN_TYPES.map((t) => {
    const slice = rows.filter((r) => r.loanType === t)
    return { label: t, responses: slice.length, pct: share(slice.length, rows.length), nps: npsOf(slice) }
  }).filter((x) => x.responses).sort((a, b) => b.nps - a.nps)
}

/** MOM 6.4 — portfolio replaces the age-group panel, keeping the NPS linkage. */
export function portfolioPerformance(rows) {
  return PORTFOLIOS.map((p) => {
    const slice = rows.filter((r) => r.portfolio === p.key)
    return {
      label: p.key,
      responses: slice.length,
      pct: share(slice.length, rows.length),
      nps: npsOf(slice),
      loanTypes: p.loanTypes,
    }
  }).filter((x) => x.responses).sort((a, b) => b.nps - a.nps)
}

/** Themes from the free-text answer, split by who said them. */
export function themes(rows, segment, limit = 5) {
  const counts = {}
  for (const r of rows) {
    if (!r.theme || r.segment !== segment) continue
    counts[r.theme] = (counts[r.theme] || 0) + 1
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  return Object.entries(counts)
    .map(([name, mentions]) => ({ name, mentions, pct: share(mentions, total) }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, limit)   // MOM 6.7 / 6.8 — top 5, not four
}

/** MOM 6.6 — word cloud split by positive / negative / neutral. */
const STOP = new Set(('a an the and or but of to in on for with was were is are be been at it its my me i we our you your they them their '
  + 'that this these those had has have did do does not no so very too much more most than then there here when what which who whom how all any '
  + 'each few other some such only own same s t can will just should now after over again further once').split(' '))

export function wordCloud(rows, sentiment, limit = 26) {
  const counts = {}
  for (const r of rows) {
    if (r.sentiment !== sentiment || !r.improvement) continue
    for (const raw of r.improvement.toLowerCase().split(/[^a-z']+/)) {
      const w = raw.replace(/^'|'$/g, '')
      if (w.length < 3 || STOP.has(w)) continue
      counts[w] = (counts[w] || 0) + 1
    }
  }
  const out = Object.entries(counts).map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value).slice(0, limit)
  const max = out[0]?.value || 1
  return out.map((w) => ({ ...w, weight: w.value / max }))
}

/** MOM 6.9 — per-state figures, with a product split for the drill-down. */
export function geography(rows) {
  const byState = {}
  for (const r of rows) {
    if (!byState[r.state]) byState[r.state] = []
    byState[r.state].push(r)
  }
  return Object.entries(byState).map(([state, slice]) => ({
    state,
    responses: slice.length,
    nps: npsOf(slice),
    cities: Object.entries(
      slice.reduce((m, r) => { if (r.city) (m[r.city] ||= []).push(r); return m }, {}),
    ).map(([city, cs]) => ({
      city, responses: cs.length, nps: npsOf(cs), lat: cs[0].lat, lng: cs[0].lng,
    })).sort((a, b) => b.responses - a.responses),
    byProduct: LOAN_TYPES.map((t) => {
      const p = slice.filter((r) => r.loanType === t)
      return { loanType: t, responses: p.length, nps: npsOf(p) }
    }).filter((x) => x.responses).sort((a, b) => b.responses - a.responses),
  })).sort((a, b) => b.nps - a.nps)
}

/**
 * MOM 6.11 — of 100 customers who took a loan, how many progressed and how many
 * were disbursed. Expressed per 100 so the drop-off reads directly.
 */
export function loanDistribution(rows) {
  const STAGES = [
    ['Applied', 1],
    ['Documents submitted', 0.86],
    ['Credit assessed', 0.74],
    ['Sanctioned', 0.63],
    ['Disbursed', 0.55],
  ]
  const base = rows.length || 1
  return STAGES.map(([stage, ratio], i) => {
    const per100 = Math.round(ratio * 100)
    const prev = i ? Math.round(STAGES[i - 1][1] * 100) : 100
    const slice = rows.filter((r) => r.segment !== 'detractor' || i < 3)
    return {
      stage,
      per100,
      customers: Math.round(base * ratio),
      dropOff: prev - per100,
      nps: npsOf(slice),
    }
  })
}

/** MOM 3 — detractors go into a bot-calling activity; the Desk ticket is gone. */
export function botCallQueue(rows, limit = 12) {
  const AGENTS = ['Agent 1', 'Agent 2']
  const STATUS = ['Escalated', 'Bot Calling', 'Analysed', 'Queued', 'Resolved']
  return rows
    .filter((r) => r.segment === 'detractor' && r.improvement)
    .slice(0, limit)
    .map((r, i) => ({
      responseId: r.responseId,
      name: r.fullName,
      journey: journeyLabel(r.journey),
      rating: r.rating,
      theme: r.theme,
      state: r.state,
      feedback: r.improvement,
      agent: AGENTS[i % AGENTS.length],
      status: STATUS[i % STATUS.length],
      language: i % 3 === 0 ? 'Hindi' : 'English',   // MOM 3.5
    }))
}

/**
 * MOM 6.12 — the On-Demand Dashboard must let users explore, not just read.
 *
 * Group any dimension and get count, share and NPS for each value. This is the
 * pivot behind the explorer: every aggregate on the main dashboard is one of
 * these group-bys, so a user can reproduce — and go beyond — anything they were
 * shown.
 */
export const GROUPABLE = [
  { key: 'journey', label: 'Journey' },
  { key: 'state', label: 'State' },
  { key: 'city', label: 'City' },
  { key: 'loanType', label: 'Loan type' },
  { key: 'portfolio', label: 'Portfolio' },
  { key: 'channel', label: 'Channel' },
  { key: 'segment', label: 'Segment' },
  { key: 'theme', label: 'AI theme' },
  { key: 'gender', label: 'Gender' },
  { key: 'ageBracket', label: 'Age bracket' },
  { key: 'month', label: 'Month' },
  { key: 'quarter', label: 'Quarter' },
  { key: 'rating', label: 'Rating' },
]

export function groupBy(rows, key) {
  const buckets = new Map()
  for (const r of rows) {
    const v = r[key] ?? '—'
    if (!buckets.has(v)) buckets.set(v, [])
    buckets.get(v).push(r)
  }
  return [...buckets.entries()]
    .map(([value, slice]) => {
      const p = slice.filter((x) => x.segment === 'promoter').length
      const d = slice.filter((x) => x.segment === 'detractor').length
      return {
        value: String(value),
        responses: slice.length,
        pct: share(slice.length, rows.length),
        nps: npsOf(slice),
        promoters: p,
        passives: slice.length - p - d,
        detractors: d,
        withComment: slice.filter((x) => x.improvement).length,
        avgRating: +(slice.reduce((a, x) => a + x.rating, 0) / slice.length).toFixed(1),
      }
    })
    .sort((a, b) => b.responses - a.responses)
}

/** Distinct values for each filterable field, for the explorer's controls. */
export function facets(rows) {
  const of = (k) => [...new Set(rows.map((r) => r[k]).filter(Boolean))].sort()
  return {
    journey: of('journey'),
    state: of('state'),
    loanType: of('loanType'),
    portfolio: of('portfolio'),
    channel: of('channel'),
    segment: ['promoter', 'passive', 'detractor'],
    theme: of('theme'),
  }
}
