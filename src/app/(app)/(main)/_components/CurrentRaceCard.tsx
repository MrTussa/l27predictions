import { Caption } from '@/components/Broadcast'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Race } from '@/payload-types'
import { formatDate } from '@/utilities/formatDate'
import { IconClock } from '@tabler/icons-react'
import Image from 'next/image'
import Link from 'next/link'
import { Countdown } from './Countdown'
import { RaceTrackClient } from './RaceTrackClient'

interface CurrentRaceCardProps {
  race: Race
  votedCount: number
  timeZone: string
}

export function CurrentRaceCard({ race, votedCount, timeZone }: CurrentRaceCardProps) {
  const raceDate = formatDate(race.raceDate, timeZone, 'dateTime')

  return (
    <Card variant="yellow-glow" corners="cut-corner" className="h-full">
      <RaceTrackClient svgPath={race.trackSVGPath ?? undefined} />
      <div className="space-y-6 px-6 z-2 flex flex-col justify-between h-full mix-blend-lighten min-h-87.5">
        <div className="flex justify-between gap-4 border-b border-accent/30 pb-4">
          <div className="min-w-0 space-y-2">
            <div className="flex items-center gap-3">
              <span className="clip-path-cut-corner-xs bg-accent px-2 py-0.5 font-mono text-xs font-black text-black">
                R{race.round}
              </span>
              <Caption>Следующая гонка</Caption>
            </div>
            <h2 className="text-2xl font-bold uppercase leading-snug tracking-wide text-accent md:text-3xl">
              {race.name}
            </h2>
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
              <div className="mb-1 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                <IconClock className="size-3.5" />
                До закрытия прогнозов
              </div>
              <Countdown targetDate={race.predictionCloseDate} />
            </div>

            <div className="space-y-2 text-right">
              <div>
                <Caption>Проголосовало</Caption>
                <div className="text-2xl font-black tabular-nums text-accent md:text-3xl">
                  {votedCount}
                </div>
              </div>
              <div>
                <Caption>Старт гонки</Caption>
                <div className="font-mono text-sm font-bold uppercase md:text-base">{raceDate}</div>
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
