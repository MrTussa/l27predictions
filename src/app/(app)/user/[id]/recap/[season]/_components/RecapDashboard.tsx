import { Nickname } from '@/components/Nickname'
import { Card } from '@/components/ui/card'
import { formatDecimal, plural } from '@/utilities/plural'
import type { BadgeIcon, RecapDriver, RecapTexts, SeasonRecap } from '@/utilities/seasonRecap/types'
import {
  IconAnchor,
  IconBrain,
  IconClock,
  IconCloudRain,
  IconCrown,
  IconDice5,
  IconFlag,
  IconFlame,
  IconGhost2,
  IconHeart,
  IconHourglass,
  IconRocket,
  IconShield,
  IconSkull,
  IconStar,
  IconSword,
  IconTarget,
  IconTrendingUp,
  IconTrophy,
  IconUsers,
  type Icon,
} from '@tabler/icons-react'
import Image from 'next/image'
import type { ReactNode } from 'react'
import { BestRaces } from './BestRaces'
import { AiText, Chip, Pill, SectionTitle, StatTile } from './parts'
import { RecapRadar } from './RecapRadar'

const BADGE_ICON: Record<BadgeIcon, Icon> = {
  trophy: IconTrophy,
  target: IconTarget,
  flame: IconFlame,
  crown: IconCrown,
  ghost: IconGhost2,
  anchor: IconAnchor,
  users: IconUsers,
  clock: IconClock,
  dice: IconDice5,
  rain: IconCloudRain,
  rocket: IconRocket,
  brain: IconBrain,
  skull: IconSkull,
  heart: IconHeart,
  shield: IconShield,
  hourglass: IconHourglass,
}

const SPEC_TITLES = {
  1: 'Пророк побед',
  2: 'Мастер вторых ролей',
  3: 'Знаток бронзы',
} as const

const RED = '#E10600'

type Props = {
  recap: SeasonRecap
  /** null — тексты ещё генерируются */
  texts: RecapTexts | null
  /** Блок с суперлицензией: показываем, когда тексты готовы */
  licence?: ReactNode
}

export function RecapDashboard({ recap, texts, licence }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-2 xl:order-2 xl:col-span-6">
          <Hero recap={recap} texts={texts} />
          <Badges texts={texts} />
          {recap.topRaces.length > 0 && (
            <Card variant="default" corners="cut-corner">
              <div className="px-5">
                <SectionTitle aside="лучшие гонки">Легендарные этапы</SectionTitle>
                <BestRaces races={recap.topRaces} />
              </div>
            </Card>
          )}
          <Traits recap={recap} texts={texts} />
        </div>

        <div className="flex flex-col gap-6 xl:order-1 xl:col-span-3">
          {recap.favorite && (
            <DriverSpotlight
              label="Любимый пилот"
              driver={recap.favorite.driver}
              stats={[
                { value: recap.favorite.picks, label: 'в прогнозах' },
                { value: recap.favorite.podiums, label: 'на подиуме' },
                { value: recap.favorite.exact, label: 'точно' },
              ]}
              comment={texts?.favoriteComment}
            />
          )}
          {recap.nemesis ? (
            <DriverSpotlight
              label="Главный предатель"
              labelColor={RED}
              driver={recap.nemesis.driver}
              stats={[
                { value: recap.nemesis.picks, label: 'ставок' },
                { value: recap.nemesis.misses, label: 'мимо подиума' },
                { value: recap.nemesis.podiums, label: 'на подиуме' },
              ]}
              comment={texts?.nemesisComment}
            />
          ) : (
            <Card variant="default" corners="cut-corner">
              <div className="space-y-3 px-5">
                <Pill color={RED}>Главный предатель</Pill>
                <p className="text-sm italic text-muted-foreground">
                  <AiText text={texts?.nemesisComment} lines={2} />
                </p>
              </div>
            </Card>
          )}
          <Card variant="gray" corners="cut-corner-sm" accentColor="#FFDF2C">
            <div className="space-y-2 px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-accent">
                <IconSword className="size-4" />
                Фирменный артефакт
              </div>
              <p className="text-sm italic text-foreground/90">
                <AiText text={texts?.artifact} />
              </p>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6 xl:order-3 xl:col-span-3">
          <Specializations recap={recap} />
          <Conditions recap={recap} />
          <Roast recap={recap} texts={texts} />
        </div>
      </div>

      {licence}
    </div>
  )
}

