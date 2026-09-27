'use client'

import { ChartTooltip, ChartTooltipRow } from '@/components/Broadcast/ChartTooltip'
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts'

interface SparklineData {
  round: number
  points: number
}

interface UserPointsSparklineProps {
  data: SparklineData[]
  color: string
}

export function UserPointsSparkline({ data, color }: UserPointsSparklineProps) {
  if (data.length < 2) return null

  return (
    <div className="w-full h-15">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            cursor={{ stroke: 'rgba(255,255,255,0.25)', strokeDasharray: '3 3' }}
            isAnimationActive={false}
            content={({ active, payload }) => {
              const point = payload?.[0]?.payload as SparklineData | undefined
              if (!active || !point) return null
              return (
                <ChartTooltip title={`Этап ${point.round}`} color={color}>
                  <ChartTooltipRow color={color} label="Очки за гонки" value={point.points} />
                </ChartTooltip>
              )
            }}
          />
          <Area
            type="monotone"
            dataKey="points"
            stroke={color}
            strokeWidth={2}
            fill="url(#sparklineGradient)"
            dot={false}
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
