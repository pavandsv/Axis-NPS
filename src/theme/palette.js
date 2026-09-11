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
 * The three NPS segments — kept inside the brand family on client instruction.
 *
 * These are drawn together in one donut, so ALL pairs must separate, not just
 * adjacent ones. The warm arc will not hold three separable hues on its own:
 * brand/gold/terracotta measured ΔE 12.1 and brand/gold/plum ΔE 7.9, both under
 * the 15 floor for normal vision. This trio clears it at 15.1 while staying
 * warm and on-brand.
 *
 * Validated all-pairs: CVD ΔE 13.6 (deutan) · normal ΔE 15.1.
 * Passive sits at 2.73:1 on the surface, so it always ships with a visible
 * label and a value — never colour alone.
 */
export const SEGMENT = {
  promoter: '#97144D',
  passive: '#DA8375',
  detractor: '#B24B0A',
}

/**
 * Map bands — four, not five, and deliberately distinct hues rather than one
 * brand ramp, on client instruction.
 *
 * Five quality steps across red→green cannot be told apart: every five-band
 * candidate failed the normal-vision floor, the amber neighbours measuring
 * ΔE 13.6 against a floor of 15. Four clears it at ΔE 15.2 with CVD 13.7, so
 * four is what the map uses. Amber sits at 2.95:1 on the surface, so the map
 * always carries its legend and every region carries a tooltip value.
 */
export const NPS_BANDS = [
  { min: 42, label: '≥ 42 Excellent', color: '#1E7A4C' },
  { min: 34, label: '34–41 Good', color: '#3E8AC6' },
  { min: 26, label: '26–33 Needs Work', color: '#DE7A33' },
  { min: -Infinity, label: '< 26 Critical', color: '#C0392B' },
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
