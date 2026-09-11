// Extracted verbatim from the deployed AFL NPS dashboard — do not hand-edit.
// Keyed by the journey filter: all | onboarding | closure | service.

export const JOURNEY_DATA = {
  "all": {
    "nps": "+38",
    "resp": "847",
    "rate": "31%",
    "sla": "88%",
    "res": "1.8",
    "promoters": 49,
    "passives": 25,
    "detractors": 26,
    "trend": [
      29,
      31,
      35,
      33,
      38,
      41
    ],
    "sentiment": [
      47,
      28,
      25
    ],
    "themes": [
      {
        "name": "Documentation TAT",
        "pct": 38,
        "color": "#EF4444",
        "badge": "pill-red",
        "impact": "High Impact",
        "quote": "\"Loan documents took over 2 weeks to process\""
      },
      {
        "name": "Response Time",
        "pct": 29,
        "color": "#F97316",
        "badge": "pill-red",
        "impact": "High Impact",
        "quote": "\"Nobody called back after multiple follow-ups\""
      },
      {
        "name": "Communication Gaps",
        "pct": 19,
        "color": "#F59E0B",
        "badge": "pill-amber",
        "impact": "Medium",
        "quote": "\"No updates on application status for days\""
      },
      {
        "name": "Portal / App Issues",
        "pct": 14,
        "color": "#3B82F6",
        "badge": "pill-blue",
        "impact": "Low",
        "quote": "\"Couldn't upload documents on the app\""
      }
    ],
    "insight": "67% of detractors cite process delays or communication failures. Primary RCA: documentation TAT in onboarding exceeds 5 business days. Recommend SLA of 3 days for document verification."
  },
  "onboarding": {
    "nps": "+35",
    "resp": "312",
    "rate": "34%",
    "sla": "85%",
    "res": "2.1",
    "promoters": 46,
    "passives": 27,
    "detractors": 27,
    "trend": [
      22,
      25,
      30,
      28,
      33,
      37
    ],
    "sentiment": [
      44,
      29,
      27
    ],
    "themes": [
      {
        "name": "Documentation TAT",
        "pct": 52,
        "color": "#EF4444",
        "badge": "pill-red",
        "impact": "High Impact",
        "quote": "\"KYC documents took 3 weeks to verify\""
      },
      {
        "name": "Portal / App Issues",
        "pct": 24,
        "color": "#3B82F6",
        "badge": "pill-blue",
        "impact": "High Impact",
        "quote": "\"Couldn't complete eKYC on the mobile app\""
      },
      {
        "name": "Communication Gaps",
        "pct": 16,
        "color": "#F59E0B",
        "badge": "pill-amber",
        "impact": "Medium",
        "quote": "\"No SMS updates during application processing\""
      },
      {
        "name": "RM Responsiveness",
        "pct": 8,
        "color": "#10B981",
        "badge": "pill-green",
        "impact": "Low",
        "quote": "\"RM took 2 days to respond to my query\""
      }
    ],
    "insight": "52% of onboarding detractors specifically mention documentation TAT exceeding 5 days. Immediate priority: reduce KYC processing to under 3 business days."
  },
  "closure": {
    "nps": "+44",
    "resp": "198",
    "rate": "29%",
    "sla": "92%",
    "res": "1.4",
    "promoters": 56,
    "passives": 22,
    "detractors": 22,
    "trend": [
      33,
      35,
      39,
      38,
      43,
      46
    ],
    "sentiment": [
      53,
      27,
      20
    ],
    "themes": [
      {
        "name": "NOC Delay",
        "pct": 41,
        "color": "#EF4444",
        "badge": "pill-red",
        "impact": "High Impact",
        "quote": "\"NOC took 3 weeks after full loan payment\""
      },
      {
        "name": "Closure Process",
        "pct": 31,
        "color": "#F97316",
        "badge": "pill-amber",
        "impact": "Medium",
        "quote": "\"Too many documents required for closure\""
      },
      {
        "name": "Communication",
        "pct": 18,
        "color": "#F59E0B",
        "badge": "pill-amber",
        "impact": "Medium",
        "quote": "\"No confirmation email received after closure\""
      },
      {
        "name": "Staff Behavior",
        "pct": 10,
        "color": "#10B981",
        "badge": "pill-green",
        "impact": "Low",
        "quote": "\"Branch staff was dismissive about timeline\""
      }
    ],
    "insight": "Loan closure has the best NPS across all journeys. Main pain point: NOC issuance TAT. Consider digital NOC dispatch to improve the score further."
  },
  "service": {
    "nps": "+32",
    "resp": "337",
    "rate": "27%",
    "sla": "86%",
    "res": "2.0",
    "promoters": 44,
    "passives": 24,
    "detractors": 32,
    "trend": [
      20,
      22,
      26,
      25,
      30,
      34
    ],
    "sentiment": [
      42,
      29,
      29
    ],
    "themes": [
      {
        "name": "Response Time",
        "pct": 45,
        "color": "#EF4444",
        "badge": "pill-red",
        "impact": "High Impact",
        "quote": "\"Waited 5 days for a simple statement of account\""
      },
      {
        "name": "Resolution Quality",
        "pct": 28,
        "color": "#F97316",
        "badge": "pill-red",
        "impact": "High Impact",
        "quote": "\"Issue was not resolved on first contact\""
      },
      {
        "name": "Communication",
        "pct": 18,
        "color": "#F59E0B",
        "badge": "pill-amber",
        "impact": "Medium",
        "quote": "\"Promised callback was never made\""
      },
      {
        "name": "Portal Issues",
        "pct": 9,
        "color": "#3B82F6",
        "badge": "pill-blue",
        "impact": "Low",
        "quote": "\"Service request status not updating online\""
      }
    ],
    "insight": "Customer Service has the highest detractor rate at 32%. FCR (First Contact Resolution) is the critical metric — 28% of complaints required repeat contact."
  }
}
