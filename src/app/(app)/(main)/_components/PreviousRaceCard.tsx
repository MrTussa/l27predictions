import { PredictionCard } from '@/components/DriverCard/PredictionCard'
import { Card } from '@/components/ui/card'
import type { Race, Team, User } from '@/payload-types'
import { formatDate } from '@/utilities/formatDate'
import { IconFlag, IconTrophy } from '@tabler/icons-react'

interface TopDriver {
  position: number
  name: string
  team: Team
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
  timeZone: string
}

export function PreviousRaceCard({ race, topDrivers, topPredictors, timeZone }: PreviousRaceCardProps) {
  return (
    <Card variant="elevated" corners="cut-corner" className="h-full">
      <div className="space-y-6 px-6">
        {/* Заголовок */}
        <div className="border-b border-muted pb-4">
          <h2 className="text-lg font-bold uppercase tracking-wide text-accent">Прошлая гонка</h2>
        </div>

        {/* Название гонки */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <IconFlag className="w-5 h-5 text-accent mt-1 shrink-0" />
            <div>
              <h3 className="text-xl font-bold">{race.name}</h3>
              <p className="text-xs text-muted-foreground">Раунд {race.round}</p>
            </div>
          </div>
          <div className="flex flex-col items-baseline text-sm text-right text-muted-foreground">
            <span>{formatDate(race.raceDate, timeZone, 'date')}</span>
            <span className="w-full">
              {new Intl.DateTimeFormat('ru-RU', { year: 'numeric', timeZone }).format(new Date(race.raceDate))}
            </span>
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
          <div className="space-y-2">
            {topDrivers.map(({ name, position, team }) => (
              <div key={position}>
                <PredictionCard
                  name={name}
                  position={position}
                  team={team}
                  variant={'colored'}
                  size={'sm'}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Топ 3 голосовавших */}
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <IconTrophy className="w-4 h-4 text-accent" />
            Топ 3 голосовавших
          </div>
          <div className="space-y-3">
            {topPredictors.map((predictor) => {
              const user = predictor.user
              const barColor = user.chartColor || '#FFDF2C'
              const barWidth = Math.round((predictor.points / 15) * 100)

              return (
                <div key={predictor.position} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
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
                          style={{ backgroundColor: barColor }}
                        />
                        <span className="font-medium">{user.nickname || user.email}</span>
                      </div>
                    </div>
                    <span className="text-accent font-bold">{predictor.points} очков</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted/30 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${barWidth}%`, backgroundColor: barColor }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Card>
  )
}
