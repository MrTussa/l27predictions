'use client'

import type { Race } from '@/payload-types'
import { Check } from 'lucide-react'
import { useState } from 'react'
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
  [key: string]: any // nickname: points
}

interface PointsEvolutionChartProps {
  races: Race[]
  usersProgress: UserProgressData[]
}

export function PointsEvolutionChart({ races, usersProgress }: PointsEvolutionChartProps) {
  // Состояние выбранных пользователей (по умолчанию все выбраны)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(
    new Set(usersProgress.map((u) => u.userId)),
  )

  const sortedRaces = [...races].sort((a, b) => a.round - b.round)

  // Фильтруем пользователей для отображения
  const visibleUsers = usersProgress.filter((user) => selectedUsers.has(user.userId))

  // данные для графика
  const chartData: ChartDataPoint[] = sortedRaces.map((race, index) => {
    const dataPoint: ChartDataPoint = {
      raceName: race.name,
      round: race.round,
    }

    visibleUsers.forEach((user) => {
      dataPoint[user.nickname] = user.cumulativePoints[index] || 0
    })

    return dataPoint
  })

  // Переключение выбора пользователя
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

  // Кастомный тултип
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null

    // Находим индекс текущей гонки
    const raceIndex = sortedRaces.findIndex((race) => race.name === label)

    return (
      <div className="bg-background/95 backdrop-blur-sm border-2 border-accent/20 rounded-lg p-4 shadow-xl ">
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
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
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
    <div className="w-full flex gap-6 px-6">
      {/* Левая панель - список пользователей */}
      <div className="w-64 shrink-0 space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Игроки
        </h3>
        <div className="space-y-1">
          {usersProgress.map((user) => {
            const isSelected = selectedUsers.has(user.userId)
            const totalPoints = user.cumulativePoints[user.cumulativePoints.length - 1] || 0

            return (
              <button
                key={user.userId}
                onClick={() => toggleUser(user.userId)}
                className={`w-full flex items-center gap-3 px-3 py-2  border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-background/50 border-accent/30 hover:border-accent/50'
                    : 'bg-muted/20 border-muted/20 hover:bg-muted/30 opacity-50'
                }`}
                style={{
                  borderLeftWidth: '3px',
                  borderLeftColor: isSelected ? user.chartColor : 'transparent',
                }}
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: user.chartColor }}
                />
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium truncate">{user.nickname}</div>
                  <div className="text-xs text-muted-foreground">Всего: {totalPoints}</div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-accent shrink-0" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Правая панель - график */}
      <div className="flex-1 min-w-0">
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

            {/* Линии для выбранных пользователей */}
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
    </div>
  )
}
