'use client'

import type { Driver, Prediction, Race } from '@/payload-types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

function initialPodium(existingPrediction: Prediction | null): (string | null)[] {
  const podium: (string | null)[] = [null, null, null]

  existingPrediction?.predictions
    .toSorted((a, b) => a.position - b.position)
    .slice(0, 3)
    .forEach((p, i) => {
      podium[i] = typeof p.driver === 'object' ? p.driver.id : p.driver
    })

  return podium
}

/**
 * Состояние подиума + сохранение прогноза. Общее для DnD-формы и drawer-версии.
 * Пишет напрямую в Payload REST — окно прогнозов и права проверяет коллекция.
 */
export function usePodiumPrediction({
  race,
  drivers,
  existingPrediction,
}: {
  race: Race
  drivers: Driver[]
  existingPrediction: Prediction | null
}) {
  const router = useRouter()
  const [podium, setPodium] = useState<(string | null)[]>(() => initialPodium(existingPrediction))
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filledSlotsCount = podium.filter((id) => id !== null).length

  const getPodiumDriver = (position: 0 | 1 | 2): Driver | null =>
    drivers.find((d) => d.id === podium[position]) || null

  const handleSubmit = async () => {
    if (filledSlotsCount !== 3) {
      toast.error('Заполните все 3 места на подиуме')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(
        existingPrediction ? `/api/predictions/${existingPrediction.id}` : '/api/predictions',
        {
          method: existingPrediction ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            race: race.id,
            predictions: podium.map((driverId, index) => ({
              position: index + 1,
              driver: driverId as string,
            })),
          }),
        },
      )

      const body = await response.json()

      if (!response.ok) {
        throw new Error(body?.errors?.[0]?.message || 'Ошибка при сохранении прогноза')
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

  return { podium, setPodium, getPodiumDriver, filledSlotsCount, isSubmitting, handleSubmit }
}
