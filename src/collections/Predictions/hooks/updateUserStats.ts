import type { CollectionAfterChangeHook } from 'payload'

/**
 * Хук для обновления статистики пользователя после создания прогноза
 * - Увеличивает счетчик totalPredictions
 * - Пересчитывает currentStreak (стрик последовательных прогнозов)
 */
export const updateUserStats: CollectionAfterChangeHook = async ({ doc, req, operation }) => {
  // Работает только при создании нового прогноза
  if (operation !== 'create') {
    return doc
  }

  const userId = typeof doc.user === 'object' ? doc.user.id : doc.user
  const raceId = typeof doc.race === 'object' ? doc.race.id : doc.race

  if (!userId || !raceId) {
    return doc
  }

  try {
    // Получаем текущего пользователя
    const user = await req.payload.findByID({
      collection: 'users',
      id: userId,
    })

    if (!user) {
      return doc
    }

    // Увеличиваем счетчик прогнозов
    const totalPredictions = (user.totalPredictions || 0) + 1

    // Пересчитываем стрик
    // Получаем все завершенные гонки текущего сезона
    const currentYear = new Date().getFullYear()
    const { docs: races } = await req.payload.find({
      collection: 'races',
      where: {
        and: [
          {
            season: {
              equals: currentYear,
            },
          },
          {
            raceDate: {
              less_than: new Date().toISOString(),
            },
          },
        ],
      },
      sort: '-round', // Сортируем по убыванию (последние гонки первыми)
      limit: 100,
    })

    // Получаем все прогнозы пользователя
    const { docs: userPredictions } = await req.payload.find({
      collection: 'predictions',
      where: {
        user: {
          equals: userId,
        },
      },
      limit: 1000,
    })

    // Подсчитываем стрик
    let currentStreak = 0
    for (const race of races) {
      const hasPrediction = userPredictions.some((pred) => {
        const predRaceId = typeof pred.race === 'object' ? pred.race.id : pred.race
        return predRaceId === race.id
      })

      if (hasPrediction) {
        currentStreak++
      } else {
        break
      }
    }

    // Обновляем пользователя
    await req.payload.update({
      collection: 'users',
      id: userId,
      data: {
        totalPredictions,
        currentStreak,
      },
    })
  } catch (error) {
    console.error('Error updating user stats:', error)
  }

  return doc
}
