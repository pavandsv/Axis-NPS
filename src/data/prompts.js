// ---------------------------------------------------------------------------
// On-Demand Dashboard prompt set — MOM 6.13, "configure the prompt set so Axis
// users get useful output out of the box".
//
// No model is called. Each prompt is a saved question with a deterministic
// recipe: which rows to take, how to group them, what to chart and what to say
// about the result. That keeps the POC offline and makes every answer
// reproducible — the same prompt always yields the same dashboard.
//
// A recipe returns { filter, groupBy, chart, metric } and the view builds
// itself from that, so adding a prompt is a data change, not a code change.
// ---------------------------------------------------------------------------

export const PROMPTS = [
  {
    id: 'worst-journeys',
    q: 'Which customer journeys are hurting our NPS most?',
    hint: 'Ranks all eight journeys by NPS and shows where the detractors sit',
    groupBy: 'journey',
    chart: 'bar',
    metric: 'nps',
    sort: 'asc',
    takeaway: (g) =>
      `${g[0].label} is the weakest journey at NPS ${g[0].nps >= 0 ? '+' : ''}${g[0].nps}, ` +
      `${g[g.length - 1].nps - g[0].nps} points behind ${g[g.length - 1].label}.`,
  },
  {
    id: 'state-performance',
    q: 'How does NPS vary across states?',
    hint: 'Every state in your remit, ranked, with response volume',
    groupBy: 'state',
    chart: 'bar',
    metric: 'nps',
    sort: 'desc',
    takeaway: (g) =>
      `${g[0].label} leads at NPS ${g[0].nps >= 0 ? '+' : ''}${g[0].nps}; ` +
      `${g[g.length - 1].label} trails at ${g[g.length - 1].nps}.`,
  },
  {
    id: 'detractor-themes',
    q: 'What are detractors complaining about?',
    hint: 'Themes extracted from detractor free text, most cited first',
    filter: { segment: 'detractor' },
    groupBy: 'theme',
    chart: 'bar',
    metric: 'responses',
    sort: 'desc',
    takeaway: (g) =>
      `${g[0].label} is the top complaint, raised by ${g[0].responses} detractors ` +
      `(${g[0].pct}% of those who commented).`,
  },
  {
    id: 'promoter-themes',
    q: 'What do promoters praise us for?',
    hint: 'The themes behind our highest scores — what to protect',
    filter: { segment: 'promoter' },
    groupBy: 'theme',
    chart: 'bar',
    metric: 'responses',
    sort: 'desc',
    takeaway: (g) => `${g[0].label} is our strongest asset, cited by ${g[0].responses} promoters.`,
  },
  {
    id: 'product-nps',
    q: 'Which loan products score best and worst?',
    hint: 'NPS by product, with the share of responses each represents',
    groupBy: 'loanType',
    chart: 'bar',
    metric: 'nps',
    sort: 'desc',
    takeaway: (g) =>
      `${g[0].label} performs best at NPS ${g[0].nps >= 0 ? '+' : ''}${g[0].nps}, ` +
      `${g[0].nps - g[g.length - 1].nps} points clear of ${g[g.length - 1].label}.`,
  },
  {
    id: 'channel-effectiveness',
    q: 'Which survey channel gets the best response?',
    hint: 'Response counts and NPS by channel — SMS is out of scope',
    groupBy: 'channel',
    chart: 'bar',
    metric: 'responses',
    sort: 'desc',
    takeaway: (g) =>
      `${g[0].label} returns the most responses (${g[0].responses}), ` +
      `${g[0].pct - g[g.length - 1].pct} points ahead of ${g[g.length - 1].label}.`,
  },
  {
    id: 'nps-trend',
    q: 'How has NPS moved month by month?',
    hint: 'The trend across the period, with volume behind each point',
    groupBy: 'month',
    chart: 'line',
    metric: 'nps',
    sort: 'none',
    order: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    takeaway: (g) => {
      const first = g[0]
      const last = g[g.length - 1]
      const delta = last.nps - first.nps
      return `NPS moved from ${first.nps} in ${first.label} to ${last.nps} in ${last.label} — ` +
        `${delta >= 0 ? 'up' : 'down'} ${Math.abs(delta)} points.`
    },
  },
  {
    id: 'portfolio-nps',
    q: 'How does each portfolio perform?',
    hint: 'Retail Secured, Retail Unsecured, Wheels and Commercial',
    groupBy: 'portfolio',
    chart: 'bar',
    metric: 'nps',
    sort: 'desc',
    takeaway: (g) =>
      `${g[0].label} leads on NPS ${g[0].nps >= 0 ? '+' : ''}${g[0].nps}; ` +
      `${g[g.length - 1].label} is the weakest at ${g[g.length - 1].nps}.`,
  },
  {
    id: 'sla-risk',
    q: 'Where are detractor cases breaching SLA?',
    hint: 'Cases past the 48-hour bot-calling SLA, by journey',
    filter: { segment: 'detractor', slaBreached: true },
    groupBy: 'journey',
    chart: 'bar',
    metric: 'responses',
    sort: 'desc',
    takeaway: (g) =>
      g.length
        ? `${g[0].label} has the most breached cases (${g[0].responses} of ${g.reduce((a, x) => a + x.responses, 0)}).`
        : 'No detractor cases are breaching SLA in this selection.',
  },
  {
    id: 'rating-spread',
    q: 'How are the 0–10 ratings actually distributed?',
    hint: 'The raw score spread behind the NPS headline',
    groupBy: 'rating',
    chart: 'bar',
    metric: 'responses',
    sort: 'none',
    order: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    takeaway: (g) => {
      const top = [...g].sort((a, b) => b.responses - a.responses)[0]
      return `Rating ${top.label} is the most common answer, given by ${top.responses} customers (${top.pct}%).`
    },
  },
]

export const promptById = (id) => PROMPTS.find((p) => p.id === id)
