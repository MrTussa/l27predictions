import type { RadarAxis } from '@/utilities/seasonRecap/types'

const WIDTH = 420
const HEIGHT = 320
const CX = WIDTH / 2
const CY = HEIGHT / 2
const R = 100

const point = (radius: number, index: number, total: number) => {
  const angle = ((-90 + (360 / total) * index) * Math.PI) / 180
  return { x: CX + radius * Math.cos(angle), y: CY + radius * Math.sin(angle), angle }
}

const polygon = (radii: number[]) =>
  radii
    .map((radius, i) => {
      const { x, y } = point(radius, i, radii.length)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

export function RecapRadar({ axes }: { axes: RadarAxis[] }) {
  const total = axes.length

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="mx-auto w-full max-w-md"
      role="img"
      aria-label={axes.map((axis) => `${axis.label}: ${axis.value}%`).join(', ')}
    >
      {[1, 2, 3].map((ring) => (
        <polygon
          key={ring}
          points={polygon(axes.map(() => (R * ring) / 3))}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
        />
      ))}
      {axes.map((axis, i) => {
        const { x, y } = point(R, i, total)
        return <line key={axis.key} x1={CX} y1={CY} x2={x} y2={y} stroke="rgba(255,255,255,0.12)" />
      })}

      <polygon
        points={polygon(axes.map((axis) => (R * Math.max(axis.value, 3)) / 100))}
        fill="rgba(255,223,44,0.22)"
        stroke="var(--accent)"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {axes.map((axis, i) => {
        const { x, y } = point((R * Math.max(axis.value, 3)) / 100, i, total)
        return <circle key={axis.key} cx={x} cy={y} r={3.5} fill="var(--accent)" />
      })}

      {axes.map((axis, i) => {
        const { x, y, angle } = point(R + 18, i, total)
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        const anchor = Math.abs(cos) < 0.3 ? 'middle' : cos > 0 ? 'start' : 'end'
        const dy = sin < -0.5 ? -14 : sin > 0.5 ? 6 : -4
        return (
          <g key={axis.key} textAnchor={anchor}>
            <text
              x={x}
              y={y + dy}
              className="fill-muted-foreground font-mono text-[11px] font-bold uppercase tracking-wider"
            >
              {axis.label}
            </text>
            <text x={x} y={y + dy + 15} className="fill-accent text-[13px] font-black">
              {axis.value}%
            </text>
          </g>
        )
      })}
    </svg>
  )
}
