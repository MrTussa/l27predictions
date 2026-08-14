'use client'

import { Driver, Prediction, Race } from '@/payload-types'
import { useState } from 'react'

import { DriverCardSelectable } from '@/components/DriverCard/DriverCardSelectable'
import type { CollisionDetection } from '@dnd-kit/core'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  pointerWithin,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable'
import { PodiumDndSlot } from './PodiumDndSlot'
import { SavePredictionButton } from './PodiumSlot'
import { usePodiumPrediction } from './usePodiumPrediction'

type Props = {
  race: Race
  drivers: Driver[]
  existingPrediction: Prediction | null
  isPredictionOpen: boolean
}

export const PredictionForm: React.FC<Props> = ({
  race,
  drivers,
  existingPrediction,
  isPredictionOpen,
}) => {
  const { podium, setPodium, getPodiumDriver, filledSlotsCount, isSubmitting, handleSubmit } =
    usePodiumPrediction({ race, drivers, existingPrediction })

  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 300,
        tolerance: 8,
      },
    }),
  )

  const collisionDetectionStrategy: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args)
    if (pointerCollisions.length > 0) {
      return pointerCollisions
    }
    return closestCenter(args)
  }

  const availableDrivers = drivers.filter((d) => !podium.includes(d.id))

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const newPodium = [...podium]

    const fromPodiumIndex = podium.indexOf(activeId)
    const isFromPodium = fromPodiumIndex !== -1

    if (overId.startsWith('podium-')) {
      const targetPosition = parseInt(overId.split('-')[1]) - 1 // 0, 1, or 2

      if (isFromPodium) {
        newPodium[fromPodiumIndex] = null
        newPodium[targetPosition] = activeId
      } else {
        newPodium[targetPosition] = activeId
      }

      setPodium(newPodium)
    } else {
      const toPodiumIndex = podium.indexOf(overId)

      if (toPodiumIndex !== -1) {
        if (isFromPodium) {
          const temp = newPodium[toPodiumIndex]
          newPodium[toPodiumIndex] = newPodium[fromPodiumIndex]
          newPodium[fromPodiumIndex] = temp
        } else {
          newPodium[toPodiumIndex] = activeId
        }

        setPodium(newPodium)
      }
    }
  }

  const handleRemoveFromPodium = (position: 0 | 1 | 2) => {
    const newPodium = [...podium]
    newPodium[position] = null
    setPodium(newPodium)
  }

  return (
    <div className="space-y-8">
      {/* Подиум - Топ 3 */}
      <div>
        <h2 className="text-2xl font-bold mb-6">
          Ваш прогноз топ-3 {filledSlotsCount > 0 && `(${filledSlotsCount}/3)`}
        </h2>

        <DndContext
          id="prediction-dnd"
          sensors={sensors}
          collisionDetection={collisionDetectionStrategy}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={[
              'podium-1',
              'podium-2',
              'podium-3',
              ...(podium.filter((id) => id !== null) as string[]),
            ]}
            strategy={rectSortingStrategy}
          >
            {/* Подиум слоты */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-end lg:justify-center gap-4 lg:gap-6">
              <div className="sm:col-span-2 lg:order-2 lg:flex-1 flex justify-center">
                <div className="w-full max-w-[280px]">
                  <PodiumDndSlot
                    position={1}
                    driver={getPodiumDriver(0)}
                    onRemove={() => handleRemoveFromPodium(0)}
                    disabled={!isPredictionOpen}
                  />
                </div>
              </div>

              <div className="lg:order-1 lg:flex-1 flex justify-center">
                <div className="w-full max-w-[280px]">
                  <PodiumDndSlot
                    position={2}
                    driver={getPodiumDriver(1)}
                    onRemove={() => handleRemoveFromPodium(1)}
                    disabled={!isPredictionOpen}
                  />
                </div>
              </div>

              <div className="lg:order-3 lg:flex-1 flex justify-center">
                <div className="w-full max-w-[280px]">
                  <PodiumDndSlot
                    position={3}
                    driver={getPodiumDriver(2)}
                    onRemove={() => handleRemoveFromPodium(2)}
                    disabled={!isPredictionOpen}
                  />
                </div>
              </div>
            </div>
          </SortableContext>

          {isPredictionOpen && (
            <SavePredictionButton
              filledSlotsCount={filledSlotsCount}
              isSubmitting={isSubmitting}
              isUpdate={!!existingPrediction}
              onClick={handleSubmit}
            />
          )}

          <SortableContext items={availableDrivers.map((d) => d.id)} strategy={() => null}>
            {/* Список пилотов */}
            <div>
              <div className="max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                {availableDrivers.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12 border rounded-lg">
                    <p>Все пилоты на подиуме</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {availableDrivers.map((driver) => (
                      <DriverCardSelectable
                        key={driver.id}
                        driver={driver}
                        draggable
                        disabled={!isPredictionOpen || filledSlotsCount >= 3}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </SortableContext>

          <DragOverlay>
            {activeId && drivers.find((d) => d.id === activeId) ? (
              <div className="opacity-50 scale-110 ">
                <DriverCardSelectable driver={drivers.find((d) => d.id === activeId)!} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
