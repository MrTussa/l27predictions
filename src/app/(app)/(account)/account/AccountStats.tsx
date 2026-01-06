import { Card } from '@/components/ui/card'
import { getServerSideUser } from '@/utilities/getServerSideUser'
import configPromise from '@payload-config'
import { IconChartLine, IconFlame, IconTarget, IconTrophy } from '@tabler/icons-react'
import { getPayload } from 'payload'

export async function AccountStats() {
  const { user } = await getServerSideUser()
  const payload = await getPayload({ config: configPromise })
  const currentYear = new Date().getFullYear()

  if (!user) {
    return <div>Не авторизован</div>
  }

  const { docs: seasonStats } = await payload.find({
    collection: 'season-stats',
    where: {
      and: [{ user: { equals: user.id } }, { season: { equals: currentYear } }],
    },
    limit: 1,
  })

  const userStats = seasonStats[0]

  const { docs: allStats } = await payload.find({
    collection: 'season-stats',
    where: { season: { equals: currentYear } },
    sort: '-totalPoints',
  })

  const userRank = userStats ? allStats.findIndex((s) => s.id === userStats.id) + 1 : null

  const { docs: userPredictions } = await payload.find({
    collection: 'predictions',
    where: {
      user: { equals: user.id },
    },
    depth: 2,
    limit: 100,
  })

  const stats = [
    {
      label: 'Всего очков',
      value: userStats?.totalPoints || 0,
      icon: IconTrophy,
      color: 'text-accent',
    },
    {
      label: 'Место в таблице',
      value: userRank ? `#${userRank}` : '—',
      icon: IconChartLine,
      color: 'text-blue-500',
    },
    {
      label: 'Идеальных прогнозов',
      value: userStats?.perfectPredictions || 0,
      icon: IconTarget,
      color: 'text-green-500',
    },
    {
      label: 'Текущая серия',
      value: userStats?.currentStreak || 0,
      icon: IconFlame,
      color: 'text-orange-500',
    },
  ]
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tight mb-4">Статистика сезона</h2>
          <p className="text-muted-foreground">
            Ваши результаты за {currentYear} год · Всего прогнозов: {userPredictions.length}
          </p>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} variant="default" corners="cut-corner" className="p-0.5">
            <div className="flex items-center gap-4 p-2">
              <div className={`p-3 rounded-lg bg-background ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* История прогнозов */}
      <Card variant="default" corners="sharp" className="p-0.5">
        <div className="p-2">
          <h3 className="text-xl font-bold uppercase tracking-tight mb-4">История прогнозов</h3>
          {userPredictions.length > 0 ? (
            <div className="space-y-3">
              {userPredictions.slice(0, 5).map((prediction) => {
                const race = typeof prediction.race === 'object' ? prediction.race : null
                return (
                  <div
                    key={prediction.id}
                    className="flex justify-between items-center p-3 rounded-md bg-muted/20"
                  >
                    <div>
                      <p className="font-medium">{race?.name || 'Неизвестная гонка'}</p>
                      <p className="text-sm text-muted-foreground">Этап {race?.round || '—'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-accent">{prediction.points || 0} очков</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">Вы еще не сделали ни одного прогноза</p>
          )}
        </div>
      </Card>
    </div>
  )
}
