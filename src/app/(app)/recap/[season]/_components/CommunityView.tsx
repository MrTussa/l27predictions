import { Nickname } from '@/components/Nickname'
import { Button } from '@/components/ui/button'
import { formatDecimal, plural } from '@/utilities/plural'
import type { CommunityRecap, RatedRace } from '@/utilities/seasonRecap/buildCommunityRecap'
import type { CommunityTexts } from '@/utilities/seasonRecap/communityTexts'
import type { RecapDriver } from '@/utilities/seasonRecap/types'
import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import {
  ACCENT,
  Caption,
  Checkered,
  Heading,
  NEGATIVE,
  PODIUM_COLORS,
  POSITIVE,
  Panel,
  Radio,
  TrackPlate,
} from '@/components/Broadcast'

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
      <Panel variant="yellow-glow" bodyClassName="overflow-hidden px-0">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-4 -top-6 select-none text-[150px] font-black leading-none text-transparent sm:text-[240px]"
          style={{ WebkitTextStroke: '2px rgba(255,255,255,0.07)' } as CSSProperties}
        >
          L27
        </span>
        <div className="relative space-y-5 px-6 pb-8 pt-4 sm:px-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="clip-path-cut-corner-xs bg-accent px-3 py-1 text-sm font-black text-black">
              L27
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Итоги сезона {season} · {recap.racesCompleted}{' '}
              {plural(recap.racesCompleted, ['гонка', 'гонки', 'гонок'])}
            </span>
          </div>
          <h1 className="max-w-4xl text-3xl font-bold uppercase leading-snug tracking-tight sm:text-5xl">
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
                <div className="text-4xl font-black tabular-nums">{value}</div>
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
      </Panel>

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
                    className="block truncate text-xl font-bold uppercase transition-colors hover:text-accent sm:text-2xl"
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
                    background: `linear-gradient(180deg, ${PODIUM_COLORS[i]} 0%, color-mix(in srgb, ${PODIUM_COLORS[i]} 35%, var(--card)) 100%)`,
                  }}
                >
                  <span className="text-6xl font-black leading-none text-black/80">{i + 1}</span>
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
        <Panel bodyClassName="px-0">
          <div className="divide-y divide-white/5">
            {recap.nominations.map((nomination, i) => (
              <div
                key={nomination.key}
                className="grid grid-cols-[3rem_1fr] gap-x-4 gap-y-1 px-4 py-4 transition-colors hover:bg-white/[0.03] md:grid-cols-[3rem_16rem_14rem_1fr] md:items-center"
              >
                <span className="row-span-2 self-start text-3xl font-black tabular-nums text-white/25 md:row-span-1 md:self-center">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <div
                    className="font-bold uppercase tracking-wide"
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
                    className="flex items-center gap-2 truncate text-lg font-bold transition-colors hover:text-accent"
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
                <p className="col-start-2 text-sm text-white/70 md:col-start-auto">
                  {texts.nominations[nomination.key]}
                </p>
              </div>
            ))}
          </div>
        </Panel>
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
              color={recap.driverOfSeason?.driver.teamColor ?? ACCENT}
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
              color={NEGATIVE}
            />
          )}
          {recap.easiestRace && (
            <TrackPlate
              label="Самая угадываемая"
              race={recap.easiestRace.race}
              value={formatDecimal(recap.easiestRace.avg)}
              unit="очка за прогноз"
              color={POSITIVE}
            />
          )}
          {recap.bestRatedRace && (
            <TrackPlate
              label="Лучшая по оценкам"
              race={recap.bestRatedRace.race}
              value={`+${recap.bestRatedRace.score}`}
              unit={votes(recap.bestRatedRace)}
              color={ACCENT}
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
          <Panel bodyClassName="flex flex-col gap-5 md:flex-row md:items-center">
            <div className="shrink-0">
              <div className="flex items-baseline gap-3">
                <span className="text-6xl font-black tabular-nums text-accent">
                  P{recap.crowd.rank}
                </span>
                <span className="text-2xl font-black tabular-nums">
                  {recap.crowd.points} {plural(recap.crowd.points, ['очко', 'очка', 'очков'])}
                </span>
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                если каждую гонку ставить как большинство
              </div>
            </div>
            <div className="flex-1">
              <Radio text={texts.crowdComment} from="Народ" />
            </div>
          </Panel>
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
    <Panel accent={driver.teamColor} className="h-full" bodyClassName="overflow-hidden">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-8 right-3 select-none text-8xl font-black leading-none text-white/[0.06]"
      >
        {driver.shortName}
      </span>
      <div className="relative flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <Caption color={driver.teamColor}>{label}</Caption>
          <div className="truncate text-2xl font-bold sm:text-3xl">{driver.name}</div>
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {driver.teamName ?? '—'} · {small}
          </div>
        </div>
        <div className="shrink-0 sm:text-right">
          <div className="text-5xl font-black leading-none tabular-nums">{big}</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {bigLabel}
          </div>
        </div>
      </div>
    </Panel>
  )
}
