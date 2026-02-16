'use client'

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface ChartData {
  raceName: string
  round: number
  points: number
  cumulativePoints: number
}

interface PersonalPointsChartProps {
  data: ChartData[]
  chartColor: string
}

export function PersonalPointsChart({ data, chartColor }: PersonalPointsChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Недостаточно данных для графика</p>
      </div>
    )
  }

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: Array<{ value: number }>
    label?: string
  }) => {
    if (!active || !payload || !payload.length) return null

    const entry = data.find((d) => d.raceName === label)

    return (
      <div className="bg-background/95 backdrop-blur-sm border-2 border-accent/20 rounded-lg p-3 shadow-xl">
        <p className="font-bold text-accent mb-1">{label}</p>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: chartColor }} />
            <span className="text-muted-foreground">За гонку:</span>
            <span className="font-bold">+{entry?.points || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-muted" />
            <span className="text-muted-foreground">Всего:</span>
            <span className="font-bold">{payload[0]?.value || 0}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="personalAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
              <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="raceName"
            stroke="#666"
            tick={{ fill: '#888', fontSize: 11 }}
            tickLine={{ stroke: '#444' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            stroke="#666"
            tick={{ fill: '#888', fontSize: 12 }}
            tickLine={{ stroke: '#444' }}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="cumulativePoints"
            stroke={chartColor}
            strokeWidth={2.5}
            fill="url(#personalAreaGradient)"
            dot={{ r: 4, fill: chartColor }}
            activeDot={{ r: 6, fill: chartColor }}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
