import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { LeaderboardTable } from '@/components/LeaderboardTable'

export default async function LeaderboardPage() {
  const payload = await getPayload({ config: configPromise })

  const currentYear = new Date().getFullYear()

  // Получаем всех пользователей
  const { docs: users } = await payload.find({
    collection: 'users',
    limit: 1000,
  })

  // Получаем все прогнозы текущего сезона
  const { docs: predictions } = await payload.find({
    collection: 'predictions',
    limit: 10000,
    where: {
      race: {
        exists: true,
      },
    },
    depth: 2,
  })

  // Фильтруем прогнозы только текущего сезона
  const currentSeasonPredictions = predictions.filter((pred) => {
    const race = typeof pred.race === 'object' ? pred.race : null
    return race && race.season === currentYear
  })

  // Подсчитываем статистику для каждого пользователя
  const leaderboardData = users
    .map((user) => {
      const userPredictions = currentSeasonPredictions.filter((pred) => {
        const predUser = typeof pred.user === 'object' ? pred.user : null
        return predUser && predUser.id === user.id
      })

      const totalPoints = userPredictions.reduce((sum, pred) => sum + (pred.points || 0), 0)
      const totalPredictions = userPredictions.length

      // Считаем идеальные прогнозы (15 баллов)
      const perfectPredictions = userPredictions.filter((pred) => pred.points === 15).length

      return {
        id: user.id,
        nickname: user.nickname || user.email,
        chartColor: user.chartColor || '#FFDF2C',
        totalPoints,
        totalPredictions,
        perfectPredictions,
        averagePoints: totalPredictions > 0 ? totalPoints / totalPredictions : 0,
      }
    })
    .filter((data) => data.totalPredictions > 0) // Показываем только тех, кто сделал хотя бы 1 прогноз
    .sort((a, b) => b.totalPoints - a.totalPoints) // Сортируем по убыванию баллов

  return (
    <div className="container py-16">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 relative">
          <div className="inline-block relative">
            <h1 className="text-5xl font-bold mb-2 tracking-tight text-accent uppercase">
              RACE LEADERBOARD
            </h1>
            <div className="h-1 w-full bg-linear-to-r from-accent to-transparent" />
          </div>
          <p className="text-muted-foreground mt-4 text-lg">
            Сезон {currentYear} • {leaderboardData.length}{' '}
            {leaderboardData.length === 1
              ? 'участник'
              : leaderboardData.length < 5
                ? 'участника'
                : 'участников'}
          </p>
        </div>

        {leaderboardData.length === 0 ? (
          <div className="text-center py-16 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground text-lg mb-2 font-bold">ПОКА НЕТ ДАННЫХ</p>
            <p className="text-sm text-muted-foreground">
              Сделайте свой первый прогноз, чтобы попасть в таблицу лидеров
            </p>
          </div>
        ) : (
          <LeaderboardTable data={leaderboardData} />
        )}
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'Таблица лидеров',
  description: 'Таблица лидеров чемпионата по прогнозам Формулы 1',
}
