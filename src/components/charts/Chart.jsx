import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS, ArcElement, BarController, BarElement, CategoryScale,
  DoughnutController, Filler, Legend, LineController, LineElement, LinearScale,
  PointElement, Tooltip,
} from 'chart.js'

// Controllers as well as elements: registering ArcElement alone still leaves
// Chart.js throwing "doughnut is not a registered controller" at draw time.
ChartJS.register(
  ArcElement, BarController, BarElement, CategoryScale, DoughnutController,
  Filler, Legend, LineController, LineElement, LinearScale, PointElement, Tooltip,
)

/**
 * Thin imperative wrapper. Chart.js owns a canvas, so the instance is created
 * once and destroyed on unmount — re-creating it on every render leaks canvases
 * and throws "Canvas is already in use".
 */
export default function Chart({ type, data, options, height = 200 }) {
  const canvas = useRef(null)
  const chart = useRef(null)

  useEffect(() => {
    if (!canvas.current) return undefined
    chart.current = new ChartJS(canvas.current, { type, data, options })

    // Chart.js lays out once, against whatever the canvas measured at creation.
    // Inside a CSS grid that is often before the cell has its final width, which
    // leaves a doughnut drawn as a dot in the corner. Watch the container and
    // re-flow whenever it actually changes size.
    const host = canvas.current.parentElement
    const ro = new ResizeObserver(() => chart.current?.resize())
    if (host) ro.observe(host)

    return () => {
      ro.disconnect()
      chart.current?.destroy()
      chart.current = null
    }
  }, [type, JSON.stringify(data), JSON.stringify(options)])

  // Chart.js measures the canvas's PARENT. Without an explicit width and
  // position the parent can be zero-wide on first paint inside a grid cell,
  // which renders the doughnuts as a dot and the bars as nothing at all.
  return (
    <div style={{ position: 'relative', height, width: '100%' }}>
      <canvas ref={canvas} />
    </div>
  )
}

/** Shared axis/tooltip styling so every chart in the app reads the same. */
export const baseOptions = (extra = {}) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, ...extra.plugins },
  scales: extra.scales,
  ...extra,
})
