import { Caption, F1_RED, Fact, PODIUM_COLORS, Panel } from '@/components/Broadcast'
import { TelemetryChart } from '@/components/Broadcast/charts'
import { CountUp } from '@/components/CountUp'
import { Button } from '@/components/ui/button'
import type { SeasonStat, User } from '@/payload-types'
import { formatDecimal } from '@/utilities/plural'
import { IconAlertCircle } from '@tabler/icons-react'
import Link from 'next/link'

interface UserInfoCardProps {
  user: User | null
  seasonStats: SeasonStat | null
  userRank: number | null
  totalUsers: number
}

export function UserInfoCard({ user, seasonStats, userRank, totalUsers }: UserInfoCardProps) {
  if (!user) {
    return (
      <Panel stripe={F1_RED} className="flex h-full items-center p-6">
        <div className="flex w-full flex-col items-center gap-4 text-center">
          <IconAlertCircle className="size-12 text-muted-foreground" />
          <div className="space-y-2">
            <h3 className="-skew-x-6 text-xl font-black uppercase italic">Не авторизован</h3>
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

  const raceHistory = (seasonStats?.raceHistory || [])
    .map((entry) => {
      const race = typeof entry.race === 'object' ? entry.race : null
      return {
        key: race?.id ?? String(entry.id),
        label: race?.name ?? '',
        round: race?.round ?? 0,
        points: entry.points,
      }
    })
    .sort((a, b) => a.round - b.round)
  const lastRacePoints = raceHistory.at(-1)?.points ?? null

  return (
    <Panel stripe={F1_RED} className="h-full p-5">
      {/* Шапка: ник и место, как плашка пилота в трансляции */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <span className="h-9 w-1.5 shrink-0" style={{ background: chartColor }} />
        <div className="min-w-0 flex-1 -skew-x-6 truncate text-xl font-black uppercase italic">
          {nickname}
        </div>
        {position > 0 && (
          <div className="shrink-0 text-right">
            <div
              className="-skew-x-12 text-3xl font-black italic leading-none tabular-nums"
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

      <div className="space-y-1 pt-4">
        <Caption>Очки сезона</Caption>
        <div className="flex items-center gap-3">
          <span className="-skew-x-12 text-6xl font-black italic leading-none tabular-nums text-accent">
            <CountUp value={totalPoints} />
          </span>
          {lastRacePoints != null && lastRacePoints > 0 && (
            <span className="-skew-x-12 bg-[#00d26a]/15 px-2 py-0.5 font-mono text-sm font-bold text-[#00d26a]">
              +{lastRacePoints}
            </span>
          )}
        </div>
      </div>

      {raceHistory.length >= 2 && (
        <div className="pt-4">
          <Caption>Телеметрия сезона</Caption>
          <div className="h-16 pt-1">
            <TelemetryChart data={raceHistory} color={chartColor} compact />
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-px border border-white/10 bg-white/10">
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
