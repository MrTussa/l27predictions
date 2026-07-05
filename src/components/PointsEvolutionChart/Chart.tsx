'use client'

import type { Race } from '@/payload-types'
import { useMemo, useState } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

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
  [nickname: string]: string | number
}

interface PointsEvolutionChartProps {
  races: Race[]
  usersProgress: UserProgressData[]
}

export function PointsEvolutionChart({ races, usersProgress }: PointsEvolutionChartProps) {
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(
    new Set(usersProgress.map((u) => u.userId)),
  )

  const sortedRaces = useMemo(() => [...races].sort((a, b) => a.round - b.round), [races])

  const visibleUsers = useMemo(
    () => usersProgress.filter((user) => selectedUsers.has(user.userId)),
    [usersProgress, selectedUsers],
  )

  const chartData: ChartDataPoint[] = useMemo(
    () =>
      sortedRaces.map((race, index) => {
        const dataPoint: ChartDataPoint = {
          raceName: race.name,
          round: race.round,
        }

        visibleUsers.forEach((user) => {
          dataPoint[user.nickname] = user.cumulativePoints[index] || 0
        })

        return dataPoint
      }),
    [sortedRaces, visibleUsers],
  )

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(userId)) {
        newSet.delete(userId)
      } else {
        newSet.add(userId)
      }
      return newSet
    })
  }

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: Array<{ name: string; value: number; color: string }>
    label?: string
  }) => {
    if (!active || !payload || !payload.length) return null

    const raceIndex = sortedRaces.findIndex((race) => race.name === label)

    return (
      <div className="bg-background/95 backdrop-blur-sm border-2 border-accent/20 rounded-lg p-4 shadow-xl max-w-48">
        <p className="font-bold text-accent mb-2 truncate">{label}</p>
        <div className="space-y-1">
          {payload
            .sort((a, b) => b.value - a.value)
            .map((entry, index) => {
              const user = usersProgress.find((u) => u.nickname === entry.name)
              const pointsInRace = user?.pointsByRace[raceIndex] || 0

              return (
                <div key={index} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm font-medium truncate">{entry.name}</span>
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
      <div className="text-center py-8 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground text-lg">Недостаточно данных для графика</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4 px-6">
      {/* График */}
      <div className="w-full overflow-x-auto overflow-y-hidden custom-scrollbar">
        <ResponsiveContainer minWidth={'600px'} width="100%" height={550}>
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

            {visibleUsers.map((user) => (
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

      {/* Игроки — компактные чипы под графиком (клик = скрыть/показать линию) */}
      <div className="flex flex-wrap justify-center gap-2">
        {usersProgress.map((user) => {
          const isSelected = selectedUsers.has(user.userId)
          const totalPoints = user.cumulativePoints[user.cumulativePoints.length - 1] || 0

          return (
            <button
              key={user.userId}
              onClick={() => toggleUser(user.userId)}
              className={`clip-path-cut-corner-xs relative cursor-pointer transition-all ${
                isSelected ? '' : 'opacity-40 hover:opacity-70'
              }`}
              style={{ backgroundColor: isSelected ? user.chartColor : 'rgba(255,255,255,0.10)' }}
            >
              <span className="clip-path-cut-corner-xs absolute inset-px bg-card" />
              <span className="relative z-10 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium">
                <span className="max-w-28 truncate">{user.nickname}</span>
                <span className="tabular-nums text-muted-foreground">{totalPoints}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
