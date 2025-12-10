'use client'

import type { Race } from '@/payload-types'
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface UserProgressData {
  userId: string
  nickname: string
  chartColor: string
  pointsByRace: number[]
  cumulativePoints: number[]
}

interface ChartDataPoint {
  raceName: string
  round: number
  [key: string]: any // nickname: points
}

interface PointsEvolutionChartProps {
  races: Race[]
  usersProgress: UserProgressData[]
}

export function PointsEvolutionChart({ races, usersProgress }: PointsEvolutionChartProps) {
  const sortedRaces = [...races].sort((a, b) => a.round - b.round)

  // данные для графика
  const chartData: ChartDataPoint[] = sortedRaces.map((race, index) => {
    const dataPoint: ChartDataPoint = {
      raceName: race.name,
      round: race.round,
    }

    usersProgress.forEach((user) => {
      dataPoint[user.nickname] = user.cumulativePoints[index] || 0
    })

    return dataPoint
  })

  // Кастомная легенда
  const renderLegend = (props: any) => {
    const { payload } = props

    return (
      <div className="flex flex-wrap gap-3 justify-center mt-6">
        {payload.map((entry: any, index: number) => {
          const user = usersProgress[index]
          const totalPoints = user?.cumulativePoints[user.cumulativePoints.length - 1] || 0

          return (
            <div
              key={`legend-${index}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-background/50 border"
              style={{ borderColor: entry.color }}
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-sm font-medium">{entry.value}</span>
              <span className="text-sm text-muted-foreground">Всего: {totalPoints}</span>
            </div>
          )
        })}
      </div>
    )
  }

  // Кастомный тултип
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null

    // Находим индекс текущей гонки
    const raceIndex = sortedRaces.findIndex((race) => race.name === label)

    return (
      <div className="bg-background/95 backdrop-blur-sm border-2 border-accent/20 rounded-lg p-4 shadow-xl">
        <p className="font-bold text-accent mb-2">{label}</p>
        <div className="space-y-1">
          {payload
            .sort((a: any, b: any) => b.value - a.value)
            .map((entry: any, index: number) => {
              const user = usersProgress.find((u) => u.nickname === entry.name)
              const pointsInRace = user?.pointsByRace[raceIndex] || 0

              return (
                <div key={index} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-sm font-medium">{entry.name}</span>
                  </div>
                  <div className="ml-4 text-xs text-muted-foreground">
                    +{pointsInRace} в гонке • Всего: {entry.value}
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="text-center py-16 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground text-lg">Недостаточно данных для графика</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <XAxis
            dataKey="raceName"
            stroke="#666"
            tick={{ fill: '#888', fontSize: 12 }}
            tickLine={{ stroke: '#444' }}
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis
            stroke="#666"
            tick={{ fill: '#888', fontSize: 12 }}
            tickLine={{ stroke: '#444' }}
            label={{
              value: 'Очки',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#888' },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />

          {/* Линии для каждого пользователя */}
          {usersProgress.map((user) => (
            <Line
              key={user.userId}
              type="monotone"
              dataKey={user.nickname}
              stroke={user.chartColor}
              strokeWidth={2.5}
              dot={{ r: 4, fill: user.chartColor }}
              activeDot={{ r: 6, fill: user.chartColor }}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
