import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { NPS_BANDS, npsColor, CATEGORICAL } from '../theme/palette'
import { inScope } from '../data/roles'

const INDIA_BOUNDS = L.latLngBounds([6.5, 68], [36, 97.5])

/**
 * MOM 6.9 — "Enable detailed drill-down on clicking the India map for NPS
 * score, and add response by product."
 *
 * Clicking a state zooms to it and opens a panel with its cities and its
 * product split, so the map answers "which state" and then "what within it".
 *
 * GeoJSON polygons only, no tile layer: nothing is fetched from a third party
 * at runtime and the map works offline.
 */
export default function IndiaMap({ role, geo, onDrill }) {
  const host = useRef(null)
  const map = useRef(null)
  const [metric, setMetric] = useState('nps')
  const [selected, setSelected] = useState(null)

  const byState = Object.fromEntries(geo.map((g) => [g.state, g]))
  const detail = selected ? byState[selected] : null

  useEffect(() => {
    if (!host.current || map.current) return undefined
    const m = L.map(host.current, { zoomControl: true, attributionControl: false, scrollWheelZoom: false })
    map.current = m
    m.fitBounds(INDIA_BOUNDS, { padding: [4, 4] })
    const settle = setTimeout(() => {
      if (map.current !== m) return
      m.invalidateSize()
      m.fitBounds(INDIA_BOUNDS, { padding: [4, 4] })
    }, 200)
    return () => { clearTimeout(settle); map.current = null; m.remove() }
  }, [])

  useEffect(() => {
    const m = map.current
    if (!m) return undefined
    let layer
    let markers = []
    let cancelled = false

    fetch('/india_states.geojson')
      .then((r) => r.json())
      .then((geojson) => {
        if (cancelled || !map.current) return
        const maxResp = Math.max(1, ...geo.map((g) => g.responses))
        layer = L.geoJSON(geojson, {
          style: (f) => {
            const name = f.properties.ST_NM
            const d = byState[name]
            if (!inScope(role, name) || !d) {
              return { fillColor: '#E6E3E8', fillOpacity: 0.35, color: '#FFFFFF', weight: 1 }
            }
            return metric === 'nps'
              ? { fillColor: npsColor(d.nps), fillOpacity: 0.78, color: '#FFFFFF', weight: 1 }
              : { fillColor: CATEGORICAL[0], fillOpacity: 0.2 + (d.responses / maxResp) * 0.68, color: '#FFFFFF', weight: 1 }
          },
          onEachFeature: (f, lyr) => {
            const name = f.properties.ST_NM
            const d = byState[name]
            if (!inScope(role, name) || !d) return
            lyr.bindTooltip(`${name} — NPS ${d.nps >= 0 ? '+' : ''}${d.nps} · ${d.responses} responses`, { sticky: true })
            lyr.on('click', () => {
              setSelected(name)
              map.current.fitBounds(lyr.getBounds(), { padding: [24, 24] })
              onDrill?.(name)
            })
          },
        }).addTo(m)

        if (detail) {
          markers = detail.cities.map((c) =>
            L.circleMarker([c.lat, c.lng], {
              radius: Math.max(5, Math.sqrt(c.responses) * 1.6),
              fillColor: npsColor(c.nps),
              fillOpacity: 0.9,
              color: '#FFFFFF',
              weight: 1.5,
            })
              .bindTooltip(`${c.city} — NPS ${c.nps >= 0 ? '+' : ''}${c.nps} · ${c.responses} responses`)
              .on('click', () => onDrill?.(detail.state, c.city))
              .addTo(m),
          )
        }
      })

    return () => {
      cancelled = true
      if (layer && map.current) map.current.removeLayer(layer)
      markers.forEach((mk) => map.current && map.current.removeLayer(mk))
    }
  }, [role, metric, selected, geo, onDrill])

  const reset = () => {
    setSelected(null)
    map.current?.fitBounds(INDIA_BOUNDS, { padding: [4, 4] })
  }

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="card-title">Geographic Response Distribution</p>
          <p className="card-sub">Click a state to drill into its cities and product mix</p>
          <p className="mt-1 text-[10px] font-medium text-brand">
            ✣ Click the map, a state, a city or a product to read those responses
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {[['nps', 'NPS Score'], ['responses', 'Response Volume']].map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setMetric(k)}
              aria-pressed={metric === k}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${
                metric === k ? 'bg-brand text-white' : 'bg-surface-page text-ink-muted hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-surface-line px-3 py-1.5 text-[11px] font-semibold text-ink-muted hover:text-brand"
          >
            ↺ Reset
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[230px_1fr_250px]">
        <div className="max-h-[430px] overflow-y-auto pr-1">
          {geo.map((s) => (
            <button
              key={s.state}
              type="button"
              onClick={() => { setSelected(s.state); onDrill?.(s.state) }}
              className={`flex w-full items-center gap-2 border-b border-surface-line py-2 text-left last:border-0 hover:bg-surface-alt ${
                selected === s.state ? 'bg-brand-tint' : ''
              }`}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-medium text-ink">{s.state}</span>
                <span className="block text-[10px] text-ink-faint">{s.responses} responses</span>
              </span>
              <span className="text-[12px] font-bold" style={{ color: npsColor(s.nps) }}>
                {s.nps >= 0 ? '+' : ''}{s.nps}
              </span>
            </button>
          ))}
        </div>

        <div ref={host} className="h-[430px] w-full rounded-xl" />

        {/* MOM 6.9 — the drill-down: cities and response by product. */}
        <div className="max-h-[430px] overflow-y-auto rounded-xl border border-surface-line p-3.5">
          {detail ? (
            <>
              <p className="text-[13px] font-semibold text-ink">{detail.state}</p>
              <p className="text-[11px] text-ink-faint">
                NPS <span style={{ color: npsColor(detail.nps) }}>{detail.nps >= 0 ? '+' : ''}{detail.nps}</span>
                {' · '}{detail.responses} responses
              </p>

              <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Cities</p>
              {detail.cities.map((c) => (
                <button
                  key={c.city}
                  type="button"
                  onClick={() => onDrill?.(detail.state, c.city)}
                  className="mt-1.5 flex w-full items-center gap-2 rounded px-1 py-0.5 text-[11px] transition-colors hover:bg-surface-alt"
                >
                  <span className="min-w-0 flex-1 truncate text-left text-ink-soft">{c.city}</span>
                  <span className="text-ink-faint">{c.responses}</span>
                  <span className="w-8 text-right font-bold" style={{ color: npsColor(c.nps) }}>
                    {c.nps >= 0 ? '+' : ''}{c.nps}
                  </span>
                </button>
              ))}

              <p className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                Response by product
              </p>
              {detail.byProduct.map((p, i) => (
                <button
                  key={p.loanType}
                  type="button"
                  onClick={() => onDrill?.(detail.state, null, p.loanType)}
                  className="mt-1.5 block w-full text-left"
                >
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: CATEGORICAL[i % CATEGORICAL.length] }} />
                    <span className="min-w-0 flex-1 truncate text-ink-soft">{p.loanType}</span>
                    <span className="text-ink-faint">{p.responses}</span>
                    <span className="w-8 text-right font-bold" style={{ color: npsColor(p.nps) }}>
                      {p.nps >= 0 ? '+' : ''}{p.nps}
                    </span>
                  </div>
                  <span className="mt-1 block h-1 overflow-hidden rounded-full bg-surface-page">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${(p.responses / detail.responses) * 100}%`,
                        background: CATEGORICAL[i % CATEGORICAL.length],
                      }}
                    />
                  </span>
                </button>
              ))}
            </>
          ) : (
            <p className="py-16 text-center text-[11px] text-ink-faint">
              Click a state on the map or in the list to see its cities and product mix.
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-ink-faint">
        <span className="font-semibold text-ink-soft">NPS Legend:</span>
        {NPS_BANDS.map((b) => (
          <span key={b.label} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: b.color }} />
            {b.label}
          </span>
        ))}
      </div>
    </div>
  )
}
