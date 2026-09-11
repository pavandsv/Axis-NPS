import { useMemo, useState } from 'react'
import Login from './components/Login'
import Header from './components/Header'
import KpiRow from './components/KpiRow'
import PeriodSlicer from './components/PeriodSlicer'
import WordCloud from './components/WordCloud'
import IndiaMap from './components/IndiaMap'
import BotCallQueue from './components/BotCallQueue'
import OnDemandDashboard from './components/OnDemandDashboard'
import AiInsights from './components/AiInsights'
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
            <KpiRow k={k} dist={dist} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <NpsDistribution dist={dist} />
              <JourneyScores scores={scores} journey={journey} onJourney={setJourney} trend={trend} />
            </div>

            <WordCloud rows={rows} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <ChannelPerformance channels={A.channelPerformance(rows)} />
              <LoanTypePerformance rows={A.loanTypePerformance(rows)} />
              <PortfolioPerformance rows={A.portfolioPerformance(rows)} />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ThemePanel
                title="What Worked Well"
                sub="Top 5 themes from promoter comments"
                rows={A.themes(rows, 'promoter', 5)}
                tone="good"
              />
              <ThemePanel
                title="Needs Improvement"
                sub="Top 5 themes from detractor comments"
                rows={A.themes(rows, 'detractor', 5)}
                tone="bad"
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

            <IndiaMap role={role} geo={A.geography(rows)} />
            <LoanDistribution stages={A.loanDistribution(rows)} />
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

      <footer className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-2 px-5 py-6 text-[11px] text-ink-faint">
        <span>Axis Finance Limited · NPS 360 · Survey + AI Analytics</span>
        <span>Dashboard published by the 5th for the previous month · GDPR &amp; RBI compliant</span>
      </footer>
    </div>
  )
}