type HeroChip = { icon: ReactNode; text: string }

function Hero({ recap, texts }: { recap: SeasonRecap; texts: RecapTexts | null }) {
  const candidates: (HeroChip | false)[] = [
    {
      icon: <IconTrophy className="text-accent" />,
      text: `${recap.points} ${plural(recap.points, ['очко', 'очка', 'очков'])}`,
    },
    {
      icon: <IconTarget className="text-sky-400" />,
      text: `${recap.predictions} из ${recap.racesCompleted} ${plural(recap.racesCompleted, ['гонки', 'гонок', 'гонок'])}`,
    },
    recap.perfect > 0 && {
      icon: <IconStar className="text-green-400" />,
      text: `${recap.perfect} ${plural(recap.perfect, ['идеальный', 'идеальных', 'идеальных'])}`,
    },
    recap.bestStreak > 1 && {
      icon: <IconFlame className="text-orange-400" />,
      text: `серия ${recap.bestStreak}`,
    },
    recap.peakRank !== null && {
      icon: <IconTrendingUp className="text-fuchsia-400" />,
      text: `пик — ${recap.peakRank} место`,
    },
    recap.seasonPredictionPoints > 0 && {
      icon: <IconCrown className="text-accent" />,
      text: `+${recap.seasonPredictionPoints} за сезонный прогноз`,
    },
  ]
  const chips = candidates.filter((chip): chip is HeroChip => !!chip)

  return (
    <Card variant="yellow-glow" corners="cut-corner" className="p-0.5">
      <div className="flex flex-col gap-5 px-5 sm:flex-row sm:items-center">
        <div
          className="clip-path-cut-corner flex h-28 w-28 shrink-0 flex-col items-center justify-center self-center border-2"
          style={{
            borderColor: recap.user.chartColor,
            background: `color-mix(in srgb, ${recap.user.chartColor} 16%, #0a0a0a)`,
          }}
        >
          <span className="text-5xl font-black italic leading-none text-accent">
            {recap.rank ? `P${recap.rank}` : '—'}
          </span>
          <span className="mt-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            из {recap.playersTotal}
          </span>
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Итоги сезона {recap.season}
          </div>
          <h1 className="truncate text-3xl font-black uppercase tracking-wide sm:text-4xl">
            <Nickname effect={recap.user.equippedNicknameEffect}>{recap.user.nickname}</Nickname>
          </h1>
          <p className="text-xl font-black italic uppercase leading-tight text-accent sm:text-2xl">
            <AiText text={texts?.title} />
          </p>
          <p className="border-l-2 border-accent/60 pl-3 text-sm italic text-muted-foreground">
            <AiText text={texts?.tagline} />
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {chips.map((chip) => (
              <Chip key={chip.text}>
                {chip.icon}
                {chip.text}
              </Chip>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

function Badges({ texts }: { texts: RecapTexts | null }) {
  const badges = texts?.badges ?? Array.from({ length: 4 }, () => null)
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {badges.map((badge, i) => {
        const Icon = badge ? BADGE_ICON[badge.icon] : IconTrophy
        return (
          <Card key={badge?.name ?? i} variant="default" corners="cut-corner-sm">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="clip-path-cut-corner-xs flex size-10 shrink-0 items-center justify-center bg-accent/10 text-accent">
                <Icon className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-black uppercase tracking-wide">
                  <AiText text={badge?.name} />
                </div>
                <div className="text-xs text-muted-foreground">
                  <AiText text={badge?.description} />
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

function Traits({ recap, texts }: { recap: SeasonRecap; texts: RecapTexts | null }) {
  const counters = [
    { value: formatDecimal(recap.avgPoints), label: 'очки за гонку' },
    { value: formatDecimal(recap.communityAvgPoints), label: 'у всех в среднем' },
    {
      value: recap.zeroRaces,
      label: plural(recap.zeroRaces, ['гонка без очков', 'гонки без очков', 'гонок без очков']),
    },
    { value: recap.missed, label: plural(recap.missed, ['пропуск', 'пропуска', 'пропусков']) },
  ]

  return (
    <Card variant="default" corners="cut-corner">
      <div className="px-5">
        <SectionTitle
          aside={`${recap.totalPicks} ${plural(recap.totalPicks, ['выбор', 'выбора', 'выборов'])} пилотов`}
        >
          Характеристики
        </SectionTitle>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {counters.map((counter) => (
            <StatTile key={counter.label} value={counter.value} label={counter.label} />
          ))}
        </div>
        <RecapRadar axes={recap.radar} />
        <div className="flex flex-wrap items-center justify-center gap-2 pb-1">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#ff4d4d]">
            Слабости:
          </span>
          {(texts?.weaknesses ?? [undefined, undefined, undefined]).map((weakness, i) => (
            <span
              key={weakness ?? i}
              className="min-w-20 border border-[#ff4d4d]/50 px-2.5 py-0.5 text-center text-[11px] font-bold uppercase tracking-wide"
            >
              <AiText text={weakness} />
            </span>
          ))}
        </div>
      </div>
    </Card>
  )
}

function DriverSpotlight({
  label,
  labelColor,
  driver,
  stats,
  comment,
}: {
  label: string
  labelColor?: string
  driver: RecapDriver
  stats: { value: number; label: string }[]
  comment?: string
}) {
  return (
    <Card corners="cut-corner" accentColor={driver.teamColor} accentPosition="bottom">
      <div className="space-y-3 px-4 pb-2">
        <div className="text-center">
          <Pill color={labelColor}>{label}</Pill>
        </div>
        <div
          className={`clip-path-cut-corner-sm relative w-full overflow-hidden ${
            driver.photoUrl ? 'aspect-4/3 max-h-72' : 'flex h-28 items-center justify-center'
          }`}
          style={{
            background: `radial-gradient(circle at 50% 35%, color-mix(in srgb, ${driver.teamColor} 55%, transparent), #0b0b0b 72%)`,
          }}
        >
          {driver.photoUrl ? (
            <>
              <span
                className="absolute right-2 top-1 text-5xl font-black italic opacity-30"
                style={{ color: driver.teamColor }}
              >
                {driver.shortName}
              </span>
              <Image
                src={driver.photoUrl}
                alt={driver.name}
                fill
                sizes="(max-width: 1280px) 50vw, 25vw"
                className="object-cover object-top"
              />
            </>
          ) : (
            <span className="text-6xl font-black italic" style={{ color: driver.teamColor }}>
              {driver.shortName}
            </span>
          )}
        </div>
        <div className="text-center">
          <div className="text-xl font-black uppercase leading-tight">{driver.name}</div>
          {driver.teamName && (
            <div className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {driver.teamName}
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {stats.map((stat) => (
            <StatTile key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </div>
        <p
          className="border-l-2 py-1 pl-3 text-sm italic text-foreground/85"
          style={{ borderColor: labelColor ?? driver.teamColor }}
        >
          <AiText text={comment} lines={2} />
        </p>
      </div>
    </Card>
  )
}

function Specializations({ recap }: { recap: SeasonRecap }) {
  return (
    <Card variant="default" corners="cut-corner">
      <div className="px-5">
        <SectionTitle aside="точные попадания">Специализации</SectionTitle>
        <div className="space-y-4">
          {recap.positions.map((spec) => (
            <div key={spec.position} className="space-y-2 border-l-2 border-accent pl-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-black uppercase">
                  {SPEC_TITLES[spec.position]} · P{spec.position}
                </span>
                <span className="font-mono text-sm font-black text-accent">
                  {spec.hits}/{spec.attempts}
                </span>
              </div>
              {spec.drivers.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {spec.drivers.map(({ driver, count }) => (
                    <span
                      key={driver.id}
                      className="border-l-[3px] px-2 py-0.5 font-mono text-[11px] font-black"
                      style={{
                        borderColor: driver.teamColor,
                        background: `color-mix(in srgb, ${driver.teamColor} 22%, transparent)`,
                      }}
                    >
                      {driver.shortName}
                      {count > 1 && <span className="text-muted-foreground"> ×{count}</span>}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Ни одного точного попадания</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

function Roast({ recap, texts }: { recap: SeasonRecap; texts: RecapTexts | null }) {
  return (
    <Card corners="cut-corner" accentColor={RED}>
      <div className="px-5">
        <SectionTitle>Посмотри на себя</SectionTitle>
        {recap.moments.length === 0 ? (
          <p className="pb-2 text-sm italic text-muted-foreground">
            Придраться не к чему. Даже подозрительно.
          </p>
        ) : (
          <div className="space-y-2 pb-1">
            {recap.moments.map((moment) => {
              const line = texts?.moments[moment.id]
              return (
                <div key={moment.id} className="border border-border bg-background/50 px-3 py-2">
                  <div className="text-[10px] font-black uppercase tracking-wider text-[#ff4d4d]">
                    <AiText text={line?.label} />
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-bold">{moment.race.name}</span>
                    <span className="shrink-0 font-mono text-xs font-black text-accent">
                      {moment.points === null
                        ? 'нет прогноза'
                        : `${moment.points} ${plural(moment.points, ['очко', 'очка', 'очков'])}`}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs italic text-muted-foreground">
                    <AiText text={line?.comment} />
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}

const RATING = {
  bad: { label: 'Плохая', color: '#ff4d4d' },
  normal: { label: 'Нормальная', color: '#ffcc00' },
  good: { label: 'Хорошая', color: '#00e050' },
} as const

function Conditions({ recap }: { recap: SeasonRecap }) {
  const { weather, grid, ratings } = recap
  if (!weather && !grid && ratings.length === 0) return null

  return (
    <Card variant="default" corners="cut-corner">
      <div className="space-y-4 px-5">
        <SectionTitle>Погода и старт</SectionTitle>

        {weather && (
          <div className="flex items-start gap-3">
            <IconCloudRain className="mt-0.5 size-5 shrink-0 text-sky-400" />
            <div className="text-sm">
              <div className="font-bold">
                В дождь {formatDecimal(weather.wetAvg)} за гонку, в сухую —{' '}
                {formatDecimal(weather.dryAvg)}
              </div>
              <div className="text-xs text-muted-foreground">
                {weather.wetRaces}{' '}
                {plural(weather.wetRaces, ['мокрая гонка', 'мокрые гонки', 'мокрых гонок'])} в
                сезоне
              </div>
            </div>
          </div>
        )}

        {grid && (
          <div className="flex items-start gap-3">
            <IconFlag className="mt-0.5 size-5 shrink-0 text-accent" />
            <div className="space-y-1 text-sm">
              <div className="font-bold">
                Твои пилоты в среднем стартуют с P{formatDecimal(grid.avgGridPosition)}
              </div>
              <div className="text-xs text-muted-foreground">
                Камбэки: {grid.comebackPicks}{' '}
                {plural(grid.comebackPicks, ['ставка', 'ставки', 'ставок'])} на старт с P6 и дальше,
                до подиума доехали {grid.comebackHits}
              </div>
              <div className="text-xs text-muted-foreground">
                Переписал квалификацию: {grid.qualiCopies} из {grid.racesWithGrid}
              </div>
            </div>
          </div>
        )}

        {ratings.length > 0 && (
          <div className="space-y-1.5">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Твои оценки гонок
            </div>
            {ratings.slice(0, 6).map(({ race, rating, points }) => (
              <div key={race.id} className="flex items-center gap-2 text-sm">
                <span
                  className="w-24 shrink-0 border-l-[3px] pl-2 font-mono text-[10px] font-bold uppercase"
                  style={{ borderColor: RATING[rating].color, color: RATING[rating].color }}
                >
                  {RATING[rating].label}
                </span>
                <span className="min-w-0 flex-1 truncate">{race.name}</span>
                <span className="shrink-0 font-mono text-xs font-black text-accent">
                  {points === null ? '—' : `${points} оч.`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
