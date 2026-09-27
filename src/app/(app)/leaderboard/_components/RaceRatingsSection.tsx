import { Caption, Heading, Panel } from '@/components/Broadcast'
import type { Race } from '@/payload-types'
import Link from 'next/link'
import { ScrollToEnd } from './ScrollToEnd'

const BAD = '#ff4d4d'
const NORMAL = '#ffcc00'
const GOOD = '#00d26a'

interface RaceRatingsSectionProps {
  races: Pick<Race, 'id' | 'name' | 'round' | 'trackSVGPath' | 'rating'>[]
}

export function RaceRatingsSection({ races }: RaceRatingsSectionProps) {
  if (races.length === 0) return null

  return (
    <Panel className="p-5 sm:p-6">
      <Heading index="02" aside="оценки игроков">
        Рейтинг гонок
      </Heading>

      <ScrollToEnd className="custom-scrollbar flex gap-3 overflow-x-auto pb-3">
        {races.map((race) => {
          const bad = race.rating?.ratingBad ?? 0
          const normal = race.rating?.ratingNormal ?? 0
          const good = race.rating?.ratingGood ?? 0
          const total = bad + normal + good
          // Как на странице итогов: доля хороших минус доля плохих
          const score = Math.round(((good - bad) / total) * 100)
          const verdict = score >= 20 ? GOOD : score <= -20 ? BAD : NORMAL

          return (
            <Link
              key={race.id}
              href={`/predictions?race=${race.id}`}
              className="relative w-44 shrink-0 overflow-hidden border border-white/10 bg-black/40 p-3 transition-colors hover:border-white/30"
            >
              <div className="absolute inset-x-0 top-0 h-1" style={{ background: verdict }} />
              {race.trackSVGPath && (
                <svg
                  viewBox="144 144 512 512"
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-5 -top-3 size-28 opacity-20"
                  fill={verdict}
                >
                  <path d={race.trackSVGPath} />
                </svg>
              )}
              <div className="relative space-y-2">
                <Caption>Этап {race.round}</Caption>
                <div className="line-clamp-2 min-h-10 text-sm font-black uppercase leading-tight">
                  {race.name}
                </div>
                <div
                  className="-skew-x-12 text-3xl font-black italic tabular-nums"
                  style={{ color: verdict }}
                >
                  {score > 0 ? `+${score}` : score}
                </div>
                <div className="flex h-1.5 w-full overflow-hidden bg-white/5">
                  {bad > 0 && <div style={{ width: `${(bad / total) * 100}%`, background: BAD }} />}
                  {normal > 0 && (
                    <div style={{ width: `${(normal / total) * 100}%`, background: NORMAL }} />
                  )}
                  {good > 0 && (
                    <div style={{ width: `${(good / total) * 100}%`, background: GOOD }} />
                  )}
                </div>
                <div className="flex justify-between font-mono text-[10px] uppercase tracking-wider">
                  <span className="flex gap-2">
                    <span style={{ color: BAD }}>{bad}</span>
                    <span style={{ color: NORMAL }}>{normal}</span>
                    <span style={{ color: GOOD }}>{good}</span>
                  </span>
                  <span className="text-muted-foreground">{total} гол.</span>
                </div>
              </div>
            </Link>
          )
        })}
      </ScrollToEnd>
    </Panel>
  )
}
