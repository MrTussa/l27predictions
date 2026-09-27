import { CardHeading, PODIUM_COLORS } from '@/components/Broadcast'
import { Card } from '@/components/ui/card'
import type { Race } from '@/payload-types'

export function StartingGrid({ grid }: { grid: NonNullable<Race['startingGrid']> }) {
  const rows = [...grid].sort((a, b) => a.position - b.position)

  return (
    <Card variant="gray" corners="cut-corner">
      <div className="px-4">
        <CardHeading>Стартовая решётка</CardHeading>
        <div className="max-h-80 overflow-y-auto custom-scrollbar pr-1.5">
          {rows.map((row) => {
            const driver = typeof row.driver === 'object' ? row.driver : null
            return (
              <div
                key={row.id ?? row.position}
                className="flex items-center gap-2 border-b border-white/5 py-1 text-sm last:border-0"
              >
                <span
                  className="w-6 shrink-0 text-right font-black tabular-nums"
                  style={{ color: PODIUM_COLORS[row.position - 1] ?? 'var(--muted-foreground)' }}
                >
                  {row.position}
                </span>
                <span className="truncate">{driver ? driver.name : '—'}</span>
                {driver?.shortName && (
                  <span className="ml-auto shrink-0 font-mono text-[11px] text-muted-foreground">
                    {driver.shortName}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
