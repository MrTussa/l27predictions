'use client'

import { RaceCarousel } from '@/components/RaceCarousel'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Driver, Prediction, Race, User } from '@/payload-types'
import { Trophy } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'

interface PredictionsPageClientProps {
  races: Race[]
  user: User
  userPredictions: Prediction[]
}

interface PodiumDriverProps {
  position: 1 | 2 | 3
  driver: Driver | null
}

function PodiumDriver({ position, driver }: PodiumDriverProps) {
  const positionHeights = {
    1: 'h-[340px]',
    2: 'h-[320px]',
    3: 'h-[300px]',
  }

  const positionWidths = {
    1: 'w-[260px]',
    2: 'w-[240px]',
    3: 'w-[220px]',
  }

  const positionLabels = {
    1: '1ST',
    2: '2ND',
    3: '3RD',
  }

  if (!driver) {
    return (
      <div
        className={`${positionHeights[position]} ${positionWidths[position]} p-0.5 clip-path-cut-corner bg-border transition-all duration-200`}
      >
        <div className="w-full h-full bg-background clip-path-cut-corner flex flex-col items-center justify-center">
          <div className="text-6xl font-black opacity-20 text-muted-foreground">{position}</div>
          <div className="text-sm text-muted-foreground">{positionLabels[position]}</div>
        </div>
      </div>
    )
  }

  const photo = driver && typeof driver.photo === 'object' ? driver.photo : null
  const countryFlag = driver && typeof driver.countryFlag === 'object' ? driver.countryFlag : null
  const teamColor = driver?.teamColor || '#FFDF2C'

  return (
    <div
      className={`${positionHeights[position]} ${positionWidths[position]} p-0.5 clip-path-cut-corner transition-all duration-200`}
    >
      <div
        className="w-full h-full clip-path-cut-corner relative overflow-hidden p-0.5"
        style={{ backgroundColor: teamColor }}
      >
        <div className="w-full h-full bg-background clip-path-cut-corner relative overflow-hidden p-0.5">
          <div className="w-full h-full bg-background clip-path-cut-corner relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: `linear-gradient(135deg, ${teamColor}40 0%, transparent 70%)`,
              }}
            />

            {photo && photo.url && (
              <div className="absolute inset-0 flex items-end justify-center">
                <div className="relative w-full h-full">
                  <Image
                    src={photo.url}
                    alt={driver.name}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              </div>
            )}

            <div
              className="absolute top-4 right-4 text-6xl font-black opacity-30"
              style={{ color: teamColor }}
            >
              {position}
            </div>

            {position === 1 && (
              <div className="absolute top-4 left-4">
                <Trophy className="w-10 h-10 text-accent" fill="#FFDF2C" />
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent p-4 pt-12 flex flex-row items-center justify-between">
              <div>
                <div
                  className="text-2xl font-black mb-1 tracking-wider"
                  style={{ color: teamColor }}
                >
                  {driver.shortName}
                </div>
                <div className="text-sm font-bold text-foreground/90 mb-1 truncate">
                  {driver.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">{driver.team}</div>
              </div>
              {countryFlag && countryFlag.url && (
                <div className="relative w-10 h-7 flex items-center overflow-hidden shrink-0">
                  <Image
                    src={countryFlag.url}
                    alt="Country flag"
                    fill
                    className="object-cover"
                    sizes="28px"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PredictionsPageClient({
  races,
  user,
  userPredictions,
}: PredictionsPageClientProps) {
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

  const topDrivers = useMemo(() => {
    if (!selectedRace.results || selectedRace.results.length === 0) return []
    return selectedRace.results.slice(0, 3).map((result) => {
      const driver = typeof result.driver === 'object' ? result.driver : null
      return driver
    })
  }, [selectedRace])

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
      <div className="p-8">
        <div className="max-w-[1800px] mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold uppercase tracking-wide text-accent">Мои прогнозы</h1>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
            <Card variant="gray" corners="cut-corner" className="p-8">
              <h2 className="text-2xl font-bold uppercase tracking-wide mb-6 text-center">
                {selectedRace.name}
              </h2>
              <div className="flex justify-center items-end gap-4">
                {topDrivers.length > 0 ? (
                  <>
                    <PodiumDriver position={2} driver={topDrivers[1] || null} />

                    <PodiumDriver position={1} driver={topDrivers[0] || null} />

                    <PodiumDriver position={3} driver={topDrivers[2] || null} />
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Результаты пока не доступны
                  </div>
                )}
              </div>
            </Card>

            <Card variant="gray" corners="cut-corner" className="p-6 sticky top-8">
              <h3 className="text-xl font-bold uppercase tracking-wide mb-6 text-center">
                Мои результаты
              </h3>

              {userPrediction ? (
                <div className="space-y-6">
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

                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/predictions/${selectedRace.id}`}>Изменить прогноз</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Вы еще не сделали прогноз</p>
                  <Button asChild variant="default" className="w-full">
                    <Link href={`/predictions/${selectedRace.id}`}>Сделать прогноз</Link>
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <RaceCarousel races={races} selectedRace={selectedRace} onRaceSelect={setSelectedRace} />
    </div>
  )
}
