import { Heading, PODIUM_COLORS, Panel } from '@/components/Broadcast'
import { CountUp } from '@/components/CountUp'
import { Nickname } from '@/components/Nickname'
import Link from 'next/link'
import type { PodiumEntry } from '../_lib/getLeaderboardData'

// Ступени подиума: центр выше, по краям ниже
const STEP = ['h-28 sm:h-36', 'h-20 sm:h-28', 'h-16 sm:h-20']
const ORDER = ['order-2', 'order-1', 'order-3']

export function SeasonPodium({ entries }: { entries: PodiumEntry[] }) {
  if (entries.length === 0) return null

  return (
    <Panel>
      <Heading index="01" aside={`Сезон ${new Date().getFullYear()} · топ 3`}>
        Подиум сезона
      </Heading>

      <div className="grid grid-cols-3 items-end gap-2 sm:gap-3">
        {entries.slice(0, 3).map((entry, i) => (
          <div key={entry.userId || i} className={`flex min-w-0 flex-col ${ORDER[i]}`}>
            <div className="mb-3 min-w-0 text-center">
              <Link
                href={`/user/${entry.userId}`}
                className="block truncate text-sm font-bold uppercase transition-colors hover:text-accent sm:text-lg"
              >
                <Nickname effect={entry.equippedNicknameEffect}>{entry.nickname}</Nickname>
              </Link>
              <div
                className="text-2xl font-black leading-tight tabular-nums sm:text-3xl"
                style={{ color: PODIUM_COLORS[i] }}
              >
                <CountUp value={entry.totalPoints} />
              </div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground sm:text-[10px]">
                идеальных: {entry.perfectPredictions}
              </div>
            </div>
            <div
              className={`relative flex items-start justify-center overflow-hidden pt-2 ${STEP[i]}`}
              style={{
                background: `linear-gradient(180deg, ${PODIUM_COLORS[i]} 0%, color-mix(in srgb, ${PODIUM_COLORS[i]} 35%, var(--card)) 100%)`,
              }}
            >
              <span className="text-5xl font-black leading-none text-black/80 sm:text-6xl">
                {i + 1}
              </span>
              <div
                className="absolute inset-x-0 bottom-0 h-1.5"
                style={{ background: entry.chartColor }}
              />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}
