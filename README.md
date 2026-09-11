# AFL NPS Intelligence Dashboard

A React rebuild of the deployed NPS dashboard at
`afl-nps-dashboard.onslate.com`, reconstructed from its production bundle so the
data, copy, colours and role behaviour match the original rather than
approximating it.

```
npm install
npm run dev      # http://localhost:5174
npm run build
npm run preview
```

## Stack

Matches the original: **React 18 · Vite · Tailwind · Chart.js 4 · Leaflet**.
No router — the app is a single page with two tabs.

## Role-based scope

Four demo personas, password `demo123`. The scope is not cosmetic: it filters
the map, the state table, and the KPI block.

| Persona | Scope | AI |
|---|---|---|
| Administrator — Rahul Khanna | National · all India (20 states) | yes |
| Upper Management — Priya Nair | South & West Zone · 10 states | yes |
| Regional Manager — Amit Deshpande | West Region · 5 states | no |
| Branch Manager — Sneha Kulkarni | Maharashtra · branch view | no |

A Branch Manager sees NPS +41 across 145 responses where an Administrator sees
+38 across 847, loses the AI Insights tab entirely, and gets "AI features
restricted for this role" in the scope strip.

## Data

Everything under `src/data/` was extracted from the deployed build, not
invented:

- `journeys.js` — KPIs, trend, sentiment and VOC themes per journey filter
- `geo.js` — 20 states and 47 cities with coordinates, NPS and response volume
- `cases.js` — the 10 closed-loop cases with verbatim feedback and AI drafts
- `demographics.js`, `themes.js`, `roles.js`

`public/india_states.geojson` is the same 36-feature boundary file the original
uses, keyed on `ST_NM`.

## Not yet built

The **AI assistant** — the floating button, chat panel, live voice mode and
Gemini function calling (`filterJourney`, `zoomToState`, `createChart`,
`showInsight`). The original calls Google Gemini directly from the browser with
an API key. The AI Insights tab and its pin-to-dashboard flow are in place and
will accept assistant output once that decision is made.
