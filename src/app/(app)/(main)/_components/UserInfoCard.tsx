import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { SeasonStat, User } from '@/payload-types'
import { IconAlertCircle, IconClock } from '@tabler/icons-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { UserPointsSparkline } from './UserPointsSparkline'

interface UserInfoCardProps {
  user: User | null
  seasonStats: SeasonStat | null
  userRank: number | null
  totalUsers: number
}

export function UserInfoCard({ user, seasonStats, userRank, totalUsers }: UserInfoCardProps) {
  if (!user) {
    return (
      <Card variant="gray" corners="cut-corner" className="h-full">
        <div className="space-y-6 px-6 py-8">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <IconAlertCircle className="w-12 h-12 text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-muted-foreground">Не авторизован</h3>
              <p className="text-sm text-muted-foreground">
                Войдите в систему, чтобы увидеть свою статистику и участвовать в прогнозах
              </p>
            </div>
            <Button asChild>
              <Link href="/login">Войти</Link>
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  const nickname = user.nickname || user.email
  const chartColor = user.chartColor || '#FFDF2C'
  const totalPoints = seasonStats?.totalPoints || 0
  const currentStreak = seasonStats?.currentStreak || 0
  const position = userRank || 0
  const predictionsCount = seasonStats?.predictionsCount || 0
  const perfectPredictions = seasonStats?.perfectPredictions || 0
  const averagePoints = predictionsCount > 0 ? (totalPoints / predictionsCount).toFixed(1) : '0.0'

  const raceHistory = seasonStats?.raceHistory || []
  const lastRacePoints = raceHistory.length > 0 ? raceHistory[raceHistory.length - 1]?.points : null

  const sparklineData = raceHistory
    .map((entry) => {
      const race = typeof entry.race === 'object' ? entry.race : null
      return { round: race?.round || 0, points: entry.cumulativePoints }
    })
    .sort((a, b) => a.round - b.round)

  const firstLetter = (nickname || 'U')[0].toUpperCase()

  return (
    <Card variant="gray" corners="cut-corner" className="h-full">
      <div className="px-5 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className="clip-path-cut-corner-sm shrink-0 w-11 h-11 flex items-center justify-center font-black text-lg text-black"
            style={{ backgroundColor: chartColor }}
          >
            {firstLetter}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black uppercase tracking-wider text-base leading-tight truncate">
              {nickname}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest">
              Профиль гонщика
            </div>
          </div>
          {position > 0 && (
            <div className="clip-path-cut-corner-sm bg-accent text-accent-foreground font-black text-sm px-3 py-2 uppercase tracking-wide shrink-0">
              P{position}
            </div>
          )}
        </div>

        <div className="border-t border-border" />

        {/* Points */}
        <div className="space-y-1.5">
          <div className="text-xs text-muted-foreground uppercase tracking-widest">Очки сезона</div>
          <div className="flex items-center gap-3">
            <span className="text-6xl font-black italic text-accent leading-none">
              {totalPoints}
            </span>
            {lastRacePoints != null && lastRacePoints > 0 && (
              <div className="flex items-center gap-1 bg-[hsl(160_60%_10%)] text-[hsl(160_80%_55%)] text-sm font-bold px-2.5 py-1 rounded-full">
                <IconClock className="w-3.5 h-3.5" />
                <span>+{lastRacePoints}</span>
              </div>
            )}
          </div>
        </div>

        {/* Sparkline */}
        {sparklineData.length >= 2 && (
          <UserPointsSparkline data={sparklineData} color={chartColor} />
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          <StatTile label="Место">
            <span className="text-2xl font-black">#{position}</span>
            <span className="text-sm text-muted-foreground ml-1">/{totalUsers}</span>
          </StatTile>
          <StatTile label="Серия">
            <span className="text-2xl font-black text-orange-400">{currentStreak}</span>
            <span className="text-lg ml-1">🔥</span>
          </StatTile>
          <StatTile label="Идеальных">
            <span className="text-2xl font-black">{perfectPredictions}</span>
            <span className="text-sm text-muted-foreground ml-1.5">из {predictionsCount}</span>
          </StatTile>
          <StatTile label="Средний">
            <span className="text-2xl font-black">{averagePoints}</span>
          </StatTile>
        </div>
      </div>
    </Card>
  )
}

function StatTile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="bg-background/60 border rounded-sm p-3 space-y-1">
      <div className="text-xs text-muted-foreground uppercase tracking-widest">{label}</div>
      <div className="flex items-baseline">{children}</div>
    </div>
  )
}
