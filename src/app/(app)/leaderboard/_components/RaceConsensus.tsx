import { Card } from '@/components/ui/card'
import { Check, X } from 'lucide-react'
import type { RaceConsensus as RaceConsensusData } from '../_lib/getLeaderboardData'

export function RaceConsensus({ consensus }: { consensus: RaceConsensusData }) {
  return (
    <Card variant="default" corners="cut-corner" className="relative overflow-hidden">
      <div className="px-6">
        <div className="mb-5">
          <h2 className="flex items-center gap-2.5 text-xl font-black uppercase tracking-tight">
            <span className="inline-block h-0.75 w-3.5 bg-accent" />
            Народный прогноз
          </h2>
          <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground">
            {consensus.raceName} · учтено прогнозов:{' '}
            <b className="text-foreground/80">{consensus.total}</b>
          </p>
        </div>

        <div className="space-y-2.5">
          {consensus.slots.map((slot) => {
            const team =
              slot.driver && typeof slot.driver.team === 'object' ? slot.driver.team : null
            const color = team?.teamColor ?? '#FFDF2C'

            return (
              <Card
                key={slot.position}
                corners="cut-corner-sm"
                accentColor={color}
                className="h-full"
              >
                <div className="relative overflow-hidden">
                  <span
                    className="pointer-events-none absolute inset-y-0 left-0 z-0 opacity-15"
                    style={{ width: `${slot.pct}%`, background: color }}
                  />

                  <div className="relative z-10 flex items-center gap-3.5 px-4 py-3">
                    <div className="flex w-7 shrink-0 flex-col items-center">
                      <b className="text-2xl font-black italic leading-none tabular-nums text-accent">
                        P{slot.position}
                      </b>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-base font-bold">
                        {slot.driver ? slot.driver.name : '—'}
                      </div>
                      {team?.name && (
                        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {team.name}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 text-right">
                      <div
                        className="text-3xl font-black italic leading-none tabular-nums"
                        style={{ color }}
                      >
                        {slot.pct}%
                      </div>
                      <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                        {slot.count} из {consensus.total}
                      </div>
                    </div>

                    {slot.driver && (
                      <div className="w-12 shrink-0 text-center">
                        <div className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground">
                          Финиш
                        </div>
                        {slot.pickActualPosition != null ? (
                          <div
                            className={`text-xl font-bold leading-none ${
                              slot.hit ? 'text-emerald-400' : 'text-foreground'
                            }`}
                          >
                            P{slot.pickActualPosition}
                          </div>
                        ) : (
                          <div className="mt-0.5 font-bold text-[11px] leading-none text-foreground">
                            вне P3
                          </div>
                        )}
                      </div>
                    )}

                    {slot.driver && (
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                          slot.hit ? 'bg-emerald-500/15' : 'bg-red-500/15'
                        }`}
                      >
                        {slot.hit ? (
                          <Check className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
