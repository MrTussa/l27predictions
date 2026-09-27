import { Caption, Fact, PODIUM_COLORS, Panel } from '@/components/Broadcast'
import { CountUp } from '@/components/CountUp'
import { Button } from '@/components/ui/button'
import type { SeasonStat, User } from '@/payload-types'
import { formatDecimal } from '@/utilities/plural'
import { IconAlertCircle } from '@tabler/icons-react'
import Link from 'next/link'
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
      <Panel variant="gray" className="h-full" bodyClassName="flex items-center py-4">
        <div className="flex w-full flex-col items-center gap-4 text-center">
          <IconAlertCircle className="size-12 text-muted-foreground" />
          <div className="space-y-2">
            <h3 className="text-lg font-bold uppercase tracking-wide">Не авторизован</h3>
            <p className="text-sm text-muted-foreground">
              Войдите в систему, чтобы увидеть свою статистику и участвовать в прогнозах
            </p>
          </div>
          <Button asChild>
            <Link href="/login?redirect=%2F">Войти</Link>
          </Button>
        </div>
      </Panel>
    )
  }

  const nickname = user.nickname || user.email
  const chartColor = user.chartColor || '#FFDF2C'
  const totalPoints = seasonStats?.totalPointsWithSeasonPrediction || 0
  const racePoints = seasonStats?.totalPoints || 0
  const currentStreak = seasonStats?.currentStreak || 0
  const position = userRank || 0
  const predictionsCount = seasonStats?.predictionsCount || 0
  const perfectPredictions = seasonStats?.perfectPredictions || 0
  const averagePoints = predictionsCount > 0 ? racePoints / predictionsCount : 0

  const history = (seasonStats?.raceHistory || [])
    .map((entry) => {
      const race = typeof entry.race === 'object' ? entry.race : null
      return { round: race?.round || 0, points: entry.points, cumulative: entry.cumulativePoints }
    })
    .sort((a, b) => a.round - b.round)
  const lastRacePoints = history.at(-1)?.points ?? null
  const sparklineData = history.map(({ round, cumulative }) => ({ round, points: cumulative }))

  return (
    <Panel variant="gray" className="h-full" bodyClassName="space-y-4">
      {/* Шапка: ник и место */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <div
          className="clip-path-cut-corner-sm flex size-11 shrink-0 items-center justify-center text-lg font-black text-black"
          style={{ backgroundColor: chartColor }}
        >
          {(nickname || 'U')[0].toUpperCase()}
        </div>
        <div className="min-w-0 flex-1 truncate text-xl font-bold uppercase tracking-wider">
          {nickname}
        </div>
        {position > 0 && (
          <div className="shrink-0 text-right">
            <div
              className="text-3xl font-black leading-none tabular-nums"
              style={{ color: PODIUM_COLORS[position - 1] ?? '#fff' }}
            >
              P{position}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              из {totalUsers}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <Caption>Очки сезона</Caption>
        <div className="flex items-center gap-3">
          <span className="text-6xl font-black leading-none tabular-nums text-accent">
            <CountUp value={totalPoints} />
          </span>
          {lastRacePoints != null && lastRacePoints > 0 && (
            <span className="clip-path-cut-corner-xs bg-[#00d26a]/15 px-2 py-0.5 font-mono text-sm font-bold text-[#00d26a]">
              +{lastRacePoints}
            </span>
          )}
        </div>
      </div>

      {sparklineData.length >= 2 && <UserPointsSparkline data={sparklineData} color={chartColor} />}

      <div className="grid grid-cols-2 gap-px border border-white/10 bg-white/10">
        <Fact
          label="Серия"
          value={currentStreak}
          color={currentStreak > 0 ? '#fb923c' : undefined}
          note={currentStreak > 0 ? 'гонок подряд' : 'нет серии'}
        />
        <Fact
          label="Идеальных"
          value={perfectPredictions}
          color={perfectPredictions > 0 ? PODIUM_COLORS[0] : undefined}
          note={`из ${predictionsCount}`}
        />
        <Fact label="Средний" value={formatDecimal(averagePoints)} note="очков за гонку" />
        <Fact label="Прогнозов" value={predictionsCount} note="за сезон" />
      </div>
    </Panel>
  )
}
