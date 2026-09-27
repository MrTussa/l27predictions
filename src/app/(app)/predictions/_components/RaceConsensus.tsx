import { CardHeading, NEGATIVE, POSITIVE } from '@/components/Broadcast'
import { Card } from '@/components/ui/card'
import { IconCheck, IconX } from '@tabler/icons-react'
import type { RaceConsensus as RaceConsensusData } from '../_lib/buildConsensus'

export function RaceConsensus({ consensus }: { consensus: RaceConsensusData }) {
  return (
    <Card variant="gray" corners="cut-corner" className="p-1">
      <div className="px-4">
        <CardHeading
          aside={
            <>
              Прогнозов: <b className="text-foreground/80">{consensus.total}</b>
            </>
          }
        >
          Народный прогноз
        </CardHeading>

        <div className="space-y-2">
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

                  <div className="relative z-10 flex items-center gap-3 px-4 py-2.5">
                    <div className="flex w-7 shrink-0 flex-col items-center">
                      <b className="text-2xl font-black leading-none tabular-nums text-accent">
                        P{slot.position}
                      </b>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-base font-bold">
                        {slot.driver ? slot.driver.name : '—'}
                      </div>
                      {team?.name && (
                        <div className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {team.name}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 text-right">
                      <div
                        className="text-3xl font-black leading-none tabular-nums"
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
                        className="clip-path-cut-corner-xs grid h-7 w-7 shrink-0 place-items-center"
                        style={{
                          color: slot.hit ? POSITIVE : NEGATIVE,
                          background: `color-mix(in srgb, ${slot.hit ? POSITIVE : NEGATIVE} 15%, transparent)`,
                        }}
                      >
                        {slot.hit ? (
                          <IconCheck className="h-4 w-4" />
                        ) : (
                          <IconX className="h-4 w-4" />
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
