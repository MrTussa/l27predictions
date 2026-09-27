import { PredictionCard } from '@/components/DriverCard/PredictionCard'
import { Caption, PODIUM_COLORS, Panel } from '@/components/Broadcast'
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
    <Panel variant="elevated" className="h-full">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <div className="flex items-center gap-3">
              <span className="clip-path-cut-corner-xs bg-accent px-2 py-0.5 font-mono text-xs font-black text-black">
                R{race.round}
              </span>
              <Caption>Прошлая гонка</Caption>
            </div>
            <h2 className="text-xl font-bold leading-snug">{race.name}</h2>
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
            <div className="clip-path-cut-corner-sm mt-2 divide-y divide-white/5 bg-black/30">
              {topPredictors.map((predictor) => {
                const user = predictor.user
                return (
                  <div key={predictor.position} className="flex items-center gap-3 px-3 py-2">
                    <span
                      className="w-5 text-xl font-black tabular-nums"
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
                      className="min-w-0 flex-1 truncate font-bold uppercase tracking-wide transition-colors hover:text-accent"
                    >
                      {user.nickname || user.email}
                    </Link>
                    <span className="font-black tabular-nums text-accent">+{predictor.points}</span>
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
