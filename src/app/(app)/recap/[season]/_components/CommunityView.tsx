import { Nickname } from '@/components/Nickname'
import { Button } from '@/components/ui/button'
import { formatDecimal, plural } from '@/utilities/plural'
import type { CommunityRecap, RatedRace } from '@/utilities/seasonRecap/buildCommunityRecap'
import type { CommunityTexts } from '@/utilities/seasonRecap/communityTexts'
import type { RecapDriver } from '@/utilities/seasonRecap/types'
import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import {
  Checkered,
  F1_RED,
  Heading,
  PODIUM_COLORS,
  Radio,
  TrackPlate,
} from '@/components/RecapBroadcast'

// Ступени подиума: центр выше, по краям ниже
const PODIUM_STEP = ['sm:h-44', 'sm:h-32', 'sm:h-24']
const PODIUM_ORDER = ['sm:order-2', 'sm:order-1', 'sm:order-3']

type Props = {
  recap: CommunityRecap
  texts: CommunityTexts
  viewerId: string | null
}

export function CommunityView({ recap, texts, viewerId }: Props) {
  const season = recap.season
  const userLink = (id: string) => `/user/${id}/recap/${season}`

  return (
    <div className="space-y-12">
      {/* Шапка */}
      <header className="relative overflow-hidden border border-white/10 bg-[#15151E]">
        <div className="h-2" style={{ background: F1_RED }} />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 -top-10 select-none text-[220px] font-black italic leading-none text-transparent sm:text-[300px]"
          style={{ WebkitTextStroke: '2px rgba(255,255,255,0.07)' } as CSSProperties}
        >
          {String(season).slice(2)}
        </span>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-10 right-40 hidden h-[500px] w-6 rotate-[20deg] sm:block"
          style={{ background: F1_RED, opacity: 0.85 }}
        />
        <div className="relative space-y-5 px-6 py-8 sm:px-10">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="-skew-x-12 px-3 py-1 text-sm font-black text-white"
              style={{ background: F1_RED }}
            >
              L27
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Итоги сезона {season} · {recap.racesCompleted}{' '}
              {plural(recap.racesCompleted, ['гонка', 'гонки', 'гонок'])}
            </span>
          </div>
          <h1 className="max-w-4xl -skew-x-6 text-4xl font-black uppercase italic leading-[0.95] tracking-tight sm:text-6xl">
            {texts.headline}
          </h1>
          <p className="max-w-2xl text-base text-white/75">{texts.intro}</p>
          <div className="flex flex-wrap items-end gap-8 pt-2">
            {[
              [recap.playersTotal, plural(recap.playersTotal, ['игрок', 'игрока', 'игроков'])],
              [
                recap.predictionsTotal,
                plural(recap.predictionsTotal, ['прогноз', 'прогноза', 'прогнозов']),
              ],
              [recap.racesCompleted, plural(recap.racesCompleted, ['гонка', 'гонки', 'гонок'])],
            ].map(([value, label]) => (
              <div key={String(label)}>
                <div className="-skew-x-6 text-4xl font-black italic tabular-nums">{value}</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {label}
                </div>
              </div>
            ))}
            {viewerId && (
              <Button asChild className="ml-auto">
                <Link href={userLink(viewerId)} prefetch={false}>
                  Мои итоги
                </Link>
              </Button>
            )}
          </div>
        </div>
        <Checkered className="opacity-20" />
      </header>

      {/* Подиум */}
      {recap.podium.length > 0 && (
        <section>
          <Heading index="01" aside="очки за гонки">
            Подиум сезона
          </Heading>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end">
            {recap.podium.map((row, i) => (
              <div key={row.user.id} className={`flex flex-col ${PODIUM_ORDER[i]}`}>
                <div className="mb-3 px-2 text-center sm:px-0">
                  <Link
                    href={userLink(row.user.id)}
                    prefetch={false}
                    className="block truncate text-xl font-black uppercase transition-colors hover:text-accent sm:text-2xl"
                  >
                    <Nickname effect={row.user.equippedNicknameEffect}>
                      {row.user.nickname}
                    </Nickname>
                  </Link>
                  <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    {row.points} {plural(row.points, ['очко', 'очка', 'очков'])} · идеальных{' '}
                    {row.perfect}
                  </div>
                </div>
                <div
                  className={`relative flex h-20 items-start justify-center overflow-hidden pt-2 ${PODIUM_STEP[i]}`}
                  style={{
                    background: `linear-gradient(180deg, ${PODIUM_COLORS[i]} 0%, color-mix(in srgb, ${PODIUM_COLORS[i]} 35%, #15151E) 100%)`,
                  }}
                >
                  <span className="-skew-x-12 text-6xl font-black italic leading-none text-black/80">
                    {i + 1}
                  </span>
                  <div
                    className="absolute inset-x-0 bottom-0 h-1.5"
                    style={{ background: row.user.chartColor }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <Radio text={texts.podiumComment} color={PODIUM_COLORS[0]} />
          </div>
        </section>
      )}

      {/* Номинации — строки таймингтауэра */}
      <section>
        <Heading index="02" aside="по итогам сезона">
          Номинации
        </Heading>
        <div className="divide-y divide-white/5 border border-white/10 bg-[#15151E]">
          {recap.nominations.map((nomination, i) => (
            <div
              key={nomination.key}
              className="grid grid-cols-[3rem_1fr] gap-x-4 gap-y-1 px-4 py-4 transition-colors hover:bg-white/[0.03] md:grid-cols-[3rem_16rem_14rem_1fr] md:items-center"
            >
              <span className="row-span-2 -skew-x-12 self-start text-3xl font-black italic tabular-nums text-white/25 md:row-span-1 md:self-center">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <div
                  className="font-black uppercase tracking-wide"
                  style={{ color: i === 0 ? '#FFDF2C' : undefined }}
                >
                  {nomination.title}
                </div>
                <div className="text-xs text-muted-foreground">{nomination.description}</div>
              </div>
              <div className="min-w-0">
                <Link
                  href={userLink(nomination.user.id)}
                  prefetch={false}
                  className="flex items-center gap-2 truncate text-lg font-black uppercase transition-colors hover:text-accent"
                >
                  <span
                    className="h-5 w-1 shrink-0"
                    style={{ background: nomination.user.chartColor }}
                  />
                  <Nickname effect={nomination.user.equippedNicknameEffect}>
                    {nomination.user.nickname}
                  </Nickname>
                </Link>
                <div className="font-mono text-[11px] uppercase tracking-wider text-accent">
                  {nomination.value}
                </div>
              </div>
              <p className="col-start-2 text-sm italic text-white/70 md:col-start-auto">
                {texts.nominations[nomination.key]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Пилоты */}
      {(recap.driverOfSeason || recap.publicFavorite) && (
        <section>
          <Heading index="03">Пилоты сезона</Heading>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {recap.driverOfSeason && (
              <DriverPlate
                label="Пилот сезона"
                driver={recap.driverOfSeason.driver}
                big={recap.driverOfSeason.podiums}
                bigLabel={plural(recap.driverOfSeason.podiums, ['подиум', 'подиума', 'подиумов'])}
                small={`${recap.driverOfSeason.wins} ${plural(recap.driverOfSeason.wins, ['победа', 'победы', 'побед'])}`}
              />
            )}
            {recap.publicFavorite && (
              <DriverPlate
                label="Любимец публики"
                driver={recap.publicFavorite.driver}
                big={`${recap.publicFavorite.sharePct}%`}
                bigLabel="прогнозов"
                small={`${recap.publicFavorite.picks} ${plural(recap.publicFavorite.picks, ['выбор', 'выбора', 'выборов'])}`}
              />
            )}
          </div>
          <div className="mt-5">
            <Radio
              text={texts.driverComment}
              color={recap.driverOfSeason?.driver.teamColor ?? F1_RED}
            />
          </div>
        </section>
      )}

      {/* Гонки */}
      <section>
        <Heading index="04">Гонки сезона</Heading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {recap.hardestRace && (
            <TrackPlate
              label="Где ошиблись все"
              race={recap.hardestRace.race}
              value={formatDecimal(recap.hardestRace.avg)}
              unit="очка за прогноз"
              color="#ff3b3b"
            />
          )}
          {recap.easiestRace && (
            <TrackPlate
              label="Самая угадываемая"
              race={recap.easiestRace.race}
              value={formatDecimal(recap.easiestRace.avg)}
              unit="очка за прогноз"
              color="#00d26a"
            />
          )}
          {recap.bestRatedRace && (
            <TrackPlate
              label="Лучшая по оценкам"
              race={recap.bestRatedRace.race}
              value={`+${recap.bestRatedRace.score}`}
              unit={votes(recap.bestRatedRace)}
              color="#FFDF2C"
            />
          )}
          {recap.worstRatedRace && (
            <TrackPlate
              label="Худшая по оценкам"
              race={recap.worstRatedRace.race}
              value={String(recap.worstRatedRace.score)}
              unit={votes(recap.worstRatedRace)}
              color="#8b8b9a"
            />
          )}
        </div>
        <div className="mt-5">
          <Radio text={texts.racesComment} />
        </div>
      </section>

      {/* Народный игрок */}
      {recap.crowd && (
        <section>
          <Heading index="05">Народный игрок</Heading>
          <div className="flex flex-col gap-5 border border-white/10 bg-[#15151E] p-5 md:flex-row md:items-center">
            <div className="shrink-0">
              <div className="flex items-baseline gap-3">
                <span className="-skew-x-12 text-6xl font-black italic tabular-nums text-accent">
                  P{recap.crowd.rank}
                </span>
                <span className="text-2xl font-black italic tabular-nums">
                  {recap.crowd.points} {plural(recap.crowd.points, ['очко', 'очка', 'очков'])}
                </span>
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                если каждую гонку ставить как большинство
              </div>
            </div>
            <div className="flex-1">
              <Radio text={texts.crowdComment} from="Народ" color="#FFDF2C" />
            </div>
          </div>
        </section>
      )}

      <Checkered className="opacity-30" />
    </div>
  )
}

const votes = (row: RatedRace) => `${row.good} хор. · ${row.normal} норм. · ${row.bad} плох.`

function DriverPlate({
  label,
  driver,
  big,
  bigLabel,
  small,
}: {
  label: string
  driver: RecapDriver
  big: ReactNode
  bigLabel: string
  small: string
}) {
  return (
    <div
      className="relative flex overflow-hidden border border-white/10"
      style={{
        background: `linear-gradient(100deg, color-mix(in srgb, ${driver.teamColor} 35%, #15151E) 0%, #15151E 60%)`,
      }}
    >
      <div className="w-2 shrink-0" style={{ background: driver.teamColor }} />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-6 right-3 select-none text-8xl font-black italic leading-none text-white/[0.06]"
      >
        {driver.shortName}
      </span>
      <div className="relative flex min-w-0 flex-1 flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <div
            className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: driver.teamColor }}
          >
            {label}
          </div>
          <div className="-skew-x-6 truncate text-2xl font-black uppercase italic leading-tight sm:text-3xl">
            {driver.name}
          </div>
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {driver.teamName ?? '—'} · {small}
          </div>
        </div>
        <div className="shrink-0 sm:text-right">
          <div className="-skew-x-12 text-5xl font-black italic tabular-nums leading-none">
            {big}
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {bigLabel}
          </div>
        </div>
      </div>
    </div>
  )
}
