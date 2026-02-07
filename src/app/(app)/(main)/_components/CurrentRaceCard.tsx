import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import RaceTrackVisualization from '@/components/ui/racetrack'
import type { Race } from '@/payload-types'
import { IconClock } from '@tabler/icons-react'
import Image from 'next/image'
import Link from 'next/link'

interface CurrentRaceCardProps {
  race: Race
  votedCount: number
}

export function CurrentRaceCard({ race, votedCount }: CurrentRaceCardProps) {
  const closeDate = new Date(race.predictionCloseDate)
  const raceDate = new Date(race.raceDate)
  const now = new Date()

  // Время до закрытия голосования
  const timeUntilClose = closeDate.getTime() - now.getTime()
  const hoursUntilClose = Math.floor(timeUntilClose / (1000 * 60 * 60))
  const daysUntilClose = Math.floor(hoursUntilClose / 24)

  const formatTimeRemaining = () => {
    if (daysUntilClose > 0) {
      return `${daysUntilClose} д ${hoursUntilClose % 24} ч`
    }
    return `${hoursUntilClose} ч`
  }

  return (
    <Card variant="yellow-glow" corners="cut-corner" className="h-full">
      <RaceTrackVisualization
        className="absolute w-full h-full z-1 -translate-y-6"
        backgroundColor="#141414"
        svgPath={race.trackSVGPath ? race.trackSVGPath : undefined}
      />
      <div className="space-y-6 px-6 z-2 flex flex-col justify-between h-full mix-blend-lighten">
        <div className="border-b border-accent/30 pb-4 flex justify-between">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wide text-accent">{race.name}</h2>
            <p className="text-sm text-muted-foreground mt-1 uppercase tracking-wider">
              {race.round} Раунд
            </p>
          </div>
          {race.countryFlag && typeof race.countryFlag === 'object' && (
            <div>
              <Image
                width={50}
                height={50}
                alt={race.countryFlag.alt || race.name}
                src={race.countryFlag.url || ''}
              />
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-row justify-between">
            <div>
              <div className="text-base text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <IconClock className="w-4 h-4" />
                Осталось
              </div>
              <div className="text-6xl font-bold text-accent">{formatTimeRemaining()}</div>
            </div>

            <div>
              <div className="text-sm tracking-wider text-muted-foreground uppercase text-right">
                <div>Проголосовали</div>
                <div className=" font-bold">{votedCount}</div>
              </div>

              <div className="text-sm text-muted-foreground uppercase tracking-wider text-right">
                <div>Начало гонки</div>
                <div className="text-lg font-bold">
                  {raceDate.toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="pt-4">
            <Button asChild className="w-full" size="lg">
              <Link href={`/predictions/${race.id}`}>Сделать прогноз</Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
