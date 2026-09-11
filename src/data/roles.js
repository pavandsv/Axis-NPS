// Extracted verbatim from the deployed AFL NPS dashboard — do not hand-edit.
//
// Four demo personas. Each carries its own KPI block rather than deriving one,
// because the live app ships pre-computed figures per role; the state list is
// what drives the map and the geographic tables.
//
// `ai` gates the assistant AND the AI Insights tab: Regional and Branch
// Managers see "AI features restricted for this role".

const WEST_ZONE = ['Maharashtra', 'Gujarat', 'Rajasthan', 'Madhya Pradesh', 'Chhattisgarh']
const SOUTH_ZONE = ['Tamil Nadu', 'Kerala', 'Karnataka', 'Telangana', 'Andhra Pradesh']

export const ROLES = {
  admin: {
    key: 'admin',
    name: 'Administrator',
    dept: 'IT & Analytics',
    level: 'Full access',
    ai: true,
    states: 'all',
    scopeLabel: 'National · all India (20 states)',
    badge: 'pill-brand',
    kpi: { nps: '+38', resp: '847', rate: '31%', sla: '88%', res: '1.8', promoters: 49, passives: 25, detractors: 26 },
  },
  leadership: {
    key: 'leadership',
    name: 'Upper Management',
    dept: 'South & West Zone',
    level: 'Leadership',
    ai: true,
    states: [...WEST_ZONE, ...SOUTH_ZONE],
    scopeLabel: 'South & West Zone · 10 states',
    badge: 'pill-purple',
    kpi: { nps: '+38', resp: '571', rate: '30%', sla: '87%', res: '1.9', promoters: 49, passives: 26, detractors: 25 },
  },
  regional: {
    key: 'regional',
    name: 'Regional Manager',
    dept: 'West Region',
    level: 'Region',
    ai: false,
    states: WEST_ZONE,
    scopeLabel: 'West Region · 5 states',
    badge: 'pill-blue',
    kpi: { nps: '+35', resp: '311', rate: '33%', sla: '86%', res: '1.9', promoters: 47, passives: 26, detractors: 27 },
  },
  branch: {
    key: 'branch',
    name: 'Branch Manager',
    dept: 'Maharashtra',
    level: 'Branch',
    ai: false,
    states: ['Maharashtra'],
    scopeLabel: 'Maharashtra · branch view',
    badge: 'pill-green',
    kpi: { nps: '+41', resp: '145', rate: '35%', sla: '90%', res: '1.6', promoters: 52, passives: 24, detractors: 24 },
  },
}

export const USERS = {
  admin: { username: 'admin', name: 'Rahul Khanna', role: 'admin' },
  leadership: { username: 'leadership', name: 'Priya Nair', role: 'leadership' },
  regional: { username: 'regional', name: 'Amit Deshpande', role: 'regional' },
  branch: { username: 'branch', name: 'Sneha Kulkarni', role: 'branch' },
}

export const DEMO_PASSWORD = 'demo123'

export const ROLE_ORDER = ['admin', 'leadership', 'regional', 'branch']

/** Whether a state is inside this role's remit — drives the map and the tables. */
export const inScope = (role, stateName) =>
  role.states === 'all' || role.states.includes(stateName)

export const JOURNEYS = [
  { key: 'all', label: 'All Journeys' },
  { key: 'onboarding', label: 'Onboarding' },
  { key: 'closure', label: 'Loan Closure' },
  { key: 'service', label: 'Service' },
]

/** Survey delivery channels — vendor names are part of the client's story. */
export const CHANNELS = [
  { label: 'SMS', sub: 'via Karix', pct: 38, responses: 322, color: '#3B82F6', tint: '#DBEAFE' },
  { label: 'WhatsApp', sub: 'via Gupshup', pct: 29, responses: 246, color: '#10B981', tint: '#D1FAE5' },
  { label: 'Email', sub: 'via Zoho', pct: 22, responses: 186, color: '#8B5CF6', tint: '#EDE9FE' },
  { label: 'AI Call', sub: 'AI voice agent', pct: 11, responses: 93, color: '#F59E0B', tint: '#FEF3C7' },
]

/** The NPS colour bands the map legend and every score chip read from. */
export const NPS_BANDS = [
  { min: 42, label: '≥ 42 Excellent', color: '#10B981' },
  { min: 37, label: '37–41 Good', color: '#34D399' },
  { min: 30, label: '30–36 Moderate', color: '#F59E0B' },
  { min: 24, label: '24–29 Needs Work', color: '#F97316' },
  { min: -Infinity, label: '< 24 Critical', color: '#EF4444' },
]

export const npsColor = (n) =>
  (NPS_BANDS.find((b) => n >= b.min) || NPS_BANDS[NPS_BANDS.length - 1]).color
