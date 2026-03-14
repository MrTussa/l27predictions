import { canMakePrediction } from '@/utilities/raceStatus'
import type { PayloadRequest } from 'payload'
import { addDataAndFileToRequest } from 'payload'

export const updatePrediction = async (req: PayloadRequest) => {
  try {
    await addDataAndFileToRequest(req)

    if (!req.user) {
      return Response.json({ message: 'Необходима авторизация' }, { status: 401 })
    }

    const predictionId = req.routeParams?.id as string

    if (!predictionId) {
      return Response.json({ message: 'ID прогноза не указан' }, { status: 400 })
    }

    const { predictions } = req.data || {}

    if (!predictions || predictions.length !== 3) {
      return Response.json({ message: 'Необходимо заполнить все 3 позиции' }, { status: 400 })
    }

    const existingPrediction = await req.payload.findByID({
      collection: 'predictions',
      id: predictionId,
      depth: 1,
    })

    if (!existingPrediction) {
      return Response.json({ message: 'Прогноз не найден' }, { status: 404 })
    }

    const predictionUserId =
      typeof existingPrediction.user === 'object'
        ? existingPrediction.user.id
        : existingPrediction.user

    if (predictionUserId !== req.user.id) {
      return Response.json({ message: 'Нет доступа к этому прогнозу' }, { status: 403 })
    }

    const raceId =
      typeof existingPrediction.race === 'object'
        ? existingPrediction.race.id
        : existingPrediction.race

    const race = await req.payload.findByID({
      collection: 'races',
      id: raceId,
    })

    if (!race) {
      return Response.json({ message: 'Гонка не найдена' }, { status: 404 })
    }

    if (!canMakePrediction(race)) {
      return Response.json({ message: 'Окно прогнозов для этой гонки закрыто' }, { status: 400 })
    }

    const updatedPrediction = await req.payload.update({
      collection: 'predictions',
      id: predictionId,
      overrideAccess: true,
      data: {
        predictions: predictions,
      },
    })

    return Response.json({
      message: 'Прогноз успешно обновлен',
      prediction: updatedPrediction,
    })
  } catch (error: unknown) {
    console.error('[updatePrediction] Unexpected error:', error)
    const message = error instanceof Error ? error.message : 'Внутренняя ошибка сервера'
    return Response.json({ message }, { status: 500 })
  }
}
