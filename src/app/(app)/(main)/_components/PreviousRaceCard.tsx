import { PredictionCard } from '@/components/DriverCard/PredictionCard'
import { Caption, Checkered, F1_RED, PODIUM_COLORS, Panel } from '@/components/Broadcast'
import type { Race, Team, User } from '@/payload-types'
import Image from 'next/image'
import Link from 'next/link'

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

export function PreviousRaceCard({
  race,
  topDrivers,
  topPredictors,
  timeZone,
}: PreviousRaceCardProps) {
  return (
    <Panel className="h-full">
      <Checkered className="opacity-30" />
      <div className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <div className="flex items-center gap-3">
              <span
                className="-skew-x-12 px-2 py-0.5 font-mono text-xs font-black text-white"
                style={{ background: F1_RED }}
              >
                R{race.round}
              </span>
              <Caption>Прошлая гонка</Caption>
            </div>
            <h2 className="-skew-x-6 text-2xl font-black uppercase italic leading-none">
              {race.name}
            </h2>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {new Intl.DateTimeFormat('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                timeZone,
              }).format(new Date(race.raceDate))}
            </div>
          </div>
          {race.countryFlag && typeof race.countryFlag === 'object' && (
            <Image
              width={50}
              height={50}
              alt={race.countryFlag.alt || race.name}
              src={race.countryFlag.url || ''}
              className="shrink-0"
            />
          )}
        </div>

        {/* Подиум гонки */}
        <div className="space-y-2">
          {topDrivers.map(({ name, position, team }) => (
            <PredictionCard
              key={position}
              name={name}
              position={position}
              team={team}
              variant={'colored'}
              size={'sm'}
            />
          ))}
        </div>

        {/* Лучшие прогнозисты гонки — строки таймингтауэра */}
        {topPredictors.length > 0 && (
          <div>
            <Caption>Лучшие прогнозы</Caption>
            <div className="mt-2 divide-y divide-white/5 border border-white/10 bg-black/30">
              {topPredictors.map((predictor) => {
                const user = predictor.user
                return (
                  <div key={predictor.position} className="flex items-center gap-3 px-3 py-2">
                    <span
                      className="-skew-x-12 w-5 text-xl font-black italic tabular-nums"
                      style={{ color: PODIUM_COLORS[predictor.position - 1] }}
                    >
                      {predictor.position}
                    </span>
                    <span
                      className="h-5 w-1 shrink-0"
                      style={{ background: user.chartColor || '#FFDF2C' }}
                    />
                    <Link
                      href={`/user/${user.id}`}
                      className="min-w-0 flex-1 truncate font-black uppercase tracking-wide transition-colors hover:text-accent"
                    >
                      {user.nickname || user.email}
                    </Link>
                    <span className="-skew-x-12 font-black italic tabular-nums text-accent">
                      +{predictor.points}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Panel>
  )
}
