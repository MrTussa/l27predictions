import { Card } from '@/components/ui/card'
import { getServerSideUser } from '@/utilities/getServerSideUser'
import { IconChartLine, IconFlame, IconTarget, IconTrophy } from '@tabler/icons-react'
import { PersonalPointsChart } from './_components/PersonalPointsChart'
import { SeasonPredictionBlock } from './_components/SeasonPredictionBlock'
import { getAccountData } from './_lib/getAccountData'

export async function AccountStats() {
  const { user } = await getServerSideUser()
  const currentYear = new Date().getFullYear()

  if (!user) {
    return <div>Не авторизован</div>
  }

  const { userStats, userRank, userPredictions } = await getAccountData(user.id)

  const totalPointsWithSeason =
    userStats?.totalPointsWithSeasonPrediction || userStats?.totalPoints || 0
  const seasonPoints = userStats?.seasonPredictionPoints || 0
  const chartColor = user.chartColor || '#FFDF2C'

  const chartData =
    userStats?.raceHistory
      ?.map((entry) => {
        const race = typeof entry.race === 'object' ? entry.race : null
        return {
          raceName: race?.name || `Раунд ${race?.round || '?'}`,
          round: race?.round || 0,
          points: entry.points,
          cumulativePoints: entry.cumulativePoints,
        }
      })
      .sort((a, b) => a.round - b.round) || []

  const stats = [
    {
      label: 'Всего очков',
      value: totalPointsWithSeason,
      icon: IconTrophy,
      color: 'text-accent',
      subtitle: seasonPoints > 0 ? `+${seasonPoints} за сезон` : undefined,
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
                {'subtitle' in stat && stat.subtitle && (
                  <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <SeasonPredictionBlock user={user} season={currentYear} />

      {chartData.length >= 2 && (
        <Card variant="default" corners="cut-corner" className="p-0.5">
          <div className="p-2">
            <h3 className="text-xl font-bold uppercase tracking-tight mb-4 px-4">Эволюция очков</h3>
            <PersonalPointsChart data={chartData} chartColor={chartColor} />
          </div>
        </Card>
      )}

      <Card variant="default" corners="sharp" className="p-0.5">
        <div className="p-4">
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
