import { ACCENT, Caption, CardHeading, NEGATIVE, POSITIVE } from '@/components/Broadcast'
import { Card } from '@/components/ui/card'
import type { Race, User } from '@/payload-types'
import { formatDate } from '@/utilities/formatDate'
import { IconCheck, IconClock, IconX } from '@tabler/icons-react'
import Link from 'next/link'
import type { ReactElement } from 'react'

interface AboutRaceProps {
  race: Race
  isPredictionOpen: boolean
  isPredictionClosed: boolean
  hasUserPrediction: boolean
  recentPredictors: User[]
  timeZone: string
}

export function AboutRace({
  race,
  isPredictionOpen,
  isPredictionClosed,
  hasUserPrediction,
  recentPredictors,
  timeZone,
}: AboutRaceProps) {
  let status: { text: string; icon: ReactElement; color: string } | null = null

  if (isPredictionClosed) {
    status = { text: 'Прогнозы закрыты', icon: <IconX className="size-4" />, color: NEGATIVE }
  } else if (!isPredictionOpen) {
    status = {
      text: 'Прогнозы ещё не открыты',
      icon: <IconClock className="size-4" />,
      color: '#38bdf8',
    }
  } else if (hasUserPrediction) {
    status = { text: 'Вы проголосовали', icon: <IconCheck className="size-4" />, color: POSITIVE }
  } else {
    status = { text: 'Прогнозы открыты', icon: <IconCheck className="size-4" />, color: ACCENT }
  }

  return (
    <Card variant="elevated" corners="cut-corner">
      <div className="space-y-5 px-4">
        <div className="space-y-2 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="clip-path-cut-corner-xs bg-accent px-2 py-0.5 font-mono text-xs font-black text-black">
              R{race.round}
            </span>
            <Caption>Этап {race.round}</Caption>
          </div>
          <h2 className="text-xl font-bold leading-snug">{race.name}</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Caption>Старт гонки</Caption>
            <div className="pt-1 font-bold">{formatDate(race.raceDate, timeZone, 'dateYear')}</div>
            <div className="font-mono text-sm text-muted-foreground">
              {formatDate(race.raceDate, timeZone, 'time')}
            </div>
          </div>
          <div>
            <Caption>Прогнозы до</Caption>
            <div className="pt-1 font-bold">
              {formatDate(race.predictionCloseDate, timeZone, 'date')}
            </div>
            <div className="font-mono text-sm text-muted-foreground">
              {formatDate(race.predictionCloseDate, timeZone, 'time')}
            </div>
          </div>
        </div>

        {status && (
          <div
            className="clip-path-cut-corner-sm flex items-center gap-2 px-3 py-2 text-sm font-bold uppercase tracking-wider"
            style={{
              color: status.color,
              background: `color-mix(in srgb, ${status.color} 14%, transparent)`,
            }}
          >
            {status.icon}
            {status.text}
          </div>
        )}

        {recentPredictors.length > 0 && (
          <div>
            <CardHeading>Недавно проголосовали</CardHeading>
            <div className="clip-path-cut-corner-sm divide-y divide-white/5 bg-black/30">
              {recentPredictors.map((user) => (
                <Link
                  key={user.id}
                  href={`/user/${user.id}`}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-bold transition-colors hover:text-accent"
                >
                  <span
                    className="h-4 w-1 shrink-0"
                    style={{ backgroundColor: user.chartColor || ACCENT }}
                  />
                  <span className="truncate">{user.nickname || user.email}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
