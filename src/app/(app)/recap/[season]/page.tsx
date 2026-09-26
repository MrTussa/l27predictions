import { isAdmin } from '@/access'
import { Nickname } from '@/components/Nickname'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getServerSideUser } from '@/utilities/getServerSideUser'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { formatDecimal, plural } from '@/utilities/plural'
import type { CommunityRecap } from '@/utilities/seasonRecap/buildCommunityRecap'
import { getCommunityRecap, parseSeason } from '@/utilities/seasonRecap/getSeasonRecap'
import type { RecapRace } from '@/utilities/seasonRecap/types'
import {
  IconAnchor,
  IconBrain,
  IconCrown,
  IconFlame,
  IconGhost2,
  IconHourglass,
  IconTarget,
  IconTrophy,
  IconUsers,
  type Icon,
} from '@tabler/icons-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Chip, SectionTitle } from '../../user/[id]/recap/[season]/_components/parts'

const NOMINATION_ICON: Record<string, Icon> = {
  champion: IconCrown,
  sniper: IconTarget,
  ironman: IconFlame,
  fan: IconAnchor,
  zeros: IconGhost2,
  ghost: IconHourglass,
  bold: IconBrain,
}

type Props = {
  params: Promise<{ season: string }>
}

export default async function CommunityRecapPage({ params }: Props) {
  const { season: seasonParam } = await params
  const season = parseSeason(seasonParam)
  if (!season) notFound()

  const [recap, { user: viewer }] = await Promise.all([
    getCommunityRecap(season),
    getServerSideUser(),
  ])
  if (recap.racesTotal === 0) notFound()

  // До финальной гонки общие итоги видят только админы
  const isPreview = !recap.isSeasonComplete
  if (isPreview && !isAdmin(viewer)) {
    return (
      <div className="px-4 py-12 md:px-16">
        <Card variant="gray" corners="cut-corner" className="mx-auto max-w-xl">
          <div className="flex flex-col items-center gap-4 px-6 py-4 text-center">
            <IconHourglass className="size-12 text-accent" />
            <h1 className="text-2xl font-black uppercase tracking-wide">Итоги сезона {season}</h1>
            <p className="text-muted-foreground">
              Номинации сезона откроются после финальной гонки: прошло {recap.racesCompleted} из{' '}
              {recap.racesTotal}.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-450 space-y-6 px-4 py-6 md:px-16">
      {isPreview && (
        <span className="inline-block border border-accent/50 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-accent">
          Предпросмотр для админов · откроется после финала ({recap.racesCompleted}/
          {recap.racesTotal})
        </span>
      )}

      <Card variant="yellow-glow" corners="cut-corner" className="p-0.5">
        <div className="flex flex-col gap-4 px-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Чемпионат прогнозов L27
            </div>
            <h1 className="text-3xl font-black uppercase italic tracking-wide sm:text-5xl">
              Итоги сезона {season}
            </h1>
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
          {viewer && (
            <Button asChild>
              <Link href={`/user/${viewer.id}/recap/${season}`} prefetch={false}>
                Мои итоги
              </Link>
            </Button>
          )}
        </div>
      </Card>

      <div>
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
                  <div className="mt-auto font-mono text-xs font-bold uppercase tracking-wider text-accent">
                    {nomination.value}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {recap.hardestRace && (
          <RaceCard
            label="Гонка, где ошиблись все"
            race={recap.hardestRace.race}
            avg={recap.hardestRace.avg}
            color="#ff4d4d"
          />
        )}
        {recap.easiestRace && (
          <RaceCard
            label="Самая угадываемая гонка"
            race={recap.easiestRace.race}
            avg={recap.easiestRace.avg}
            color="#00e050"
          />
        )}
        {recap.crowd && <CrowdCard crowd={recap.crowd} players={recap.playersTotal} />}
      </div>
    </div>
  )
}

function RaceCard({
  label,
  race,
  avg,
  color,
}: {
  label: string
  race: RecapRace
  avg: number
  color: string
}) {
  return (
    <Card corners="cut-corner" accentColor={color}>
      <div className="flex items-center gap-4 px-5">
        {race.trackSVGPath && (
          <svg
            viewBox="144 144 512 512"
            className="size-20 shrink-0"
            fill={color}
            aria-hidden="true"
          >
            <path d={race.trackSVGPath} />
          </svg>
        )}
        <div className="min-w-0 space-y-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </div>
          <div className="text-lg font-black uppercase leading-tight">{race.name}</div>
          <div className="text-sm text-muted-foreground">
            В среднем {formatDecimal(avg)} за прогноз
          </div>
        </div>
      </div>
    </Card>
  )
}

function CrowdCard({
  crowd,
  players,
}: {
  crowd: NonNullable<CommunityRecap['crowd']>
  players: number
}) {
  return (
    <Card corners="cut-corner" accentColor="#FFDF2C">
      <div className="space-y-2 px-5">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          <IconUsers className="size-4 text-accent" />
          Народный игрок
        </div>
        <div className="text-lg font-black uppercase leading-tight">
          {crowd.points} {plural(crowd.points, ['очко', 'очка', 'очков'])} — было бы P{crowd.rank}{' '}
          из {players}
        </div>
        <div className="text-sm text-muted-foreground">
          Столько набрал бы тот, кто каждую гонку ставит как большинство.
        </div>
      </div>
    </Card>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { season } = await params
  const title = `Итоги сезона ${season}`
  const description =
    'Номинации сезона чемпионата прогнозов L27: чемпион, снайпер, верный фанат и самый смелый прогноз'
  return {
    title,
    description,
    openGraph: mergeOpenGraph({ title, description, url: `/recap/${season}` }),
  }
}
