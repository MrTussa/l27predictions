import { F1_RED } from '@/components/RecapBroadcast'
import { plural } from '@/utilities/plural'
import type { SeasonRecap } from '@/utilities/seasonRecap/types'
import type { ReactNode } from 'react'

const MAX_POINTS = 15
const PERFECT = '#FFDF2C'

const height = (points: number) => `${Math.max((points / MAX_POINTS) * 100, 2)}%`

/**
 * Очки по гонкам столбцами, среднее по игрокам — белой чертой,
 * место в таблице — красной линией поверх (чем выше, тем лучше место).
 */
export function SeasonTelemetry({
  timeline,
  color,
}: {
  timeline: SeasonRecap['timeline']
  color: string
}) {
  const worstRank = Math.max(...timeline.map((entry) => entry.rank), 2)
  const rankY = (rank: number) => 6 + ((rank - 1) / (worstRank - 1)) * 88
  const rankLine = timeline
    .map((entry, i) => `${((i + 0.5) / timeline.length) * 100},${rankY(entry.rank)}`)
    .join(' ')

  return (
    <div>
      <div className="relative h-48 border-b border-white/20 sm:h-56">
        {/* Сетка по 5 очков */}
        {[5, 10, 15].map((line) => (
          <div
            key={line}
            className="absolute inset-x-0 border-t border-dashed border-white/[0.07]"
            style={{ bottom: height(line) }}
          >
            <span className="absolute -top-2 left-0 bg-[#15151E] pr-1 font-mono text-[9px] text-white/30">
              {line}
            </span>
          </div>
        ))}

        <div className="absolute inset-0 flex items-end gap-[2px] pl-5 sm:gap-1">
          {timeline.map((entry) => {
            const missed = entry.points === null
            const points = entry.points ?? 0
            const barColor = points === MAX_POINTS ? PERFECT : points === 0 ? F1_RED : color
            return (
              <div
                key={entry.race.id}
                className="group relative flex h-full flex-1 items-end"
                title={`${entry.race.name}: ${
                  missed ? 'нет прогноза' : `${points} ${plural(points, ['очко', 'очка', 'очков'])}`
                } · среднее ${entry.avg} · P${entry.rank} в таблице`}
              >
                {missed ? (
                  <div
                    className="h-full w-full border border-dashed border-white/15"
                    style={{
                      background:
                        'repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0 4px, transparent 4px 8px)',
                    }}
                  />
                ) : (
                  <div
                    className="w-full transition-opacity group-hover:opacity-80"
                    style={{
                      height: height(points),
                      background: `linear-gradient(180deg, ${barColor}, color-mix(in srgb, ${barColor} 45%, transparent))`,
                    }}
                  />
                )}
                <div
                  className="absolute inset-x-0 h-0.5 bg-white/70"
                  style={{ bottom: height(entry.avg) }}
                />
              </div>
            )
          })}
        </div>

        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-y-0 left-5 right-0 h-full w-[calc(100%-1.25rem)]"
        >
          <polyline
            points={rankLine}
            fill="none"
            stroke={F1_RED}
            strokeWidth={2.5}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      <div className="flex gap-[2px] pl-5 pt-1 sm:gap-1">
        {timeline.map((entry) => (
          <span
            key={entry.race.id}
            className="flex-1 text-center font-mono text-[8px] text-white/40 sm:text-[10px]"
          >
            {entry.race.round}
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        <Legend swatch={<span className="size-2.5" style={{ background: color }} />}>
          очки за гонку
        </Legend>
        <Legend swatch={<span className="size-2.5" style={{ background: PERFECT }} />}>
          идеальный подиум
        </Legend>
        <Legend swatch={<span className="size-2.5" style={{ background: F1_RED }} />}>ноль</Legend>
        <Legend swatch={<span className="h-0.5 w-3 bg-white/70" />}>среднее по игрокам</Legend>
        <Legend swatch={<span className="h-0.5 w-3" style={{ background: F1_RED }} />}>
          место в таблице
        </Legend>
      </div>
    </div>
  )
}

function Legend({ swatch, children }: { swatch: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {swatch}
      {children}
    </span>
  )
}
