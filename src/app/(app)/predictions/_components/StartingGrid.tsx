import { Card } from '@/components/ui/card'
import type { Race } from '@/payload-types'

export function StartingGrid({ grid }: { grid: NonNullable<Race['startingGrid']> }) {
  const rows = [...grid].sort((a, b) => a.position - b.position)

  return (
    <Card variant="gray" corners="cut-corner">
      <div className="px-2">
        <h3 className="text-base font-bold uppercase tracking-wide mb-2 text-center">
          Стартовая решётка
        </h3>
        <div className="max-h-80 overflow-y-auto custom-scrollbar pr-1.5">
          {rows.map((row) => {
            const driver = typeof row.driver === 'object' ? row.driver : null
            return (
              <div
                key={row.id ?? row.position}
                className="flex items-center gap-2 py-0.5 text-sm border-b border-muted/40 last:border-0"
              >
                <span className="text-accent font-bold w-5 text-right tabular-nums shrink-0">
                  {row.position}
                </span>
                <span className="truncate">{driver ? driver.name : '—'}</span>
                {driver?.shortName && (
                  <span className="ml-auto text-xs text-muted-foreground shrink-0">
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
