'use client'

import { PodiumDriver } from '@/components/DriverCard'
import { RaceCarousel } from '@/components/RaceCarousel'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Prediction, Race, User } from '@/payload-types'
import { canMakePrediction } from '@/utilities/raceStatus'
import Link from 'next/link'
import { useMemo, useState } from 'react'

interface PredictionsPageClientProps {
  races: Race[]
  user: User
  userPredictions: Prediction[]
}

export function PredictionsPageClient({ races, userPredictions }: PredictionsPageClientProps) {
  const now = new Date()
  const defaultRace =
    races.find((race) => {
      const raceDate = new Date(race.raceDate)
      return raceDate < now && race.results && race.results.length > 0
    }) || races[0]

  const [selectedRace, setSelectedRace] = useState<Race>(defaultRace)

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
      }))
  }, [userPrediction])

  return (
    <div className="min-h-screen bg-background">
      <div className="px-8 pt-8 ">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
            <div className="p-1">
              <h2 className="text-2xl font-bold uppercase tracking-wide mb-6 text-center">
                {selectedRace.name}
              </h2>
              <div className=" min-h-[400px]">
                {selectedRace.results && selectedRace.results.length > 0 ? (
                  <div className="flex justify-center items-end gap-4">
                    <PodiumDriver
                      position={2}
                      driver={
                        typeof selectedRace.results[1]?.driver === 'object'
                          ? selectedRace.results[1].driver
                          : null
                      }
                    />

                    <PodiumDriver
                      position={1}
                      driver={
                        typeof selectedRace.results[0]?.driver === 'object'
                          ? selectedRace.results[0].driver
                          : null
                      }
                    />

                    <PodiumDriver
                      position={3}
                      driver={
                        typeof selectedRace.results[2]?.driver === 'object'
                          ? selectedRace.results[2].driver
                          : null
                      }
                    />
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Результаты пока не доступны
                  </div>
                )}
              </div>
            </div>

            <Card variant="gray" corners="cut-corner" className="p-1 sticky top-8">
              <div className="px-4">
                <h3 className="text-xl font-bold uppercase tracking-wide mb-1 text-center">
                  Мои результаты
                </h3>

                {userPrediction && (
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
                        {userPredictedDrivers.map((driver) => (
                          <div
                            key={driver.position}
                            className="flex items-center gap-3 bg-background/50 p-3 border border-accent/20"
                          >
                            <div className="w-8 h-8 flex items-center justify-center bg-accent text-background font-bold rounded-full shrink-0">
                              {driver.position}
                            </div>
                            <div className="text-sm font-medium truncate">{driver.name}</div>
                          </div>
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
              </div>
            </Card>
          </div>
        </div>
      </div>

      <RaceCarousel races={races} selectedRace={selectedRace} onRaceSelect={setSelectedRace} />
    </div>
  )
}
