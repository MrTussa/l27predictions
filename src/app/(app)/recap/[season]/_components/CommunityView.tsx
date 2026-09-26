import { Nickname } from '@/components/Nickname'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatDecimal, plural } from '@/utilities/plural'
import type { CommunityRecap, RatedRace } from '@/utilities/seasonRecap/buildCommunityRecap'
import type { CommunityTexts } from '@/utilities/seasonRecap/communityTexts'
import type { RecapDriver, RecapRace } from '@/utilities/seasonRecap/types'
import {
  IconAnchor,
  IconAward,
  IconBrain,
  IconCrown,
  IconFlame,
  IconGhost2,
  IconHourglass,
  IconMedal,
  IconStar,
  IconTarget,
  IconThumbDown,
  IconThumbUp,
  IconTrophy,
  IconUsers,
  type Icon,
} from '@tabler/icons-react'
import Link from 'next/link'
import {
  AiText,
  Chip,
  Pill,
  SectionTitle,
} from '../../../user/[id]/recap/[season]/_components/parts'

const NOMINATION_ICON: Record<string, Icon> = {
  champion: IconCrown,
  sniper: IconTarget,
  ironman: IconFlame,
  fan: IconAnchor,
  zeros: IconGhost2,
  ghost: IconHourglass,
  bold: IconBrain,
}

const PODIUM = [
  { icon: IconTrophy, color: '#FFDF2C', order: 'sm:order-2', pad: 'sm:pt-8' },
  { icon: IconMedal, color: '#C2C9D2', order: 'sm:order-1', pad: 'sm:pt-5' },
  { icon: IconAward, color: '#CD6B2C', order: 'sm:order-3', pad: 'sm:pt-4' },
] as const

function Comment({ text, color = 'var(--accent)' }: { text?: string; color?: string }) {
  return (
    <p
      className="border-l-2 py-1 pl-3 text-sm italic text-foreground/85"
      style={{ borderColor: color }}
    >
      <AiText text={text} lines={2} />
    </p>
  )
}

type Props = {
  recap: CommunityRecap
  texts: CommunityTexts | null
  viewerId: string | null
}

