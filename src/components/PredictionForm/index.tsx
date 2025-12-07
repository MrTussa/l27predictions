'use client'

import { Button } from '@/components/ui/button'
import { Driver, Prediction, Race, User } from '@/payload-types'
import { useState } from 'react'

import type { CollisionDetection } from '@dnd-kit/core'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { DriverCard } from './DriverCard'
import { PodiumSlot } from './PodiumSlot'

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

  // Инициализируем подиум: [null, null, null] или с данными из прогноза
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
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  // Кастомная collision detection
  const collisionDetectionStrategy: CollisionDetection = (args) => {
    // Сначала ищем через pointerWithin (работает для droppable)
    const pointerCollisions = pointerWithin(args)
    if (pointerCollisions.length > 0) {
      return pointerCollisions
    }

    // Потом через closestCenter (работает для sortable)
    return closestCenter(args)
  }

  // Получаем доступных пилотов (не на подиуме)
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

    // Если перетаскиваем на самого себя - ничего не делаем
    if (activeId === overId) return

    const newPodium = [...podium]

    // Находим откуда перетаскиваем (из подиума или из доступных)
    const fromPodiumIndex = podium.indexOf(activeId)
    const isFromPodium = fromPodiumIndex !== -1

    // Определяем куда перетаскиваем
    if (overId.startsWith('podium-')) {
      // Перетаскиваем на пустой слот подиума
      const targetPosition = parseInt(overId.split('-')[1]) - 1 // 0, 1, or 2

      if (isFromPodium) {
        // Перемещение внутри подиума - просто перемещаем
        newPodium[fromPodiumIndex] = null
        newPodium[targetPosition] = activeId
      } else {
        // Добавление из доступных пилотов в пустой слот
        newPodium[targetPosition] = activeId
      }

      setPodium(newPodium)
    } else {
      // Перетаскиваем на карточку пилота (swap или replace)
      const toPodiumIndex = podium.indexOf(overId)

      if (toPodiumIndex !== -1) {
        // Целевая позиция - это пилот на подиуме
        if (isFromPodium) {
          // Swap между двумя пилотами на подиуме
          const temp = newPodium[toPodiumIndex]
          newPodium[toPodiumIndex] = newPodium[fromPodiumIndex]
          newPodium[fromPodiumIndex] = temp
        } else {
          // Замена пилота на подиуме на пилота из доступных
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
          'X-Payload-HTTP-Method-Override': 'GET',
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
          {/* Подиум с отдельным SortableContext */}
          <SortableContext
            items={[
              'podium-1',
              'podium-2',
              'podium-3',
              ...(podium.filter((id) => id !== null) as string[]),
            ]}
            strategy={rectSortingStrategy}
          >
            <div className="flex items-end justify-center gap-6 mb-8">
              {/* 2 место (слева) */}
              <div className="flex-1 max-w-[280px]">
                <PodiumSlot
                  position={2}
                  driver={getPodiumDriver(1)}
                  onRemove={() => handleRemoveFromPodium(1)}
                  disabled={!isPredictionOpen}
                />
              </div>

              {/* 1 место (центр, выше) */}
              <div className="flex-1 max-w-[280px]">
                <PodiumSlot
                  position={1}
                  driver={getPodiumDriver(0)}
                  onRemove={() => handleRemoveFromPodium(0)}
                  disabled={!isPredictionOpen}
                />
              </div>

              {/* 3 место (справа) */}
              <div className="flex-1 max-w-[280px]">
                <PodiumSlot
                  position={3}
                  driver={getPodiumDriver(2)}
                  onRemove={() => handleRemoveFromPodium(2)}
                  disabled={!isPredictionOpen}
                />
              </div>
            </div>
          </SortableContext>

          {/* Доступные пилоты с отдельным SortableContext */}
          <SortableContext items={availableDrivers.map((d) => d.id)} strategy={rectSortingStrategy}>
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
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {availableDrivers.map((driver) => (
                      <DriverCard
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
              <div className="opacity-50">
                <DriverCard driver={drivers.find((d) => d.id === activeId)!} />
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
