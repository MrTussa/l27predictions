'use client'

import { Button } from '@/components/ui/button'
import { Driver, Prediction, Race } from '@/payload-types'
import { useState } from 'react'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { DriverCardBase } from '@/components/DriverCard/DriverCardBase'
import { Drawer } from 'vaul'
import { PodiumDrawerSlot } from './PodiumDrawerSlot'

type Props = {
  race: Race
  drivers: Driver[]
  existingPrediction: Prediction | null
  isPredictionOpen: boolean
}

export const PredictionDrawer: React.FC<Props> = ({
  race,
  drivers,
  existingPrediction,
  isPredictionOpen,
}) => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeId, setActiveId] = useState<0 | 1 | 2>(0)

  const [open, setOpen] = useState(false)

  const initialPodium: (string | null)[] = [null, null, null]
  if (existingPrediction) {
    existingPrediction.predictions
      .sort((a, b) => a.position - b.position)
      .forEach((p, index) => {
        if (index < 3) {
          initialPodium[index] = typeof p.driver === 'object' ? p.driver.id : p.driver
        }
      })
  }

  const [podium, setPodium] = useState<(string | null)[]>(initialPodium)

  const getPodiumDriver = (position: 0 | 1 | 2): Driver | null => {
    const driverId = podium[position]
    if (!driverId) return null
    return drivers.find((d) => d.id === driverId) || null
  }

  const handleDriverClick = (driver: string) => {
    setOpen(false)

    if (driver === podium[activeId]) return

    const inPodium = podium.indexOf(driver)

    if (inPodium !== -1) {
      const newPodium = [...podium]
      newPodium[inPodium] = podium[activeId]
      newPodium[activeId] = driver

      setPodium(newPodium)
    } else {
      const newPodium = [...podium]
      newPodium[activeId] = driver

      setPodium(newPodium)
    }
  }

  const handleSubmit = async () => {
    const filledSlots = podium.filter((id) => id !== null)
    if (filledSlots.length !== 3) {
      toast.error('Заполните все 3 места на подиуме')
      return
    }

    setIsSubmitting(true)

    try {
      const predictions = podium.map((driverId, index) => ({
        position: index + 1,
        driver: driverId as string,
      }))

      const method = existingPrediction ? 'PATCH' : 'POST'
      const url = existingPrediction
        ? `/api/predictions/${existingPrediction.id}`
        : `/api/predictions`

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          race: race.id,
          predictions,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Ошибка при сохранении прогноза')
      }

      toast.success(existingPrediction ? 'Прогноз успешно обновлен!' : 'Прогноз успешно сохранен!')
      router.push('/predictions')
    } catch (error) {
      console.error('Submission error:', error)
      toast.error(error instanceof Error ? error.message : 'Не удалось сохранить прогноз')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filledSlotsCount = podium.filter((id) => id !== null).length

  return (
    <div className="space-y-8">
      {/* Подиум - Топ 3 */}
      <div>
        <h2 className="text-2xl font-bold mb-6">
          Ваш прогноз топ-3 {filledSlotsCount > 0 && `(${filledSlotsCount}/3)`}
        </h2>

        <Drawer.Root open={open} onOpenChange={setOpen}>
          {/* Подиум слоты */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 flex justify-center">
              <Drawer.Trigger
                disabled={!isPredictionOpen}
                className="w-full max-w-[280px]"
                onClick={() => setActiveId(0)}
              >
                <PodiumDrawerSlot
                  position={1}
                  driver={getPodiumDriver(0)}
                  disabled={!isPredictionOpen}
                />
              </Drawer.Trigger>
            </div>

            <div className=" flex justify-center">
              <Drawer.Trigger
                disabled={!isPredictionOpen}
                className="w-full max-w-[280px]"
                onClick={() => setActiveId(1)}
              >
                <PodiumDrawerSlot
                  position={2}
                  driver={getPodiumDriver(1)}
                  disabled={!isPredictionOpen}
                />
              </Drawer.Trigger>
            </div>

            <div className=" flex justify-center">
              <Drawer.Trigger
                disabled={!isPredictionOpen}
                className="w-full max-w-[280px]"
                onClick={() => setActiveId(2)}
              >
                <PodiumDrawerSlot
                  position={3}
                  driver={getPodiumDriver(2)}
                  disabled={!isPredictionOpen}
                />
              </Drawer.Trigger>
            </div>
          </div>

          {isPredictionOpen && (
            <Button
              onClick={handleSubmit}
              disabled={filledSlotsCount !== 3 || isSubmitting}
              className="w-full my-6"
              size="lg"
              variant={filledSlotsCount === 3 ? 'default' : 'ghost'}
            >
              {isSubmitting
                ? 'Сохранение...'
                : existingPrediction
                  ? 'Обновить прогноз'
                  : 'Сохранить прогноз'}
            </Button>
          )}

          {/* Список пилотов */}
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/40 z-30" />
            <Drawer.Content
              aria-describedby={undefined}
              onCloseAutoFocus={(e) => e.preventDefault()}
              className="z-50 flex flex-col mt-24 h-[80%] fixed bottom-0 left-0 right-0 outline-none"
            >
              <Drawer.Title className="sr-only">Выберите пилота</Drawer.Title>
              <div className="custom-scrollbar p-4 bg-background rounded-t-[10px] flex-1 overflow-y-auto">
                <div
                  aria-hidden
                  className="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-accent mb-4"
                />
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {drivers.map((driver) => {
                    const podiumIndex = podium.indexOf(driver.id)
                    const isSelected = podiumIndex !== -1 && podium[activeId] === driver.id
                    const selectedPosition = isSelected ? podiumIndex + 1 : null

                    return (
                      <div
                        onClick={() => handleDriverClick(driver.id)}
                        key={driver.id}
                        className={`relative transition-opacity ${isSelected ? 'opacity-50' : ''}`}
                      >
                        <DriverCardBase
                          driver={driver}
                          height="h-[180px] sm:h-[280px]"
                          topRightContent={selectedPosition ?? driver.number}
                          showGlow={!isSelected}
                          size="sm"
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    </div>
  )
}
