import { Card } from '@/components/ui/card'
import type { Race, User } from '@/payload-types'
import { IconCalendar, IconFlag, IconTrophy } from '@tabler/icons-react'

interface TopDriver {
  position: number
  name: string
}

interface TopPredictor {
  position: number
  user: User
  points: number
}

interface PreviousRaceCardProps {
  race: Race
  topDrivers: TopDriver[]
  topPredictors: TopPredictor[]
}

export function PreviousRaceCard({ race, topDrivers, topPredictors }: PreviousRaceCardProps) {
  const raceDate = new Date(race.raceDate)

  return (
    <Card variant="elevated" corners="cut-corner" className="h-full">
      <div className="space-y-6 px-6 py-8">
        {/* Заголовок */}
        <div className="border-b border-muted pb-4">
          <h2 className="text-lg font-bold uppercase tracking-wide text-accent">Прошлая гонка</h2>
        </div>

        {/* Название гонки */}
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <IconFlag className="w-5 h-5 text-accent mt-1 shrink-0" />
            <div>
              <h3 className="text-xl font-bold">{race.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">Раунд {race.round}</p>
            </div>
          </div>
        </div>

        {/* Флаг страны */}
        {race.countryFlag && typeof race.countryFlag === 'string' && (
          <div className="flex justify-center py-2">
            <div className="text-6xl">{race.countryFlag}</div>
          </div>
        )}

        {/* Топ 3 гонщика */}
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <IconTrophy className="w-4 h-4" />
            Топ 3 водителя
          </div>
          <div className="space-y-2">
            {topDrivers.map((driver) => (
              <div key={driver.position} className="flex items-center gap-3 text-sm">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    driver.position === 1
                      ? 'bg-yellow-500 text-black'
                      : driver.position === 2
                        ? 'bg-gray-400 text-black'
                        : 'bg-orange-700 text-white'
                  }`}
                >
                  {driver.position}
                </div>
                <span className="font-medium">{driver.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Дата завершения */}
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <IconCalendar className="w-4 h-4" />
            Дата завершения
          </div>
          <div className="text-sm font-bold">
            {raceDate.toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>
        </div>

        {/* Топ 3 голосовавших */}
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <IconTrophy className="w-4 h-4 text-accent" />
            Топ 3 голосовавших
          </div>
          <div className="space-y-2">
            {topPredictors.map((predictor) => {
              const user = predictor.user
              return (
                <div key={predictor.position} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        predictor.position === 1
                          ? 'bg-yellow-500 text-black'
                          : predictor.position === 2
                            ? 'bg-gray-400 text-black'
                            : 'bg-orange-700 text-white'
                      }`}
                    >
                      {predictor.position}
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: user.chartColor || '#FFDF2C' }}
                      />
                      <span className="font-medium">{user.nickname || user.email}</span>
                    </div>
                  </div>
                  <span className="text-accent font-bold">{predictor.points} очков</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Card>
  )
}
