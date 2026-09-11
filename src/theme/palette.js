// ---------------------------------------------------------------------------
// Chart palette — Axis Finance brand family.
//
// Measured, not chosen by eye. Every set below was run through the OKLCH/OKLab
// checks: lightness band 0.43–0.77, chroma floor 0.10, adjacent-pair CVD ΔE ≥ 8,
// normal-vision ΔE ≥ 15, and 3:1 against the chart surface.
// ---------------------------------------------------------------------------

export const BRAND = '#97144D'
export const BRAND_DARK = '#6B0E36'
export const BRAND_TINT = '#FDE8EF'

/**
 * Categorical — journeys, channels, portfolios, loan types.
 *
 * The brand leads. The warm arc only holds so many separable hues, so slot 3 is
 * a restrained blue: the plum alternative measured ΔE 9.8 against the brand
 * magenta, below the 15 floor for normal vision — genuinely indistinguishable,
 * not merely similar.
 *
 * Validated adjacent-pair: CVD ΔE 16.8 (deutan) · normal ΔE 18.6 · all ≥ 3:1.
 */
export const CATEGORICAL = ['#97144D', '#B08A00', '#3E8AC6', '#8B3A78', '#C2603A']

export const categorical = (i) => CATEGORICAL[i % CATEGORICAL.length]

/**
 * Sequential ramp in the brand hue, for NPS magnitude on the map and in bands.
 * The light end is #DD99B4 and no paler — below that it falls under the 2:1
 * contrast floor against the page and stops reading as a value at all.
 */
export const NPS_RAMP = ['#DD99B4', '#D07F9F', '#BE5C81', '#AC3A65', '#97144D']

/**
 * The three NPS segments. This is the one place a non-brand hue earns its keep:
 * promoter / passive / detractor is a good–neutral–bad judgement, and a
 * single-hue ramp would turn the dashboard's central distinction into a guess.
 * Muted toward the brand rather than pure traffic-light.
 *
 * Passive sits at 2.1:1 on the surface, so it always ships with a visible
 * label — never colour alone.
 */
export const SEGMENT = {
  promoter: '#2E9E6B',
  passive: '#E8A33D',
  detractor: '#C2185B',
}

/** NPS bands for the map legend — brand ramp, darkest = strongest. */
export const NPS_BANDS = [
  { min: 42, label: '≥ 42 Excellent', color: NPS_RAMP[4] },
  { min: 37, label: '37–41 Good', color: NPS_RAMP[3] },
  { min: 30, label: '30–36 Moderate', color: NPS_RAMP[2] },
  { min: 24, label: '24–29 Needs Work', color: NPS_RAMP[1] },
  { min: -Infinity, label: '< 24 Critical', color: NPS_RAMP[0] },
]

export const npsColor = (n) =>
  (NPS_BANDS.find((b) => n >= b.min) || NPS_BANDS[NPS_BANDS.length - 1]).color

/** Chrome — axis labels, gridlines, surfaces. Recessive by design. */
export const CHROME = {
  grid: '#F0EEF1',
  axis: '#8E8E93',
  textPrimary: '#1D1D1F',
  textSecondary: '#3C3C43',
  textMuted: '#8E8E93',
  surface: '#FFFFFF',
}
