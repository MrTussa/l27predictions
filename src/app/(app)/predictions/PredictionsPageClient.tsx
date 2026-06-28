'use client'

import { PodiumDriver } from '@/components/DriverCard/PodiumDriver'
import { PredictionCard } from '@/components/DriverCard/PredictionCard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Prediction, Race, RaceRating, Team } from '@/payload-types'
import { canMakePrediction, isRaceCompleted } from '@/utilities/raceStatus'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { PlaceholderCard } from './_components/PlaceholderCard'
import { RaceCarousel } from './_components/RaceCarousel'
import { RaceRecap } from './_components/RaceRecap'
import { RateSelect } from './_components/RateSelect'

interface PredictionsPageClientProps {
  races: Race[]
  teams: Team[]
  userPredictions: Omit<Prediction, 'user'>[]
  racesRating: RaceRating[]
}

export function PredictionsPageClient({
  races,
  userPredictions,
  teams,
  racesRating,
}: PredictionsPageClientProps) {
  const lastRaceByDate = races.reduce((latest, race) =>
    new Date(race.raceDate) > new Date(latest.raceDate) ? race : latest,
  )
  const defaultRace = races.findLast((race) => canMakePrediction(race)) ?? lastRaceByDate

  const [selectedRace, setSelectedRace] = useState<Race>(defaultRace)

  const selectedRaceRating = useMemo(() => {
    const found = racesRating.find((r) => {
      const raceId = typeof r.race === 'object' ? r.race.id : r.race
      return raceId === selectedRace.id
    })
    return found?.rating
  }, [racesRating, selectedRace])

  const userPrediction = useMemo(() => {
    return userPredictions.find((pred) => {
      const predRace = typeof pred.race === 'object' ? pred.race : null
      return predRace && predRace.id === selectedRace.id
    })
  }, [userPredictions, selectedRace])

  const userPredictedDrivers = useMemo(() => {
    if (!userPrediction || !userPrediction.predictions) return []
    return userPrediction.predictions
      .sort((a, b) => a.position - b.position)
      .map((item) => ({
        position: item.position,
        name: typeof item.driver === 'object' ? item.driver.name : 'Unknown',
        team: typeof item.driver === 'object' ? item.driver.team : 'Unknown',
      }))
  }, [userPrediction])

  return (
    <div className="min-h-screen">
      <div className="px-4 md:px-16 py-6">
        <div className="max-w-450 mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
            <div className="p-1">
              <h2 className="text-2xl font-bold uppercase tracking-wide mb-6 text-center">
                {selectedRace.name}
              </h2>
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

            <Card variant="gray" corners="cut-corner" className="p-1 sticky top-8 h-fit">
              <div className="px-4">
                <h3 className="text-xl font-bold uppercase tracking-wide mb-1 text-center">
                  Мои результаты
                </h3>

                {userPrediction ? (
                  <div className="space-y-4 mb-4">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                        Очки
                      </div>
                      <div className="text-5xl font-bold text-accent">
                        {userPrediction.points || 0}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground uppercase tracking-wider mb-3">
                        Мой прогноз
                      </div>
                      <div className="space-y-2">
                        {userPredictedDrivers.map((driver) => {
                          const team = teams.find((t) => t.id === driver.team)
                          return (
                            <div key={driver.position}>
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
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 mb-4" aria-hidden>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                        Очки
                      </div>
                      <div className="text-5xl font-bold text-muted-foreground/30">—</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground uppercase tracking-wider mb-3">
                        Мой прогноз
                      </div>
                      <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div
                            key={i}
                            className="h-10.5 bg-background/40 clip-path-cut-corner-sm"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
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
                  <RateSelect raceId={selectedRace.id} initialRating={selectedRaceRating} />
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <RaceCarousel races={races} selectedRace={selectedRace} onRaceSelect={setSelectedRace} />
    </div>
  )
}
