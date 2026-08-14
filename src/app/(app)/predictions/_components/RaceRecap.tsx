import { Card } from '@/components/ui/card'
import type { Race } from '@/payload-types'
import {
  IconClock,
  IconDroplet,
  IconFlame,
  IconStopwatch,
  IconTemperature,
} from '@tabler/icons-react'
import Image from 'next/image'

export function RaceRecap({ recap }: { recap: NonNullable<Race['recap']> }) {
  const fastestDriver = typeof recap.fastestLapDriver === 'object' ? recap.fastestLapDriver : null
  const team = fastestDriver && typeof fastestDriver.team === 'object' ? fastestDriver.team : null
  const photo =
    fastestDriver && typeof fastestDriver.photo === 'object' ? fastestDriver.photo : null

  const teamColor = team?.teamColor
  const bandColor = teamColor ?? '#243042'

  const formatLap = (sec?: number | null) => {
    if (sec == null) return '—'
    const m = Math.floor(sec / 60)
    const s = (sec % 60).toFixed(3).padStart(6, '0')
    return `${m}:${s}`
  }

  const rail: { icon: React.ReactElement; label: string; value: string; tone?: string }[] = [
    {
      icon: <IconClock className="w-4 h-4 text-accent" />,
      label: 'Пит-стопов',
      value: recap.pitStops != null ? String(recap.pitStops) : '—',
    },
    {
      icon: <IconFlame className="w-4 h-4 text-accent" />,
      label: 'Обгонов',
      value: recap.overtakes != null ? String(recap.overtakes) : '—',
    },
    {
      icon: <IconTemperature className="w-4 h-4 text-accent" />,
      label: 'Возд/трасса',
      value:
        recap.weather?.airTemp != null || recap.weather?.trackTemp != null
          ? `${recap.weather?.airTemp ?? '—'}° / ${recap.weather?.trackTemp ?? '—'}°`
          : '—',
    },
    {
      icon: recap.weather?.rainfall ? (
        <IconDroplet className="w-4 h-4 text-sky-400" />
      ) : (
        <IconDroplet className="w-4 h-4 text-emerald-400" />
      ),
      label: 'Погода',
      value: recap.weather?.rainfall ? 'Дождь' : 'Сухо',
      tone: recap.weather?.rainfall ? 'text-sky-400' : 'text-emerald-400',
    },
  ]

  return (
    <Card variant="gray" corners="cut-corner" className="p-1">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="flex items-center gap-2 text-base font-black italic uppercase tracking-wide">
            <span className="inline-block w-3.5 h-0.75 bg-accent" />
            Статистика
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {fastestDriver?.shortName}
          </span>
        </div>

        <Card corners="cut-corner-sm" accentColor={bandColor} className="mb-4">
          <div className="relative overflow-hidden px-5 py-4">
            {photo?.url && (
              <div className="z-50 absolute inset-y-0 right-0 w-1/5 select-none pointer-events-none ">
                <Image
                  src={photo.url}
                  alt={fastestDriver?.name || ''}
                  fill
                  sizes="200px"
                  className="object-cover object-top opacity-70"
                />
              </div>
            )}
            {fastestDriver?.shortName && (
              <span className="absolute -right-2 top-1/2 -translate-y-1/2 text-[120px] leading-none font-black italic text-white/10 select-none pointer-events-none">
                {fastestDriver.shortName}
              </span>
            )}

            <div className="relative">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <IconStopwatch className="w-3.5 h-3.5 text-accent" />
                Быстрейший круг
              </div>
              <div className="mt-1.5 text-5xl font-black italic tabular-nums text-accent [text-shadow:0_0_26px_rgba(255,211,32,0.4)]">
                {formatLap(recap.fastestLapTime)}
              </div>
              {fastestDriver && (
                <div className="mt-2 text-sm font-bold">
                  {fastestDriver.name ?? fastestDriver.shortName}
                  {team && (
                    <span className="italic" style={{ color: teamColor }}>
                      {' · '}
                      {team.name}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/8">
          {rail.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-2 px-4 first:pl-0 last:pr-0"
            >
              <div className="flex items-center gap-1.5">
                {item.icon}
                <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </span>
              </div>
              <div className={`text-2xl font-black italic leading-none ${item.tone ?? ''}`}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