export function CommunityView({ recap, texts, viewerId }: Props) {
  const season = recap.season

  return (
    <div className="space-y-8">
      {/* Шапка */}
      <Card variant="yellow-glow" corners="cut-corner" className="p-0.5">
        <div className="flex flex-col gap-4 px-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3 lg:max-w-3xl">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Чемпионат прогнозов L27 · итоги сезона {season}
            </div>
            <h1 className="text-3xl font-black uppercase italic leading-tight tracking-wide sm:text-5xl">
              <AiText text={texts?.headline} />
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              <AiText text={texts?.intro} lines={3} />
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Chip>
                <IconUsers className="text-sky-400" />
                {recap.playersTotal} {plural(recap.playersTotal, ['игрок', 'игрока', 'игроков'])}
              </Chip>
              <Chip>
                <IconTrophy className="text-accent" />
                {recap.racesCompleted} {plural(recap.racesCompleted, ['гонка', 'гонки', 'гонок'])}
              </Chip>
              <Chip>
                <IconTarget className="text-green-400" />
                {recap.predictionsTotal}{' '}
                {plural(recap.predictionsTotal, ['прогноз', 'прогноза', 'прогнозов'])}
              </Chip>
            </div>
          </div>
          {viewerId && (
            <Button asChild className="shrink-0">
              <Link href={`/user/${viewerId}/recap/${season}`} prefetch={false}>
                Мои итоги
              </Link>
            </Button>
          )}
        </div>
      </Card>

      {/* Подиум игроков */}
      {recap.podium.length > 0 && (
        <section>
          <SectionTitle aside="по очкам за гонки">Подиум сезона</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
            {recap.podium.map((row, i) => {
              const cfg = PODIUM[i]
              const PlaceIcon = cfg.icon
              return (
                <div key={row.user.id} className={cfg.order}>
                  <Card corners="cut-corner" accentColor={cfg.color} accentPosition="bottom">
                    <div
                      className={`relative flex flex-col items-center gap-2 overflow-hidden px-4 pb-4 text-center ${cfg.pad}`}
                    >
                      <span className="pointer-events-none absolute -top-4 right-2 select-none text-[120px] font-black italic leading-none text-white/5">
                        {i + 1}
                      </span>
                      <PlaceIcon className="size-8" style={{ color: cfg.color }} />
                      <Link
                        href={`/user/${row.user.id}/recap/${season}`}
                        prefetch={false}
                        className="max-w-full truncate text-2xl font-black uppercase transition-colors hover:text-accent"
                      >
                        <Nickname effect={row.user.equippedNicknameEffect}>
                          {row.user.nickname}
                        </Nickname>
                      </Link>
                      <div
                        className="text-4xl font-black italic tabular-nums"
                        style={{ color: cfg.color }}
                      >
                        {row.points}
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {plural(row.points, ['очко', 'очка', 'очков'])} · идеальных: {row.perfect}
                      </div>
                    </div>
                  </Card>
                </div>
              )
            })}
          </div>
          <div className="mt-4">
            <Comment text={texts?.podiumComment} />
          </div>
        </section>
      )}

      {/* Номинации */}
      <section>
        <SectionTitle aside="по итогам сезона">Номинации</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {recap.nominations.map((nomination) => {
            const NominationIcon = NOMINATION_ICON[nomination.key] ?? IconTrophy
            return (
              <Card key={nomination.key} variant="default" corners="cut-corner">
                <div className="flex h-full flex-col gap-3 px-5">
                  <div className="flex items-center gap-3">
                    <div className="clip-path-cut-corner-xs flex size-10 shrink-0 items-center justify-center bg-accent/10 text-accent">
                      <NominationIcon className="size-6" />
                    </div>
                    <div>
                      <div className="text-sm font-black uppercase tracking-wide">
                        {nomination.title}
                      </div>
                      <div className="text-xs text-muted-foreground">{nomination.description}</div>
                    </div>
                  </div>
                  <Link
                    href={`/user/${nomination.user.id}/recap/${season}`}
                    prefetch={false}
                    className="truncate text-2xl font-black uppercase transition-colors hover:text-accent"
                  >
                    <Nickname effect={nomination.user.equippedNicknameEffect}>
                      {nomination.user.nickname}
                    </Nickname>
                  </Link>
                  <div className="font-mono text-xs font-bold uppercase tracking-wider text-accent">
                    {nomination.value}
                  </div>
                  <p className="mt-auto text-xs italic text-muted-foreground">
                    <AiText text={texts?.nominations[nomination.key]} lines={2} />
                  </p>
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Пилоты */}
      {(recap.driverOfSeason || recap.publicFavorite) && (
        <section>
          <SectionTitle>Пилоты сезона</SectionTitle>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {recap.driverOfSeason && (
              <DriverCard
                label="Пилот сезона"
                driver={recap.driverOfSeason.driver}
                stat={`${recap.driverOfSeason.podiums} ${plural(recap.driverOfSeason.podiums, ['подиум', 'подиума', 'подиумов'])} · ${recap.driverOfSeason.wins} ${plural(recap.driverOfSeason.wins, ['победа', 'победы', 'побед'])}`}
              />
            )}
            {recap.publicFavorite && (
              <DriverCard
                label="Любимец публики"
                driver={recap.publicFavorite.driver}
                stat={`в ${recap.publicFavorite.sharePct}% прогнозов`}
              />
            )}
          </div>
          <div className="mt-4">
            <Comment text={texts?.driverComment} />
          </div>
        </section>
      )}

      {/* Гонки */}
      <section>
        <SectionTitle>Гонки сезона</SectionTitle>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {recap.hardestRace && (
            <RaceCard
              label="Где ошиблись все"
              race={recap.hardestRace.race}
              stat={`${formatDecimal(recap.hardestRace.avg)} очка за прогноз`}
              color="#ff4d4d"
            />
          )}
          {recap.easiestRace && (
            <RaceCard
              label="Самая угадываемая"
              race={recap.easiestRace.race}
              stat={`${formatDecimal(recap.easiestRace.avg)} очка за прогноз`}
              color="#00e050"
            />
          )}
          {recap.bestRatedRace && (
            <RaceCard
              label="Лучшая по оценкам"
              race={recap.bestRatedRace.race}
              stat={votes(recap.bestRatedRace)}
              color="#FFDF2C"
              icon={<IconThumbUp className="size-4" />}
            />
          )}
          {recap.worstRatedRace && (
            <RaceCard
              label="Худшая по оценкам"
              race={recap.worstRatedRace.race}
              stat={votes(recap.worstRatedRace)}
              color="#8b8b9a"
              icon={<IconThumbDown className="size-4" />}
            />
          )}
        </div>
        <div className="mt-4">
          <Comment text={texts?.racesComment} />
        </div>
      </section>

      {/* Народный игрок */}
      {recap.crowd && (
        <Card corners="cut-corner" accentColor="#FFDF2C">
          <div className="flex flex-col gap-3 px-5 md:flex-row md:items-center md:gap-8">
            <div className="shrink-0 space-y-1">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                <IconStar className="size-4 text-accent" />
                Народный игрок
              </div>
              <div className="text-2xl font-black uppercase italic">
                {recap.crowd.points} {plural(recap.crowd.points, ['очко', 'очка', 'очков'])} · P
                {recap.crowd.rank}
              </div>
              <div className="text-xs text-muted-foreground">
                если каждую гонку ставить как большинство
              </div>
            </div>
            <div className="flex-1">
              <Comment text={texts?.crowdComment} />
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

const votes = (row: RatedRace) => `👍 ${row.good} · 😐 ${row.normal} · 👎 ${row.bad}`

function DriverCard({ label, driver, stat }: { label: string; driver: RecapDriver; stat: string }) {
  return (
    <Card corners="cut-corner" accentColor={driver.teamColor}>
      <div className="flex items-center gap-4 px-5">
        <div
          className="clip-path-cut-corner-sm flex h-20 w-24 shrink-0 items-center justify-center text-3xl font-black italic"
          style={{
            color: driver.teamColor,
            background: `radial-gradient(circle at 50% 35%, color-mix(in srgb, ${driver.teamColor} 45%, transparent), #0b0b0b 75%)`,
          }}
        >
          {driver.shortName}
        </div>
        <div className="min-w-0 space-y-1">
          <Pill color={driver.teamColor}>{label}</Pill>
          <div className="truncate text-xl font-black uppercase">{driver.name}</div>
          <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {driver.teamName ? `${driver.teamName} · ` : ''}
            {stat}
          </div>
        </div>
      </div>
    </Card>
  )
}

function RaceCard({
  label,
  race,
  stat,
  color,
  icon,
}: {
  label: string
  race: RecapRace
  stat: string
  color: string
  icon?: React.ReactNode
}) {
  return (
    <Card corners="cut-corner" accentColor={color}>
      <div className="flex items-center gap-4 px-5">
        {race.trackSVGPath && (
          <svg
            viewBox="144 144 512 512"
            className="size-16 shrink-0"
            fill={color}
            aria-hidden="true"
          >
            <path d={race.trackSVGPath} />
          </svg>
        )}
        <div className="min-w-0 space-y-1">
          <div
            className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em]"
            style={{ color }}
          >
            {icon}
            {label}
          </div>
          <div className="font-black uppercase leading-tight">{race.name}</div>
          <div className="text-xs text-muted-foreground">{stat}</div>
        </div>
      </div>
    </Card>
  )
}
