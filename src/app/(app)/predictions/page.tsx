import { CardHeading, Heading, NEGATIVE, POSITIVE } from '@/components/Broadcast'
import { PodiumDriver } from '@/components/DriverCard/PodiumDriver'
import { PredictionCard } from '@/components/DriverCard/PredictionCard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getServerSideUser } from '@/utilities/getServerSideUser'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import {
  getDrivers,
  getRaceById,
  getRaceList,
  getRacePicks,
  getTeams,
  getUserPredictionForRace,
  getUserRacesRating,
} from '@/utilities/queries'
import { canMakePrediction, getRaceStatus, isRaceCompleted } from '@/utilities/raceStatus'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PlaceholderCard } from './_components/PlaceholderCard'
import { RaceCarousel } from './_components/RaceCarousel'
import { RaceConsensus } from './_components/RaceConsensus'
import { RaceRecap } from './_components/RaceRecap'
import { RateSelect } from './_components/RateSelect'
import { buildConsensus } from './_lib/buildConsensus'

type RaceListItem = Awaited<ReturnType<typeof getRaceList>>[number]

const STATUS_LABEL = {
  completed: 'Итоги гонки',
  closed: 'Прогнозы закрыты',
  open: 'Прогнозы открыты',
  upcoming: 'Прогнозы скоро откроются',
} as const

// ?race= → открытая гонка → последняя по дате
function pickRace(races: RaceListItem[], requestedId?: string): RaceListItem {
  const lastByDate = races.reduce((latest, race) =>
    new Date(race.raceDate) > new Date(latest.raceDate) ? race : latest,
  )
  return (
    races.find((race) => race.id === requestedId) ??
    races.findLast((race) => canMakePrediction(race)) ??
    lastByDate
  )
}

async function getConsensus(raceId: string, season: number) {
  const [race, picks, drivers] = await Promise.all([
    getRaceById(raceId),
    getRacePicks(raceId),
    getDrivers({ season, activeOnly: false, depth: 1 }),
  ])
  return buildConsensus(race, picks, new Map(drivers.map((d) => [d.id, d])))
}

