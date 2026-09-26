import { Card } from '@/components/ui/card'
import type { SeasonRecap } from '@/utilities/seasonRecap/types'

type Entry = SeasonRecap['topRaces'][number]

/** Раскладывает гонки веером: лучшая в центре, остальные поочерёдно по краям */
function fan(entries: Entry[]) {
  const result: Entry[] = []
  entries.forEach((entry, i) => (i % 2 === 1 ? result.unshift(entry) : result.push(entry)))
  return result
}

export function BestRaces({ races }: { races: Entry[] }) {
  if (races.length === 0) return null
  const cards = fan(races)
  const center = cards.indexOf(races[0])

  return (
    <div className="flex items-start justify-center overflow-hidden px-2 pb-8 pt-4">
      {cards.map((entry, index) => {
        const offset = index - center
        const isBest = offset === 0
        // На телефоне веер из трёх лучших, иначе карточки не помещаются
        const isExtra = races.indexOf(entry) >= 3
        return (
          <div
            key={entry.race.id}
            className={`-mx-1 w-24 shrink-0 sm:w-28 2xl:w-32 ${isExtra ? 'hidden sm:block' : ''}`}
            style={{
              transform: `rotate(${offset * 6}deg) translateY(${Math.abs(offset) * 8}px)`,
              zIndex: 10 - Math.abs(offset),
            }}
          >
            <Card
              variant={isBest ? 'yellow-glow' : 'default'}
              corners="cut-corner-sm"
              className="p-0.5"
            >
              <div className="flex aspect-3/4 flex-col items-center justify-between gap-1 p-2">
                <span className="self-start font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                  R{entry.race.round}
                </span>
                {entry.race.trackSVGPath ? (
                  <svg
                    viewBox="144 144 512 512"
                    className={`size-14 sm:size-16 2xl:size-20 ${isBest ? 'text-accent' : 'text-foreground/70'}`}
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d={entry.race.trackSVGPath} />
                  </svg>
                ) : (
                  <span className="text-4xl font-black italic text-foreground/30">
                    {entry.race.round}
                  </span>
                )}
                <span className="line-clamp-2 w-full text-center text-[10px] font-bold uppercase leading-tight">
                  {entry.race.name}
                </span>
              </div>
            </Card>
            <div
              className={`clip-path-cut-corner-xs mx-auto -mt-2 w-fit px-2 py-0.5 text-center font-mono text-xs font-black ${
                isBest ? 'bg-accent text-black' : 'bg-muted text-foreground'
              }`}
            >
              +{entry.points}
            </div>
          </div>
        )
      })}
    </div>
  )
}
