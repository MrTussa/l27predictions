import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Race } from '@/payload-types'
import { formatDate } from '@/utilities/formatDate'
import { IconClock } from '@tabler/icons-react'
import Image from 'next/image'
import Link from 'next/link'
import { RaceTrackClient } from './RaceTrackClient'

interface CurrentRaceCardProps {
  race: Race
  votedCount: number
  timeZone: string
}

export function CurrentRaceCard({ race, votedCount, timeZone }: CurrentRaceCardProps) {
  const closeDate = new Date(race.predictionCloseDate)
  const raceDate = formatDate(race.raceDate, timeZone, 'dateTime')
  const now = new Date()

  const timeUntilClose = closeDate.getTime() - now.getTime()
  const minutesUntilClose = Math.floor(timeUntilClose / (1000 * 60))
  const hoursUntilClose = Math.floor(timeUntilClose / (1000 * 60 * 60))
  const daysUntilClose = Math.floor(hoursUntilClose / 24)

  return (
    <Card variant="yellow-glow" corners="cut-corner" className="h-full">
      <RaceTrackClient svgPath={race.trackSVGPath ?? undefined} />
      <div className="space-y-6 px-6 z-2 flex flex-col justify-between h-full mix-blend-lighten min-h-87.5">
        <div className="border-b border-accent/30 pb-4 flex justify-between">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wide text-accent">{race.name}</h2>
            <p className="text-sm text-muted-foreground mt-1 uppercase tracking-wider">
              {race.round} Раунд · Следующая гонка
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
                До закрытия прогнозов
              </div>
              <div className="flex flex-row">
                <div className="flex flex-col items-center">
                  <span className="text-3xl md:text-6xl font-bold font-mono text-accent text-shadow-accent text-shadow-[0_0_30px]">
                    {daysUntilClose}
                  </span>
                  <span className="text-muted-foreground">дни</span>
                </div>
                <span className="font-bold font-mono text-muted-foreground text-2xl leading-9 md:text-4xl md:leading-14">
                  {':'}
                </span>
                <div className="flex flex-col items-center">
                  <span className="text-3xl md:text-6xl font-bold font-mono text-accent text-shadow-accent text-shadow-[0_0_30px]">
                    {hoursUntilClose % 24}
                  </span>
                  <span className="text-muted-foreground">часы</span>
                </div>
                <span className="font-bold font-mono text-muted-foreground text-2xl leading-9 md:text-4xl md:leading-14">
                  {':'}
                </span>
                <div className="flex flex-col items-center">
                  <span className="text-3xl md:text-6xl font-bold font-mono text-accent text-shadow-accent text-shadow-[0_0_30px]">
                    {minutesUntilClose % 60}
                  </span>
                  <span className="text-muted-foreground">минуты</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs md:text-sm tracking-wider text-muted-foreground uppercase text-right">
                <div>Проголосовало</div>
                <div className="text-sm md:text-base font-bold font-mono text-accent">
                  {votedCount}
                </div>
              </div>

              <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider text-right">
                <div>Старт гонки</div>
                <div className="text-base md:text-lg font-bold font-mono">{raceDate}</div>
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
