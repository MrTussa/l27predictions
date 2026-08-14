import { CountUp } from '@/components/CountUp'
import { Nickname } from '@/components/Nickname'
import { Card } from '@/components/ui/card'
import { Award, Medal, Trophy } from 'lucide-react'
import Link from 'next/link'
import type { PodiumEntry } from '../_lib/getLeaderboardData'

const PODIUM = {
  1: {
    icon: Trophy,
    label: 'Чемпион',
    medal: 'var(--accent, #FFD320)',
    order: 'sm:order-2',
    plinth: 'sm:pt-7 sm:pb-6',
    ghost: 'text-accent/10',
    pts: 'text-4xl',
  },
  2: {
    icon: Medal,
    label: '2 место',
    medal: '#C2C9D2',
    order: 'sm:order-1',
    plinth: 'sm:pt-5 sm:pb-6',
    ghost: 'text-white/6',
    pts: 'text-3xl',
  },
  3: {
    icon: Award,
    label: '3 место',
    medal: '#CD6B2C',
    order: 'sm:order-3',
    plinth: 'sm:pt-4 sm:pb-6',
    ghost: 'text-white/6',
    pts: 'text-3xl',
  },
} as const

export function SeasonPodium({ entries }: { entries: PodiumEntry[] }) {
  if (entries.length === 0) return null

  return (
    <Card variant="default" corners="cut-corner" className="relative overflow-hidden ">
      <div className="px-6">
        <div className="mb-6  flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2.5 text-xl font-black  uppercase tracking-tight">
            <span className="inline-block h-0.75 w-3.5 bg-accent" />
            Подиум сезона
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Сезон {new Date().getFullYear()} · Топ 3
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end">
          {entries.slice(0, 3).map((entry, i) => {
            const place = (i + 1) as 1 | 2 | 3
            const cfg = PODIUM[place]
            const Icon = cfg.icon

            return (
              <div key={entry.userId || i} className={cfg.order}>
                <Card
                  corners="cut-corner-sm"
                  accentColor={cfg.medal}
                  accentPosition="bottom"
                  className="h-full"
                >
                  <div
                    className={`relative flex h-full flex-col items-center gap-2.5 overflow-hidden px-3 py-5 text-center ${cfg.plinth}`}
                  >
                    <span
                      className={`pointer-events-none absolute -top-3.5 right-1 select-none text-[110px] font-black italic leading-none ${cfg.ghost}`}
                    >
                      {place}
                    </span>

                    <div className="relative flex items-center gap-2">
                      <Icon className="h-6 w-6" style={{ color: cfg.medal }} />
                      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                        {cfg.label}
                      </span>
                    </div>

                    <Link
                      href={`/user/${entry.userId}`}
                      className="relative max-w-full truncate font-bold transition-colors hover:text-accent"
                    >
                      <Nickname effect={entry.equippedNicknameEffect}>{entry.nickname}</Nickname>
                    </Link>

                    <div
                      className={`relative font-black italic leading-none tabular-nums text-accent ${cfg.pts}`}
                    >
                      <CountUp value={entry.totalPoints} />
                    </div>

                    <div className="relative inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      <span className="h-1 w-1 rounded-full bg-accent" />
                      идеальных:{' '}
                      <span className="font-bold text-foreground">{entry.perfectPredictions}</span>
                    </div>
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
