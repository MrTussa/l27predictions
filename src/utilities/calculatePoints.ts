/**
 * Рассчитывает баллы за прогноз на основе фактических результатов гонки
 *
 * Правила подсчета:
 * 1. Совпадение пилота, но не позиции: 1 балл
 * 2. Совпадение пилота И позиции (1-2 совпадения): 3 балла за каждое
 * 3. Идеальный прогноз (3/3 совпадения пилот+позиция): 15 баллов всего (перезаписывает индивидуальные баллы)
 *
 * @param predictions - Массив прогнозов пользователя [{position: 1, driver: 'id1'}, ...]
 * @param results - Массив фактических результатов гонки [{position: 1, driver: 'id1'}, ...]
 * @returns Количество набранных баллов
 */
export function calculatePoints(
  predictions: Array<{ position: number; driver: string | { id: string } }>,
  results: Array<{ position: number; driver: string | { id: string } }>,
): number {
  if (!predictions || !results || predictions.length === 0 || results.length === 0) {
    return 0
  }

  let points = 0
  let exactMatches = 0 // Количество точных совпадений (пилот + позиция)

  // Нормализуем ID пилотов для сравнения
  const normalizeDriverId = (driver: string | { id: string }): string => {
    return typeof driver === 'object' ? driver.id : driver
  }

  // Проходим по каждому прогнозу
  predictions.forEach((prediction) => {
    const predDriverId = normalizeDriverId(prediction.driver)
    const predPosition = prediction.position

    // Ищем результат для этой позиции
    const actualResult = results.find((r) => r.position === predPosition)

    if (actualResult) {
      const actualDriverId = normalizeDriverId(actualResult.driver)

      // Проверяем точное совпадение (пилот + позиция)
      if (predDriverId === actualDriverId) {
        exactMatches++
        points += 3
      } else {
        // Пилот есть в топ-3, но на другой позиции
        const driverInTop3 = results.some((r) => normalizeDriverId(r.driver) === predDriverId)
        if (driverInTop3) {
          points += 1
        }
      }
    } else {
      // Если результата для этой позиции нет, проверяем, есть ли пилот в топ-3
      const driverInTop3 = results.some((r) => normalizeDriverId(r.driver) === predDriverId)
      if (driverInTop3) {
        points += 1
      }
    }
  })

  // Если все 3 прогноза точные - идеальный прогноз = 15 баллов
  if (exactMatches === 3) {
    return 15
  }

  return points
}