export default async function PredictionsPage({
  searchParams,
}: {
  searchParams: Promise<{ race?: string }>
}) {
  const [{ user }, { race: requestedId }] = await Promise.all([getServerSideUser(), searchParams])

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent('/predictions')}`)
  }

  const races = await getRaceList()

  if (races.length === 0) {
    return (
      <div className="px-4 md:px-16 py-12 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-wide mb-2">Прогнозы</h1>
        <p className="text-muted-foreground">Календарь сезона ещё не опубликован</p>
      </div>
    )
  }

  const listRace = pickRace(races, requestedId)

  const [selectedRace, userPrediction, racesRating, teams, consensus] = await Promise.all([
    getRaceById(listRace.id),
    getUserPredictionForRace(user.id, listRace.id, 1),
    getUserRacesRating(user.id),
    getTeams({ depth: 1 }),
    isRaceCompleted(listRace) ? getConsensus(listRace.id, listRace.season) : null,
  ])

  const selectedRaceRating = racesRating.find((r) => {
    const raceId = typeof r.race === 'object' ? r.race.id : r.race
    return raceId === selectedRace.id
  })?.rating

  // Где финишировал каждый выбранный пилот — для отметок ✓ / P2 / ✕
  const finishById = new Map(
    (selectedRace.results ?? []).map((result, i) => [
      typeof result.driver === 'object' ? result.driver.id : result.driver,
      result.position ?? i + 1,
    ]),
  )
  const hasResults = finishById.size > 0

  const userPredictedDrivers = [...(userPrediction?.predictions ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((item) => {
      const driverId = typeof item.driver === 'object' ? item.driver.id : item.driver
      return {
        position: item.position,
        name: typeof item.driver === 'object' ? item.driver.name : 'Unknown',
        team: typeof item.driver === 'object' ? item.driver.team : 'Unknown',
        finish: finishById.get(driverId) ?? null,
      }
    })

  return (
    <div className="min-h-screen">
      <div className="px-4 md:px-16 py-6">
        <div className="max-w-450 mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
            <div className="p-1">
              <Heading
                as="h1"
                index={`R${selectedRace.round}`}
                aside={STATUS_LABEL[getRaceStatus(selectedRace)]}
              >
                {selectedRace.name}
              </Heading>
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-end lg:justify-center gap-4 lg:gap-6">
                  {([1, 2, 3] as const).map((position) => {
                    const result = selectedRace.results?.[position - 1]
                    const order =
                      position === 1 ? 'lg:order-2' : position === 2 ? 'lg:order-1' : 'lg:order-3'
                    return (
                      <div
                        key={position}
                        className={`${position === 1 ? 'sm:col-span-2' : ''} ${order} lg:flex-1 flex justify-center`}
                      >
                        <div className="w-full max-w-70 lg:max-w-none">
                          <PodiumDriver
                            position={position}
                            driver={typeof result?.driver === 'object' ? result.driver : null}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="mt-6 min-h-64">
                {selectedRace.recap?.fastestLapTime != null ? (
                  <RaceRecap recap={selectedRace.recap} />
                ) : (
                  <PlaceholderCard text="Статистика появится после гонки" />
                )}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <Card variant="gray" corners="cut-corner" className="p-1">
                <div className="px-4">
                  <CardHeading
                    aside={
                      <span className="flex items-baseline gap-2">
                        Очки
                        <span
                          className={`text-3xl font-black leading-none tabular-nums ${
                            userPrediction
                              ? 'text-accent [text-shadow:0_0_20px_rgba(255,211,32,0.35)]'
                              : 'text-muted-foreground/30'
                          }`}
                        >
                          {userPrediction ? userPrediction.points || 0 : '—'}
                        </span>
                      </span>
                    }
                  >
                    Мои результаты
                  </CardHeading>

                  <div className="mb-4" aria-hidden={!userPrediction}>
                    <div className="space-y-2">
                      {userPrediction
                        ? userPredictedDrivers.map((driver) => {
                            const team = teams.find((t) => t.id === driver.team)
                            return (
                              <div key={driver.position} className="flex items-center gap-2">
                                <div className="min-w-0 flex-1">
                                  {team ? (
                                    <PredictionCard
                                      name={driver.name}
                                      position={driver.position}
                                      team={team}
                                      variant={'colored'}
                                    />
                                  ) : (
                                    <PredictionCard
                                      name={driver.name}
                                      position={driver.position}
                                      variant={'default'}
                                    />
                                  )}
                                </div>
                                {hasResults && (
                                  <PickMark position={driver.position} finish={driver.finish} />
                                )}
                              </div>
                            )
                          })
                        : // плейсхолдеры держат высоту, когда прогноза нет
                          Array.from({ length: 3 }).map((_, i) => (
                            <div
                              key={i}
                              className="h-10.5 bg-background/40 clip-path-cut-corner-sm"
                            />
                          ))}
                    </div>
                  </div>
                  {/* высота зарезервирована: футер меняется вместе со статусом гонки */}
                  <div className="min-h-26">
                    {canMakePrediction(selectedRace) &&
                      (userPrediction ? (
                        <Button asChild variant="outline" className="w-full">
                          <Link href={`/predictions/${selectedRace.id}`}>Изменить прогноз</Link>
                        </Button>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground mb-4">Вы еще не сделали прогноз</p>
                          <Button asChild variant="default" className="w-full">
                            <Link href={`/predictions/${selectedRace.id}`}>Сделать прогноз</Link>
                          </Button>
                        </div>
                      ))}
                    {isRaceCompleted(selectedRace) && (
                      <RateSelect
                        key={selectedRace.id}
                        raceId={selectedRace.id}
                        initialRating={selectedRaceRating}
                      />
                    )}
                  </div>
                </div>
              </Card>

              <div className="min-h-70">
                {consensus ? (
                  <RaceConsensus consensus={consensus} />
                ) : (
                  <PlaceholderCard
                    text="Народный прогноз появится после гонки"
                    className="min-h-0"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <RaceCarousel
        races={races.map(({ id, name, round, trackSVGPath }) => ({
          id,
          name,
          round,
          trackSVGPath,
        }))}
        selectedRaceId={selectedRace.id}
      />
    </div>
  )
}

export const metadata: Metadata = {
  title: 'Прогнозы',
  description: 'Делайте прогнозы на гонки Формулы 1 и соревнуйтесь с другими участниками',
  openGraph: mergeOpenGraph({ title: 'Прогнозы', url: '/predictions' }),
}

/** Отметка у выбора: ✓ — точно, P2 — на подиуме, но на другом месте, ✕ — мимо подиума */
function PickMark({ position, finish }: { position: number; finish: number | null }) {
  const onPodium = finish !== null && finish <= 3
  const exact = finish === position
  const color = exact ? POSITIVE : onPodium ? '#ffcc00' : NEGATIVE
  return (
    <span
      className="clip-path-cut-corner-xs grid h-10.5 w-11 shrink-0 place-items-center font-mono text-sm font-black"
      style={{ color, background: `color-mix(in srgb, ${color} 15%, transparent)` }}
      title={exact ? 'Точное попадание' : onPodium ? `Финишировал P${finish}` : 'Мимо подиума'}
    >
      {exact ? '✓' : onPodium ? `P${finish}` : '✕'}
    </span>
  )
}
