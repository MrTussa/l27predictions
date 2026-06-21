import type { Payload } from 'payload'
import { normalizeID } from './normalizeID'

/**
 * Начисляет награды за завершенное событие
 * Вызывается когда событие переводится в статус 'completed'
 *
 * @param payload - Payload instance
 * @param eventId - ID события
 */
export async function calculateEventRewards(payload: Payload, eventId: string): Promise<void> {
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

  const season = event.season || new Date().getFullYear()

  const graded = responses.map((response) => {
    let correctAnswersCount = 0
    let reward = 0

    for (const answer of response.answers || []) {
      const question = event.questions?.[answer.questionIndex]

      if (!question) {
        console.warn(`Question with index ${answer.questionIndex} not found in event ${eventId}`)
        continue
      }

      let isCorrect = false

      if (question.questionType === 'yes-no') {
        isCorrect = answer.selectedAnswer === question.correctAnswer
      } else if (question.questionType === 'single-choice') {
        const selectedOptionIndex = answer.selectedOptions?.[0]?.optionIndex
        if (selectedOptionIndex !== undefined) {
          const selectedOption = question.options?.[selectedOptionIndex]
          isCorrect = selectedOption?.isCorrect === true
        }
      } else if (question.questionType === 'multiple-choice') {
        const selectedIndices = answer.selectedOptions?.map((opt) => opt.optionIndex) || []
        const correctIndices =
          question.options
            ?.map((opt, idx) => (opt.isCorrect ? idx : -1))
            .filter((idx) => idx !== -1) || []

        const selectedSet = new Set(selectedIndices)
        const correctSet = new Set(correctIndices)

        isCorrect =
          selectedSet.size === correctSet.size &&
          [...selectedSet].every((idx) => correctSet.has(idx))
      } else if (question.questionType === 'driver-select') {
        const selectedDriverId = normalizeID(answer.selectedDriver)
        const correctDriverId = normalizeID(question.correctDriver)
        isCorrect = !!selectedDriverId && !!correctDriverId && selectedDriverId === correctDriverId
      } else if (question.questionType === 'team-select') {
        const selectedTeamId = normalizeID(answer.selectedTeam)
        const correctTeamId = normalizeID(question.correctTeam)
        isCorrect = !!selectedTeamId && !!correctTeamId && selectedTeamId === correctTeamId
      }

      if (isCorrect) {
        correctAnswersCount++
        reward += question.rewardPoints || 0
      }
    }

    return { response, userId: normalizeID(response.user), correctAnswersCount, reward }
  })

  const writes: Promise<unknown>[] = graded.map((g) =>
    payload.update({
      collection: 'event-responses',
      id: g.response.id,
      data: { correctAnswersCount: g.correctAnswersCount, reward: g.reward },
    }),
  )

  const rewarded = graded.filter((g) => g.reward > 0 && g.userId)
  const userIds = rewarded.map((g) => g.userId as string)

  if (rewarded.length > 0 && event.rewardType === 'points') {
    const { docs: stats } = await payload.find({
      collection: 'season-stats',
      where: { and: [{ user: { in: userIds } }, { season: { equals: season } }] },
      limit: 10000,
      depth: 0,
    })
    const statByUser = new Map(stats.map((s) => [normalizeID(s.user), s]))

    for (const g of rewarded) {
      const stat = statByUser.get(g.userId as string)
      if (stat) {
        writes.push(
          payload.update({
            collection: 'season-stats',
            id: stat.id,
            data: {
              totalPoints: (stat.totalPoints || 0) + g.reward,
              totalPointsWithSeasonPrediction:
                (stat.totalPointsWithSeasonPrediction || stat.totalPoints || 0) + g.reward,
            },
          }),
        )
      } else {
        writes.push(
          payload.create({
            collection: 'season-stats',
            data: {
              user: g.userId as string,
              season,
              totalPoints: g.reward,
              totalPointsWithSeasonPrediction: g.reward,
              seasonPredictionPoints: 0,
              predictionsCount: 0,
              perfectPredictions: 0,
              currentStreak: 0,
              bestStreak: 0,
              raceHistory: [],
              lastCalculated: new Date().toISOString(),
            },
          }),
        )
      }
    }
  } else if (rewarded.length > 0 && event.rewardType === 'pit-coins') {
    const { docs: users } = await payload.find({
      collection: 'users',
      where: { id: { in: userIds } },
      limit: 10000,
      depth: 0,
    })
    const userById = new Map(users.map((u) => [String(u.id), u]))

    for (const g of rewarded) {
      const user = userById.get(g.userId as string)
      if (!user) continue
      writes.push(
        payload.update({
          collection: 'users',
          id: g.userId as string,
          data: { pitCoins: (user.pitCoins || 0) + g.reward },
        }),
      )
    }
  }

  await Promise.all(writes)

  console.log(`✅ Rewards calculated for event "${event.name}" (${rewarded.length} users rewarded)`)
}
