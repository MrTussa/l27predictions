import { Nickname } from '@/components/Nickname'
import {
  Caption,
  Checkered,
  F1_RED,
  Heading,
  PANEL,
  PODIUM_COLORS,
  Radio,
  TrackPlate,
} from '@/components/RecapBroadcast'
import { formatDecimal, plural } from '@/utilities/plural'
import type { BadgeIcon, RecapDriver, RecapTexts, SeasonRecap } from '@/utilities/seasonRecap/types'
import {
  IconAnchor,
  IconBrain,
  IconClock,
  IconCloudRain,
  IconCrown,
  IconDice5,
  IconFlame,
  IconGhost2,
  IconHeart,
  IconHourglass,
  IconRocket,
  IconShield,
  IconSkull,
  IconTarget,
  IconTrophy,
  IconUsers,
  type Icon,
} from '@tabler/icons-react'
import Image from 'next/image'
import type { CSSProperties, ReactNode } from 'react'
import { RecapRadar } from './RecapRadar'
import { SeasonTelemetry } from './SeasonTelemetry'

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

const RATING = {
  bad: { label: 'Плохая', color: '#ff4d4d' },
  normal: { label: 'Нормальная', color: '#ffcc00' },
  good: { label: 'Хорошая', color: '#00e050' },
} as const

const pointsLabel = (points: number) => plural(points, ['очко', 'очка', 'очков'])

type Props = {
  recap: SeasonRecap
  texts: RecapTexts
  /** Блок суперлицензии: картинка и кнопки */
  licence: ReactNode
}

