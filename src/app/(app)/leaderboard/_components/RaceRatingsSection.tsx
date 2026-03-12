import { Card } from '@/components/ui/card'
import type { Race } from '@/payload-types'

interface RaceRatingsSectionProps {
  races: Race[]
}

export function RaceRatingsSection({ races }: RaceRatingsSectionProps) {
  if (races.length === 0) return null

  return (
    <Card variant="default" corners="cut-corner">
      <div className="px-6">
        <h2 className="text-2xl font-bold mb-6 text-accent uppercase tracking-tight">
          Рейтинг гонок
        </h2>

        <div className="flex overflow-x-auto gap-4 pb-4 custom-scrollbar">
          {races.map((race) => {
            const bad = race.rating?.ratingBad ?? 0
            const normal = race.rating?.ratingNormal ?? 0
            const good = race.rating?.ratingGood ?? 0
            const total = bad + normal + good

            const badPct = (bad / total) * 100
            const normalPct = (normal / total) * 100
            const goodPct = (good / total) * 100

            return (
              <div
                key={race.id}
                className="min-w-[175px] max-w-[175px] flex-shrink-0 bg-muted/20 border border-muted/30 rounded p-3 space-y-2"
              >
                {race.trackSVGPath && (
                  <svg
                    viewBox="144 144 512 512"
                    className="w-full h-20"
                    fill="none"
                    stroke="#ffdf2c"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={race.trackSVGPath} />
                  </svg>
                )}

                <p className="text-xs font-bold uppercase truncate">{race.name}</p>

                <div className="h-2 w-full flex rounded-full overflow-hidden">
                  {bad > 0 && <div style={{ width: `${badPct}%`, backgroundColor: '#ef4444' }} />}
                  {normal > 0 && (
                    <div style={{ width: `${normalPct}%`, backgroundColor: '#facc15' }} />
                  )}
                  {good > 0 && <div style={{ width: `${goodPct}%`, backgroundColor: '#22c55e' }} />}
                </div>

                <div className="flex gap-3 text-xs font-medium">
                  <span style={{ color: '#ef4444' }}>{bad}</span>
                  <span style={{ color: '#facc15' }}>{normal}</span>
                  <span style={{ color: '#22c55e' }}>{good}</span>
                </div>

                <p className="text-xs text-muted-foreground">Всего: {total}</p>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
