'use client'

import { Driver, Prediction, Race } from '@/payload-types'
import { useState } from 'react'

import { DriverCardBase } from '@/components/DriverCard/DriverCardBase'
import { Drawer } from 'vaul'
import { PodiumSlot, SavePredictionButton } from './PodiumSlot'
import { usePodiumPrediction } from './usePodiumPrediction'

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
  const { podium, setPodium, getPodiumDriver, filledSlotsCount, isSubmitting, handleSubmit } =
    usePodiumPrediction({ race, drivers, existingPrediction })

  const [activeId, setActiveId] = useState<0 | 1 | 2>(0)
  const [open, setOpen] = useState(false)

  const handleDriverClick = (driver: string) => {
    setOpen(false)

    if (driver === podium[activeId]) return

    const newPodium = [...podium]
    const inPodium = podium.indexOf(driver)

    // Пилот уже на подиуме — меняем слоты местами
    if (inPodium !== -1) newPodium[inPodium] = podium[activeId]
    newPodium[activeId] = driver

    setPodium(newPodium)
  }

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
            {([0, 1, 2] as const).map((slot) => (
              <div
                key={slot}
                className={`flex justify-center ${slot === 0 ? 'sm:col-span-2' : ''}`}
              >
                <Drawer.Trigger
                  disabled={!isPredictionOpen}
                  className="w-full max-w-[280px]"
                  onClick={() => setActiveId(slot)}
                >
                  <PodiumSlot
                    position={(slot + 1) as 1 | 2 | 3}
                    driver={getPodiumDriver(slot)}
                    disabled={!isPredictionOpen}
                  />
                </Drawer.Trigger>
              </div>
            ))}
          </div>

          {isPredictionOpen && (
            <SavePredictionButton
              filledSlotsCount={filledSlotsCount}
              isSubmitting={isSubmitting}
              isUpdate={!!existingPrediction}
              onClick={handleSubmit}
            />
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