export function RecapDashboard({ recap, texts, licence }: Props) {
  const color = recap.user.chartColor
  let section = 0
  const next = () => String(++section).padStart(2, '0')

  return (
    <div className="space-y-12">
      <Hero recap={recap} texts={texts} />
      <Badges texts={texts} />

      {recap.timeline.length > 1 && (
        <section>
          <Heading index={next()} aside="гонка за гонкой">
            Телеметрия сезона
          </Heading>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="border border-white/10 bg-[#15151E] p-4 sm:p-5">
              <SeasonTelemetry timeline={recap.timeline} color={color} />
            </div>
            <div className="grid grid-cols-2 gap-px self-start border border-white/10 bg-white/10 lg:grid-cols-1">
              <Fact label="Пик в таблице" value={recap.peakRank ? `P${recap.peakRank}` : '—'} />
              <Fact
                label="Лучший рывок"
                value={recap.bestClimb ? `+${recap.bestClimb.from - recap.bestClimb.to}` : '—'}
                note={
                  recap.bestClimb
                    ? `${recap.bestClimb.race.name}: P${recap.bestClimb.from} → P${recap.bestClimb.to}`
                    : 'выше не поднимался'
                }
              />
              <Fact
                label="Серия без пропусков"
                value={String(recap.bestStreak)}
                note={plural(recap.bestStreak, ['гонка подряд', 'гонки подряд', 'гонок подряд'])}
              />
              <Fact
                label="За гонку"
                value={formatDecimal(recap.avgPoints)}
                note={`у всех в среднем ${formatDecimal(recap.communityAvgPoints)}`}
                color={recap.avgPoints >= recap.communityAvgPoints ? '#00d26a' : F1_RED}
              />
            </div>
          </div>
        </section>
      )}

      <section>
        <Heading index={next()} aside="на кого ставил">
          Пилоты
        </Heading>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {recap.favorite && (
            <div className="space-y-3">
              <DriverPlate
                label="Любимый пилот"
                driver={recap.favorite.driver}
                stats={[
                  [recap.favorite.picks, 'в прогнозах'],
                  [recap.favorite.podiums, 'на подиуме'],
                  [recap.favorite.exact, 'точно'],
                ]}
              />
              <Radio
                text={texts.favoriteComment}
                from="Инженер"
                color={recap.favorite.driver.teamColor}
              />
            </div>
          )}
          <div className="space-y-3">
            {recap.nemesis && (
              <DriverPlate
                label="Главный предатель"
                labelColor={F1_RED}
                driver={recap.nemesis.driver}
                stats={[
                  [recap.nemesis.picks, 'ставок'],
                  [recap.nemesis.misses, 'мимо подиума'],
                  [recap.nemesis.podiums, 'на подиуме'],
                ]}
              />
            )}
            <Radio text={texts.nemesisComment} from="Инженер" />
          </div>
        </div>
      </section>

      {(recap.topRaces.length > 0 || recap.contrarian) && (
        <section>
          <Heading index={next()} aside="лучшие уикенды">
            Легендарные этапы
          </Heading>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {recap.topRaces.slice(0, 4).map((entry, i) => (
              <TrackPlate
                key={entry.race.id}
                label={i === 0 ? 'Лучшая гонка' : `Этап ${entry.race.round}`}
                race={entry.race}
                value={`+${entry.points}`}
                unit={entry.points === 15 ? 'идеальный подиум' : pointsLabel(entry.points)}
                color={i === 0 ? PODIUM_COLORS[0] : '#ffffff'}
              />
            ))}
          </div>
          {recap.contrarian && <Contrarian contrarian={recap.contrarian} />}
        </section>
      )}

      <section>
        <Heading
          index={next()}
          aside={`${recap.totalPicks} ${plural(recap.totalPicks, ['выбор', 'выбора', 'выборов'])} пилотов`}
        >
          Почерк прогнозиста
        </Heading>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="border border-white/10 bg-[#15151E] p-4">
            <RecapRadar axes={recap.radar} />
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <Caption color="#ff4d4d">Слабости</Caption>
              {texts.weaknesses.map((weakness) => (
                <span
                  key={weakness}
                  className="-skew-x-6 border border-[#ff4d4d]/60 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
                >
                  {weakness}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-px border border-white/10 bg-white/10 sm:grid-cols-4">
              <Fact label="Прогнозов" value={String(recap.predictions)} />
              <Fact label="Без очков" value={String(recap.zeroRaces)} />
              <Fact label="Пропусков" value={String(recap.missed)} />
              <Fact label="Идеальных" value={String(recap.perfect)} color={PODIUM_COLORS[0]} />
            </div>
            <div className="divide-y divide-white/5 border border-white/10 bg-[#15151E]">
              {recap.positions.map((spec) => (
                <div key={spec.position} className="flex items-center gap-4 px-4 py-3">
                  <span
                    className="-skew-x-12 text-3xl font-black italic tabular-nums"
                    style={{ color: PODIUM_COLORS[spec.position - 1] }}
                  >
                    P{spec.position}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-black uppercase">{SPEC_TITLES[spec.position]}</span>
                      <span className="font-mono text-sm font-black tabular-nums text-accent">
                        {spec.hits}/{spec.attempts}
                      </span>
                    </div>
                    {spec.drivers.length > 0 ? (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
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
                      <p className="mt-1 text-xs text-muted-foreground">
                        Ни одного точного попадания
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Conditions index={next()} recap={recap} texts={texts} />

      <section>
        <Heading index={next()} aside="разбор полётов">
          Посмотри на себя
        </Heading>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
          {recap.moments.length === 0 ? (
            <Radio text="Придраться не к чему. Даже подозрительно." from="Стюарды" />
          ) : (
            <div className="divide-y divide-white/5 self-start border border-white/10 bg-[#15151E]">
              {recap.moments.map((moment, i) => {
                const line = texts.moments[moment.id]
                return (
                  <div
                    key={moment.id}
                    className="grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-1 px-4 py-4 md:grid-cols-[2.5rem_14rem_1fr] md:items-center"
                  >
                    <span className="row-span-2 -skew-x-12 self-start text-3xl font-black italic tabular-nums text-white/25 md:row-span-1 md:self-center">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <div className="font-black uppercase tracking-wide text-[#ff4d4d]">
                        {line?.label}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="truncate text-sm font-bold">{moment.race.name}</span>
                        <span className="shrink-0 font-mono text-[11px] uppercase text-accent">
                          {moment.points === null
                            ? 'нет прогноза'
                            : `${moment.points} ${pointsLabel(moment.points)}`}
                        </span>
                      </div>
                    </div>
                    <p className="col-start-2 text-sm italic text-white/70 md:col-start-auto">
                      {line?.comment}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
          <div className="relative self-start overflow-hidden border border-white/10 bg-[#15151E] p-5">
            <div
              className="absolute inset-x-0 top-0 h-1"
              style={{ background: PODIUM_COLORS[0] }}
            />
            <Caption color={PODIUM_COLORS[0]}>Фирменный артефакт</Caption>
            <p className="mt-2 -skew-x-6 text-lg font-black uppercase italic leading-tight">
              {texts.artifact}
            </p>
          </div>
        </div>
      </section>

      <section>
        <Heading index={next()} aside="для чата">
          Суперлицензия
        </Heading>
        {licence}
      </section>

      <Checkered className="opacity-30" />
    </div>
  )
}

function Hero({ recap, texts }: { recap: SeasonRecap; texts: RecapTexts }) {
  const podiumColor = recap.rank && recap.rank <= 3 ? PODIUM_COLORS[recap.rank - 1] : '#fff'
  const stats: [ReactNode, string][] = [
    [recap.points, pointsLabel(recap.points)],
    [`${recap.predictions}/${recap.racesCompleted}`, 'прогнозов'],
    [recap.perfect, plural(recap.perfect, ['идеальный', 'идеальных', 'идеальных'])],
  ]
  if (recap.seasonPredictionPoints > 0) {
    stats.push([`+${recap.seasonPredictionPoints}`, 'за события'])
  }

  return (
    <header className="relative overflow-hidden border border-white/10 bg-[#15151E]">
      <div className="h-2" style={{ background: F1_RED }} />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-10 select-none text-[220px] font-black italic leading-none text-transparent sm:text-[300px]"
        style={{ WebkitTextStroke: '2px rgba(255,255,255,0.07)' } as CSSProperties}
      >
        {String(recap.season).slice(2)}
      </span>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 right-40 hidden h-[500px] w-6 rotate-[20deg] sm:block"
        style={{ background: F1_RED, opacity: 0.85 }}
      />

      <div className="relative flex flex-col gap-6 px-6 py-8 sm:px-10 md:flex-row md:items-center">
        {/* Позиция в чемпионате — как плашка лидера в трансляции */}
        <div
          className="flex shrink-0 items-end gap-3 border-l-8 bg-black/40 px-5 py-4 md:flex-col md:items-start md:gap-0"
          style={{ borderColor: recap.user.chartColor }}
        >
          <span
            className="-skew-x-12 text-7xl font-black italic leading-none tabular-nums sm:text-8xl"
            style={{ color: podiumColor }}
          >
            {recap.rank ? `P${recap.rank}` : '—'}
          </span>
          <span className="pb-1 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground md:pb-0 md:pt-2">
            из {recap.playersTotal}
          </span>
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="-skew-x-12 px-3 py-1 text-sm font-black text-white"
              style={{ background: F1_RED }}
            >
              L27
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Итоги сезона {recap.season}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="h-7 w-1.5 shrink-0" style={{ background: recap.user.chartColor }} />
            <span className="truncate text-2xl font-black uppercase tracking-wide sm:text-3xl">
              <Nickname effect={recap.user.equippedNicknameEffect}>{recap.user.nickname}</Nickname>
            </span>
          </div>
          <h1 className="max-w-4xl -skew-x-6 text-4xl font-black uppercase italic leading-[0.95] tracking-tight text-accent sm:text-6xl">
            {texts.title}
          </h1>
          <p className="max-w-2xl text-base text-white/75">{texts.tagline}</p>
          <div className="flex flex-wrap items-end gap-x-8 gap-y-4 pt-2">
            {stats.map(([value, label]) => (
              <div key={label}>
                <div className="-skew-x-6 text-4xl font-black italic tabular-nums">{value}</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Checkered className="opacity-20" />
    </header>
  )
}

function Badges({ texts }: { texts: RecapTexts }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {texts.badges.map((badge) => {
        const Icon = BADGE_ICON[badge.icon]
        return (
          <div
            key={badge.name}
            className="flex items-center gap-4 border border-white/10 bg-[#15151E] p-3"
          >
            <div
              className="flex size-12 shrink-0 -skew-x-12 items-center justify-center"
              style={{ background: F1_RED }}
            >
              <Icon className="size-6 skew-x-12 text-white" />
            </div>
            <div className="min-w-0">
              <div className="-skew-x-6 truncate font-black uppercase italic tracking-wide">
                {badge.name}
              </div>
              <div className="text-xs text-muted-foreground">{badge.description}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Ячейка с цифрой: подпись, крупное значение, пояснение */
function Fact({
  label,
  value,
  note,
  color,
}: {
  label: string
  value: string
  note?: string
  color?: string
}) {
  return (
    <div className="bg-[#15151E] px-4 py-3">
      <Caption>{label}</Caption>
      <div
        className="-skew-x-12 pt-1 text-3xl font-black italic leading-none tabular-nums"
        style={color ? { color } : undefined}
      >
        {value}
      </div>
      {note && (
        <div className="pt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {note}
        </div>
      )}
    </div>
  )
}

function DriverPlate({
  label,
  labelColor,
  driver,
  stats,
}: {
  label: string
  labelColor?: string
  driver: RecapDriver
  stats: [number, string][]
}) {
  return (
    <div
      className="relative flex min-h-44 overflow-hidden border border-white/10"
      style={{
        background: `linear-gradient(100deg, color-mix(in srgb, ${driver.teamColor} 35%, ${PANEL}) 0%, ${PANEL} 65%)`,
      }}
    >
      <div className="w-2 shrink-0" style={{ background: driver.teamColor }} />
      {driver.photoUrl ? (
        <div className="absolute inset-y-0 right-0 w-2/5 max-w-56">
          <Image
            src={driver.photoUrl}
            alt=""
            fill
            sizes="224px"
            className="object-cover object-top"
            style={{
              maskImage: 'linear-gradient(90deg, transparent, #000 45%)',
              WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 45%)',
            }}
          />
        </div>
      ) : (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-6 right-3 select-none text-8xl font-black italic leading-none text-white/[0.06]"
        >
          {driver.shortName}
        </span>
      )}
      <div
        className={`relative flex min-w-0 flex-1 flex-col justify-between gap-4 p-5 ${
          driver.photoUrl ? 'pr-[40%] sm:pr-56' : ''
        }`}
      >
        <div className="min-w-0">
          <Caption color={labelColor ?? driver.teamColor}>{label}</Caption>
          <div className="-skew-x-6 text-2xl font-black uppercase italic leading-tight sm:text-3xl">
            {driver.name}
          </div>
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {driver.teamName ?? '—'}
          </div>
        </div>
        <div className="flex gap-5">
          {stats.map(([value, statLabel]) => (
            <div key={statLabel}>
              <div className="-skew-x-12 text-3xl font-black italic leading-none tabular-nums">
                {value}
              </div>
              <div className="pt-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                {statLabel}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Contrarian({ contrarian }: { contrarian: NonNullable<SeasonRecap['contrarian']> }) {
  const { driver } = contrarian
  return (
    <div
      className="relative mt-4 flex overflow-hidden border border-white/10"
      style={{
        background: `linear-gradient(100deg, color-mix(in srgb, ${driver.teamColor} 30%, ${PANEL}) 0%, ${PANEL} 55%)`,
      }}
    >
      <div className="w-2 shrink-0" style={{ background: driver.teamColor }} />
      <div className="flex flex-1 flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Caption color={PODIUM_COLORS[0]}>Против толпы · самое редкое попадание</Caption>
          <div className="-skew-x-6 text-2xl font-black uppercase italic leading-tight">
            {driver.name} на P{contrarian.position}
          </div>
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {contrarian.race.name} · этап {contrarian.race.round}
          </div>
        </div>
        <div className="shrink-0 sm:text-right">
          <div className="-skew-x-12 text-5xl font-black italic leading-none tabular-nums text-accent">
            {contrarian.sharePct}%
          </div>
          <div className="pt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            игроков поставили так же
          </div>
        </div>
      </div>
    </div>
  )
}

function Conditions({
  index,
  recap,
  texts,
}: {
  index: string
  recap: SeasonRecap
  texts: RecapTexts
}) {
  const { weather, grid, ratings } = recap

  return (
    <section>
      <Heading index={index} aside="трасса и погода">
        Погода и старт
      </Heading>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {weather && (
          <Plate label="Дождь против сухой" color="#38bdf8">
            <div className="space-y-2">
              {(
                [
                  ['Дождь', weather.wetAvg, '#38bdf8'],
                  ['Сухо', weather.dryAvg, '#ffffff'],
                ] as const
              ).map(([label, value, barColor]) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="w-12 font-mono text-[10px] uppercase text-muted-foreground">
                    {label}
                  </span>
                  <div className="h-3 flex-1 bg-white/5">
                    <div
                      className="h-full"
                      style={{ width: `${(value / 15) * 100}%`, background: barColor }}
                    />
                  </div>
                  <span className="w-10 text-right font-black italic tabular-nums">
                    {formatDecimal(value)}
                  </span>
                </div>
              ))}
            </div>
            <Note>
              очков за гонку · {weather.wetRaces}{' '}
              {plural(weather.wetRaces, ['мокрая гонка', 'мокрые гонки', 'мокрых гонок'])}
            </Note>
          </Plate>
        )}
        {grid && (
          <>
            <Plate label="Стартовая позиция твоих пилотов" color={PODIUM_COLORS[0]}>
              <Big>P{formatDecimal(grid.avgGridPosition)}</Big>
              <Note>
                камбэки с P6 и дальше: {grid.comebackHits} из {grid.comebackPicks} доехали до
                подиума
              </Note>
            </Plate>
            <Plate label="Переписал квалификацию" color={F1_RED}>
              <Big>
                {grid.qualiCopies}
                <span className="text-xl text-muted-foreground">/{grid.racesWithGrid}</span>
              </Big>
              <Note>прогнозов совпали с первой тройкой на старте</Note>
            </Plate>
          </>
        )}
      </div>
      <div className="mt-5">
        <Radio text={texts.conditionsComment} from="Метеорадар" color="#38bdf8" />
      </div>
      {ratings.length > 0 && (
        <div className="mt-5">
          <Caption>Твои оценки гонок</Caption>
          <div className="mt-2 grid grid-cols-1 gap-px border border-white/10 bg-white/5 md:grid-cols-2">
            {ratings.map(({ race, rating, points }) => (
              <div key={race.id} className="flex items-center gap-3 bg-[#15151E] px-4 py-2 text-sm">
                <span
                  className="w-24 shrink-0 border-l-[3px] pl-2 font-mono text-[10px] font-bold uppercase"
                  style={{ borderColor: RATING[rating].color, color: RATING[rating].color }}
                >
                  {RATING[rating].label}
                </span>
                <span className="min-w-0 flex-1 truncate font-bold">{race.name}</span>
                <span className="shrink-0 font-mono text-xs font-black text-accent">
                  {points === null ? '—' : `${points} оч.`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function Plate({ label, color, children }: { label: string; color: string; children: ReactNode }) {
  return (
    <div className="relative space-y-3 overflow-hidden border border-white/10 bg-[#15151E] p-4">
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: color }} />
      <Caption color={color}>{label}</Caption>
      {children}
    </div>
  )
}

const Big = ({ children }: { children: ReactNode }) => (
  <div className="-skew-x-12 text-4xl font-black italic leading-none tabular-nums">{children}</div>
)

const Note = ({ children }: { children: ReactNode }) => (
  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
    {children}
  </div>
)
