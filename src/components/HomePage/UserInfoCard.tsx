import { Card } from '@/components/ui/card'
import type { SeasonStat, User } from '@/payload-types'
import { IconAlertCircle, IconFlame, IconTrophy } from '@tabler/icons-react'
import Link from 'next/link'

interface UserInfoCardProps {
  user: User | null
  seasonStats: SeasonStat | null
  userRank: number | null
  totalUsers: number
}

export function UserInfoCard({ user, seasonStats, userRank, totalUsers }: UserInfoCardProps) {
  // Если пользователь не авторизован
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
            <Link
              href="/admin/login"
              className="mt-4 px-6 py-2 bg-accent text-background font-bold uppercase tracking-wide hover:bg-accent/90 transition-colors"
            >
              Войти
            </Link>
          </div>
        </div>
      </Card>
    )
  }

  const nickname = user.nickname || user.email
  const chartColor = user.chartColor || '#FFDF2C'
  const totalPoints = seasonStats?.totalPoints || 0
  const currentStreak = seasonStats?.currentStreak || 0
  const bestStreak = seasonStats?.bestStreak || 0
  const position = userRank || 0
  return (
    <Card variant="gray" corners="cut-corner" className="h-full">
      <div className="space-y-6 px-6">
        {/* Заголовок */}
        <div className="border-b border-muted pb-4 flex items-center gap-1">
          <div
            className="w-4 h-4 rounded-full border-2 border-accent"
            style={{ backgroundColor: chartColor }}
          />
          <h2 className="text-lg font-bold uppercase tracking-wide text-accent">{nickname}</h2>
        </div>

        {/* Очки */}
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground uppercase tracking-wider">Очки</div>
          <div className="flex items-baseline gap-2">
            <IconTrophy className="w-5 h-5 text-accent" />
            <span className="text-3xl font-bold text-accent">{totalPoints}</span>
          </div>
        </div>

        {/* Место в таблице */}
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground uppercase tracking-wider">
            Место в таблице
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">#{position}</span>
            <span className="text-sm text-muted-foreground">из {totalUsers}</span>
          </div>
        </div>

        {/* Текущая серия */}
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground uppercase tracking-wider">
            Текущая серия
          </div>
          <div className="flex items-baseline gap-2">
            <IconFlame className="w-5 h-5 text-orange-500" />
            <span className="text-3xl font-bold text-orange-500">{currentStreak}</span>
            <span className="text-sm text-muted-foreground">гонок</span>
          </div>
        </div>

        {/* Лучшая серия */}
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground uppercase tracking-wider">
            Лучшая серия
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{bestStreak}</span>
            <span className="text-sm text-muted-foreground">гонок</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
