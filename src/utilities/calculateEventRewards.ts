import type { Payload } from 'payload'
import { normalizeID } from './normalizeID'

/**
 * Рассчитывает и начисляет награды за завершенное событие
 * Вызывается когда событие переводится в статус 'completed'
 *
 * @param payload - Payload instance
 * @param eventId - ID события
 */
export async function calculateEventRewards(payload: Payload, eventId: string): Promise<void> {
  // Получаем событие с полными данными
  const event = await payload.findByID({
    collection: 'events',
    id: eventId,
  })

  if (!event) {
    console.error(`Event ${eventId} not found`)
    return
  }

  if (event.status !== 'completed') {
    console.warn(`Event ${eventId} is not completed yet`)
    return
  }

  // Получаем все ответы на это событие
  const { docs: responses } = await payload.find({
    collection: 'event-responses',
    where: {
      event: {
        equals: eventId,
      },
    },
    limit: 10000,
  })

  if (responses.length === 0) {
    console.log(`No responses found for event "${event.name}"`)
    return
  }

  console.log(`Processing ${responses.length} responses for event "${event.name}"`)

  // Обрабатываем каждый ответ
  for (const response of responses) {
    let correctAnswersCount = 0
    let totalReward = 0

    // Проверяем каждый ответ пользователя
    for (const answer of response.answers || []) {
      const questionIndex = answer.questionIndex
      const question = event.questions?.[questionIndex]

      if (!question) {
        console.warn(`Question with index ${questionIndex} not found in event ${eventId}`)
        continue
      }

      // Проверяем ответ в зависимости от типа вопроса
      let isCorrect = false

      if (question.questionType === 'yes-no') {
        // Для yes-no проверяем selectedAnswer
        isCorrect = answer.selectedAnswer === question.correctAnswer
      } else if (question.questionType === 'single-choice') {
        // Для single-choice проверяем один выбранный вариант
        const selectedOptionIndex = answer.selectedOptions?.[0]?.optionIndex
        if (selectedOptionIndex !== undefined) {
          const selectedOption = question.options?.[selectedOptionIndex]
          isCorrect = selectedOption?.isCorrect === true
        }
      } else if (question.questionType === 'multiple-choice') {
        // Для multiple-choice проверяем, что выбраны ВСЕ правильные и НЕ выбраны неправильные
        const selectedIndices = answer.selectedOptions?.map((opt) => opt.optionIndex) || []
        const correctIndices =
          question.options
            ?.map((opt, idx) => (opt.isCorrect ? idx : -1))
            .filter((idx) => idx !== -1) || []

        // Проверяем совпадение множеств
        const selectedSet = new Set(selectedIndices)
        const correctSet = new Set(correctIndices)

        isCorrect =
          selectedSet.size === correctSet.size &&
          [...selectedSet].every((idx) => correctSet.has(idx))
      } else if (question.questionType === 'driver-select') {
        // Для driver-select проверяем выбранного пилота
        const selectedDriverId = normalizeID(answer.selectedDriver)
        const correctDriverId = normalizeID(question.correctDriver)
        isCorrect = !!selectedDriverId && !!correctDriverId && selectedDriverId === correctDriverId
      } else if (question.questionType === 'team-select') {
        // Для team-select проверяем выбранную команду
        const selectedTeamId = normalizeID(answer.selectedTeam)
        const correctTeamId = normalizeID(question.correctTeam)
        isCorrect = !!selectedTeamId && !!correctTeamId && selectedTeamId === correctTeamId
      }

      if (isCorrect) {
        correctAnswersCount++
        // Добавляем награду за этот вопрос
        totalReward += question.rewardPoints || 0
      }
    }

    // Используем накопленную награду
    const reward = totalReward

    // Обновляем EventResponse
    await payload.update({
      collection: 'event-responses',
      id: response.id,
      data: {
        correctAnswersCount,
        reward,
      },
    })

    // Обновляем статистику пользователя в зависимости от типа награды
    if (reward > 0) {
      const userId = normalizeID(response.user)

      if (event.rewardType === 'points') {
        // Начисляем очки - обновляем SeasonStats
        const currentYear = new Date().getFullYear()
        const { docs: existingStats } = await payload.find({
          collection: 'season-stats',
          where: {
            and: [
              { user: { equals: userId } },
              { season: { equals: event.season || currentYear } },
            ],
          },
          limit: 1,
        })

        if (existingStats.length > 0) {
          const stat = existingStats[0]
          await payload.update({
            collection: 'season-stats',
            id: stat.id,
            data: {
              totalPoints: (stat.totalPoints || 0) + reward,
              totalPointsWithSeasonPrediction:
                (stat.totalPointsWithSeasonPrediction || stat.totalPoints || 0) + reward,
            },
          })
        } else {
          // Создаем новую статистику
          await payload.create({
            collection: 'season-stats',
            data: {
              user: userId,
              season: event.season || currentYear,
              totalPoints: reward,
              totalPointsWithSeasonPrediction: reward,
              seasonPredictionPoints: 0,
              predictionsCount: 0,
              perfectPredictions: 0,
              currentStreak: 0,
              bestStreak: 0,
              raceHistory: [],
              lastCalculated: new Date().toISOString(),
            },
          })
        }
      } else if (event.rewardType === 'pit-coins') {
        // Начисляем Pit Coins - обновляем Users
        const user = await payload.findByID({
          collection: 'users',
          id: userId,
        })

        if (user) {
          await payload.update({
            collection: 'users',
            id: userId,
            data: {
              pitCoins: (user.pitCoins || 0) + reward,
            },
          })
        }
      }

      console.log(
        `User ${userId}: ${correctAnswersCount}/${response.answers?.length || 0} correct, reward: ${reward} ${event.rewardType}`,
      )
    }
  }

  console.log(`✅ Rewards calculated for event "${event.name}"`)
}
