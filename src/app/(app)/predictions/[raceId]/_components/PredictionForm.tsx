'use client'

import { Button } from '@/components/ui/button'
import { Driver, Prediction, Race, User } from '@/payload-types'
import { useState } from 'react'

import { DriverCardSelectable, PodiumSlot } from '@/components/DriverCard'
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
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type Props = {
  race: Race
  drivers: Driver[]
  user: User
  existingPrediction: Prediction | null
  isPredictionOpen: boolean
  isPredictionClosed: boolean
}

export const PredictionForm: React.FC<Props> = ({
  race,
  drivers,
  existingPrediction,
  isPredictionOpen,
}) => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

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

  const getPodiumDriver = (position: 0 | 1 | 2): Driver | null => {
    const driverId = podium[position]
    if (!driverId) return null
    return drivers.find((d) => d.id === driverId) || null
  }

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

        <DndContext
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-end lg:justify-center gap-4 lg:gap-6 mb-8">
              <div className="sm:col-span-2 lg:order-2 lg:flex-1 flex justify-center">
                <div className="w-full max-w-[280px]">
                  <PodiumSlot
                    position={1}
                    driver={getPodiumDriver(0)}
                    onRemove={() => handleRemoveFromPodium(0)}
                    disabled={!isPredictionOpen}
                  />
                </div>
              </div>

              <div className="lg:order-1 lg:flex-1 flex justify-center">
                <div className="w-full max-w-[280px]">
                  <PodiumSlot
                    position={2}
                    driver={getPodiumDriver(1)}
                    onRemove={() => handleRemoveFromPodium(1)}
                    disabled={!isPredictionOpen}
                  />
                </div>
              </div>

              <div className="lg:order-3 lg:flex-1 flex justify-center">
                <div className="w-full max-w-[280px]">
                  <PodiumSlot
                    position={3}
                    driver={getPodiumDriver(2)}
                    onRemove={() => handleRemoveFromPodium(2)}
                    disabled={!isPredictionOpen}
                  />
                </div>
              </div>
            </div>
          </SortableContext>

          <SortableContext items={availableDrivers.map((d) => d.id)} strategy={rectSortingStrategy}>
            {/* Список пилотов */}
            <div>
              <h2 className="text-2xl font-bold mb-6">
                Доступные пилоты ({availableDrivers.length})
              </h2>
              <div className="max-h-[800px] overflow-y-auto pr-2">
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
            {activeId ? (
              <div className="opacity-50 scale-110 ">
                <DriverCardSelectable driver={drivers.find((d) => d.id === activeId)!} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Кнопка сохранения */}
        {isPredictionOpen && (
          <Button
            onClick={handleSubmit}
            disabled={filledSlotsCount !== 3 || isSubmitting}
            className="w-full mt-6"
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
      </div>
    </div>
  )
}
