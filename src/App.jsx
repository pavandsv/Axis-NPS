import { useMemo, useState } from 'react'
import Login from './components/Login'
import Header from './components/Header'
import KpiRow from './components/KpiRow'
import PeriodSlicer from './components/PeriodSlicer'
import IndiaMap from './components/IndiaMap'
import BotCallQueue from './components/BotCallQueue'
import OnDemandDashboard from './components/OnDemandDashboard'
import AiInsights from './components/AiInsights'
import ResponseDrawer from './components/ResponseDrawer'
import SentimentCloud from './components/SentimentCloud'
import { journeyLabel } from './data/config'
import {
  NpsDistribution, JourneyScores, ChannelPerformance,
  LoanTypePerformance, PortfolioPerformance, ThemePanel, LoanDistribution,
} from './components/Panels'
import { ROLES } from './data/roles'
import * as A from './logic/analytics'

export default function App() {
  const [roleKey, setRoleKey] = useState(null)
  const [journey, setJourney] = useState('all')
  const [period, setPeriod] = useState('monthly')
  const [bucket, setBucket] = useState('all')
  const [tab, setTab] = useState('dashboard')
  const [aiItems, setAiItems] = useState([])
  const [drill, setDrill] = useState(null)

  const role = roleKey ? ROLES[roleKey] : null

  // One filtered set feeds every panel, so nothing on screen can disagree.
  const rows = useMemo(
    () => (role ? A.filterResponses(role, { journey, period, bucket }) : []),
    [role, journey, period, bucket],
  )
  const allRows = useMemo(() => (role ? A.filterResponses(role, {}) : []), [role])

  const k = useMemo(() => A.headline(rows, allRows), [rows, allRows])
  const dist = useMemo(() => A.distribution(rows), [rows])
  const scores = useMemo(() => (role ? A.journeyScores(role, { period, bucket }) : []), [role, period, bucket])
  const trend = useMemo(() => A.trend(rows, period), [rows, period])
  const scopeLine = `${journey === 'all' ? 'All journeys' : journeyLabel(journey)} · ${bucket === 'all' ? 'all periods' : bucket}`

  // One entry point for every drill-down, so each panel only has to say WHAT it
  // wants and never how the drawer works.
  const openDrill = (title, subtitle, predicate) =>
    setDrill({ title, subtitle, rows: rows.filter(predicate) })

  if (!role) return <Login onSignIn={setRoleKey} />

  const pinned = aiItems.filter((i) => i.pinned)

  return (
    <div className="min-h-screen">
      <Header
        roleKey={roleKey}
        journey={journey}
        onJourney={setJourney}
        onSignOut={() => { setRoleKey(null); setTab('dashboard'); setJourney('all') }}
      />

      <div className="border-b border-surface-line bg-white">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-1 px-5">
          {[
            ['dashboard', 'Dashboard'],
            ['odd', 'On-Demand Dashboard'],
            ...(role.ai ? [['ai', '✦ AI Insights']] : []),
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`border-b-2 px-3 py-2.5 text-[13px] font-semibold transition-colors ${
                tab === key ? 'border-brand text-brand' : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
          <div className="ml-auto py-2">
            <PeriodSlicer
              period={period}
              bucket={bucket}
              onChange={(p, b) => { setPeriod(p); setBucket(b) }}
            />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1600px] space-y-4 p-5">
        {tab === 'dashboard' && (
          <>
            <KpiRow
              k={k}
              dist={dist}
              onDrill={(which) => {
                if (which === 'detractors') openDrill('Detractor cases', 'Routed to the AI bot-calling activity', (r) => r.segment === 'detractor')
                else if (which === 'clicked') openDrill('Clicked through', 'Customers who opened the survey link', (r) => r.clicked)
                else openDrill('All responses', scopeLine, () => true)
              }}
            />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <NpsDistribution
                dist={dist}
                onDrill={(seg, label) => openDrill(label, `Rating band · ${scopeLine}`, (r) => r.segment === seg)}
              />
              <JourneyScores
                scores={scores}
                journey={journey}
                onJourney={setJourney}
                trend={trend}
                onDrillPeriod={(label) =>
                  openDrill(
                    label,
                    `${period === 'monthly' ? 'Month' : period === 'quarterly' ? 'Quarter' : 'Year'} · ${journey === 'all' ? 'all journeys' : journeyLabel(journey)}`,
                    (r) => String(period === 'monthly' ? r.month : period === 'quarterly' ? r.quarter : r.year) === label,
                  )
                }
              />
            </div>

            <SentimentCloud
              rows={rows}
              onDrill={(w) =>
                openDrill(
                  `“${w.text}”`,
                  `${w.value} mentions · ${w.sentiment.toLowerCase()} feedback`,
                  (r) => r.sentiment === w.sentiment && new RegExp(`\\b${w.text}\\b`, 'i').test(r.improvement || ''),
                )
              }
            />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <ChannelPerformance
                channels={A.channelPerformance(rows)}
                onDrill={(ch) => openDrill(`${ch} responses`, `Survey channel · ${scopeLine}`, (r) => r.channel === ch)}
              />
              <LoanTypePerformance
                rows={A.loanTypePerformance(rows)}
                onDrill={(t) => openDrill(t, `Loan type · ${scopeLine}`, (r) => r.loanType === t)}
              />
              <PortfolioPerformance
                rows={A.portfolioPerformance(rows)}
                onDrill={(pf) => openDrill(pf, `Portfolio · ${scopeLine}`, (r) => r.portfolio === pf)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ThemePanel
                title="What Worked Well"
                sub="Top 5 themes from promoter comments"
                rows={A.themes(rows, 'promoter', 5)}
                tone="good"
                onDrill={(t) => openDrill(t, 'Promoters who raised this', (r) => r.theme === t && r.segment === 'promoter')}
              />
              <ThemePanel
                title="Needs Improvement"
                sub="Top 5 themes from detractor comments"
                rows={A.themes(rows, 'detractor', 5)}
                tone="bad"
                onDrill={(t) => openDrill(t, 'Detractors who raised this', (r) => r.theme === t && r.segment === 'detractor')}
              />
            </div>

            {pinned.length > 0 && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {pinned.map((p) => (
                  <div key={p.id} className="card p-5">
                    <p className="card-title">{p.title}</p>
                    <p className="card-sub">Pinned from AI Insights</p>
                    <p className="mt-3 text-[12px] leading-relaxed text-ink-soft">{p.text}</p>
                  </div>
                ))}
              </div>
            )}

            <IndiaMap
              role={role}
              geo={A.geography(rows)}
              onDrill={(state, city, product) => {
                if (product) openDrill(`${product} · ${state}`, 'Product within state', (r) => r.state === state && r.loanType === product)
                else if (city) openDrill(`${city}, ${state}`, 'City drill-down', (r) => r.state === state && r.city === city)
                else openDrill(state, `State drill-down · ${scopeLine}`, (r) => r.state === state)
              }}
            />
            <LoanDistribution
              stages={A.loanDistribution(rows)}
              onDrill={(stage) => openDrill(stage, 'Customers reaching this stage', () => true)}
            />
            <BotCallQueue queue={A.botCallQueue(rows)} k={k} />
          </>
        )}

        {tab === 'odd' && <OnDemandDashboard rows={rows} />}

        {tab === 'ai' && (
          <AiInsights
            items={aiItems}
            onPin={(id) => setAiItems((xs) => xs.map((x) => (x.id === id ? { ...x, pinned: !x.pinned } : x)))}
            onRemove={(id) => setAiItems((xs) => xs.filter((x) => x.id !== id))}
            onOpenAssistant={() => {}}
          />
        )}
      </main>

      {drill && (
        <ResponseDrawer
          title={drill.title}
          subtitle={drill.subtitle}
          rows={drill.rows}
          onClose={() => setDrill(null)}
        />
      )}

      <footer className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-2 px-5 py-6 text-[11px] text-ink-faint">
        <span>Axis Finance Limited · NPS 360 · Survey + AI Analytics</span>
        <span>Dashboard published by the 5th for the previous month · GDPR &amp; RBI compliant</span>
      </footer>
    </div>
  )
}
