// ---------------------------------------------------------------------------
// Word-cloud placement.
//
// The recognisable "cloud" look comes from Archimedean-spiral placement with
// collision rejection: start each word at the centre and walk it outward along
// a spiral until it lands somewhere nothing else occupies. Words arrive largest
// first, so the big ones take the middle and the tail fills the gaps.
//
// Text is measured from a canvas rather than estimated — a character-count
// approximation is wrong enough at large sizes to produce visible overlaps.
// ---------------------------------------------------------------------------

let ctx
const measure = (text, size, weight) => {
  if (!ctx) ctx = document.createElement('canvas').getContext('2d')
  ctx.font = `${weight} ${size}px Inter, sans-serif`
  return ctx.measureText(text).width
}

const overlaps = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y

/**
 * @param words  [{ text, value, weight 0..1, sentiment }] — any order
 * @returns      the same words with x/y/size/rotate, minus any that would not fit
 */
export function layoutCloud(words, { width, height, minSize = 12, maxSize = 46, padding = 5, rotate = true, centred = false } = {}) {
  const rotateOn = rotate
  const placed = []
  const cx = width / 2
  const cy = height / 2

  for (const w of [...words].sort((a, b) => b.value - a.value)) {
    const size = Math.round(minSize + (maxSize - minSize) * w.weight ** 0.72)
    const weight = w.weight > 0.6 ? 800 : w.weight > 0.32 ? 700 : 600
    // Rotation adds texture but also noise. Off by default now: upright words
    // are quicker to read and the cloud looks calmer.
    const rotate = rotateOn && w.weight < 0.45 && placed.length % 3 === 1 ? -90 : 0
    const tw = measure(w.text, size, weight)
    const box = rotate
      ? { w: size * 1.12 + padding, h: tw + padding }
      : { w: tw + padding, h: size * 1.12 + padding }

    let found = null
    // ~0.35 rad per step over 9 turns: dense enough to find the gaps, cheap
    // enough to lay out a few dozen words in a frame.
    for (let t = 0; t < 1600; t += 1) {
      const angle = t * 0.35
      const radius = 2.2 * angle
      const x = cx + radius * Math.cos(angle) - box.w / 2
      const y = cy + radius * Math.sin(angle) * 0.62 - box.h / 2   // squashed: canvases are wide
      if (x < 0 || y < 0 || x + box.w > width || y + box.h > height) continue
      const candidate = { x, y, w: box.w, h: box.h }
      if (placed.some((p) => overlaps(candidate, p.box))) continue
      found = candidate
      break
    }
    if (!found) continue

    placed.push({
      ...w,
      size,
      fontWeight: weight,
      rotate,
      box: found,
      // SVG text anchors on the baseline, so nudge to the box's optical centre.
      x: rotate ? found.x + box.w / 2 : centred ? found.x + box.w / 2 : found.x,
      y: rotate ? found.y + box.h : found.y + size * 0.86,
      anchor: rotate ? 'start' : centred ? 'middle' : 'start',
    })
  }
  return placed
}
