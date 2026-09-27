'use client'

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { ChartTooltip, ChartTooltipRow } from './ChartTooltip'

export type RadarAxisPoint = { key: string; label: string; value: number }

const ACCENT = '#FFDF2C'

/** Подпись оси: название и процент под ним */
function AxisTick({
  x,
  y,
  textAnchor,
  payload,
  data,
}: {
  x?: number
  y?: number
  textAnchor?: 'start' | 'middle' | 'end' | 'inherit'
  payload?: { value: string }
  data: RadarAxisPoint[]
}) {
  const axis = data.find((point) => point.label === payload?.value)
  if (!axis || x === undefined || y === undefined) return null
  return (
    <g textAnchor={textAnchor}>
      <text
        x={x}
        y={y}
        fill="rgba(255,255,255,0.55)"
        fontSize={11}
        fontWeight={700}
        style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
      >
        {axis.label}
      </text>
      <text x={x} y={y + 15} fill={ACCENT} fontSize={13} fontWeight={900}>
        {axis.value}%
      </text>
    </g>
  )
}

export function RadarChart({ data }: { data: RadarAxisPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <RechartsRadar
        data={data}
        outerRadius="62%"
        margin={{ top: 10, right: 30, bottom: 20, left: 30 }}
      >
        <PolarGrid stroke="rgba(255,255,255,0.12)" />
        <PolarAngleAxis dataKey="label" tick={<AxisTick data={data} />} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Tooltip
          isAnimationActive={false}
          content={({ active, payload }) => {
            const point = payload?.[0]?.payload as RadarAxisPoint | undefined
            if (!active || !point) return null
            return (
              <ChartTooltip title={point.label} color={ACCENT}>
                <ChartTooltipRow color={ACCENT} label="Показатель" value={`${point.value}%`} />
              </ChartTooltip>
            )
          }}
        />
        <Radar
          dataKey="value"
          stroke={ACCENT}
          strokeWidth={2}
          fill={ACCENT}
          fillOpacity={0.22}
          dot={{ r: 4, fill: ACCENT, strokeWidth: 0 }}
          isAnimationActive={false}
        />
      </RechartsRadar>
    </ResponsiveContainer>
  )
}
