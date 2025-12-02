import { Card } from '@/components/ui/card'
import { IconTrophy, IconTarget, IconFlame } from '@tabler/icons-react'
import type { User, Prediction } from '@/payload-types'

interface UserInfoCardProps {
  user: User
  allUsers: User[]
  allPredictions: Prediction[]
  currentYear: number
}

export function UserInfoCard({
  user,
  allUsers,
  allPredictions,
  currentYear,
}: UserInfoCardProps) {
  // Фильтруем прогнозы текущего сезона
  const currentSeasonPredictions = allPredictions.filter((pred) => {
    const race = typeof pred.race === 'object' ? pred.race : null
    return race && race.season === currentYear
  })

  // Строим таблицу лидеров
  const leaderboard = allUsers
    .map((u) => {
      const userPredictions = currentSeasonPredictions.filter((pred) => {
        const predUser = typeof pred.user === 'object' ? pred.user : null
        return predUser && predUser.id === u.id
      })
      const totalPoints = userPredictions.reduce((sum, pred) => sum + (pred.points || 0), 0)
      return { id: u.id, totalPoints, totalPredictions: userPredictions.length }
    })
    .filter((data) => data.totalPredictions > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints)

  // Позиция текущего пользователя
  const position = leaderboard.findIndex((u) => u.id === user.id) + 1
  const totalUsers = leaderboard.length

  // Прогнозы текущего пользователя
  const userPredictions = currentSeasonPredictions.filter((pred) => {
    const predUser = typeof pred.user === 'object' ? pred.user : null
    return predUser && predUser.id === user.id
  })

  // Процент успешных прогнозов
  const successfulPredictions = userPredictions.filter((pred) => (pred.points || 0) > 0)
  const successRate =
    userPredictions.length > 0
      ? Math.round((successfulPredictions.length / userPredictions.length) * 100)
      : 0

  // Стрик - используем поле из базы данных
  const streak = user.currentStreak || 0

  // Общее количество прогнозов - используем поле из базы данных
  const totalPredictions = user.totalPredictions || 0

  const nickname = user.nickname || user.email
  const chartColor = user.chartColor || '#FFDF2C'
  return (
    <Card variant="gray" corners="cut-corner" className="h-full">
      <div className="space-y-6">
        {/* Заголовок */}
        <div className="border-b border-muted pb-4">
          <h2 className="text-lg font-bold uppercase tracking-wide text-accent">
            Инфо о пользователе
          </h2>
        </div>

        {/* Ник и цвет */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border-2 border-accent" style={{ backgroundColor: chartColor }} />
            <span className="text-xl font-bold">{nickname}</span>
          </div>
        </div>

        {/* Место в таблице */}
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground uppercase tracking-wider">
            Место в таблице
          </div>
          <div className="flex items-baseline gap-2">
            <IconTrophy className="w-5 h-5 text-accent" />
            <span className="text-3xl font-bold text-accent">#{position}</span>
            <span className="text-sm text-muted-foreground">из {totalUsers}</span>
          </div>
        </div>

        {/* Процент успешных голосов */}
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground uppercase tracking-wider">
            Процент успешных голосов
          </div>
          <div className="flex items-baseline gap-2">
            <IconTarget className="w-5 h-5 text-accent" />
            <span className="text-3xl font-bold">{successRate}%</span>
          </div>
        </div>

        {/* Стрик */}
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground uppercase tracking-wider">
            Стрик (не пропускал ли гонку не зависимо от того неправильно вставил или нет)
          </div>
          <div className="flex items-baseline gap-2">
            <IconFlame className="w-5 h-5 text-orange-500" />
            <span className="text-3xl font-bold text-orange-500">{streak}</span>
            <span className="text-sm text-muted-foreground">гонок подряд</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
