import type { PayloadRequest } from 'payload'
import { addDataAndFileToRequest } from 'payload'
import { canMakePrediction } from '@/utilities/raceStatus'

export const createPrediction = async (req: PayloadRequest) => {
  try {
    await addDataAndFileToRequest(req)

    if (!req.user) {
      return Response.json({ message: 'Необходима авторизация' }, { status: 401 })
    }

    const { race: raceId, predictions } = req.data || {}

    if (!predictions || predictions.length !== 3) {
      return Response.json({ message: 'Необходимо заполнить все 3 позиции' }, { status: 400 })
    }

    const race = await req.payload.findByID({
      collection: 'races',
      id: raceId,
    })

    if (!race) {
      return Response.json({ message: 'Гонка не найдена' }, { status: 404 })
    }

    // Проверяем возможность создания прогноза (используем унифицированную функцию)
    if (!canMakePrediction(race)) {
      return Response.json({ message: 'Окно прогнозов для этой гонки закрыто' }, { status: 400 })
    }

    const existingPrediction = await req.payload.find({
      collection: 'predictions',
      where: {
        and: [
          {
            user: {
              equals: req.user.id,
            },
          },
          {
            race: {
              equals: raceId,
            },
          },
        ],
      },
      limit: 1,
    })

    if (existingPrediction.docs.length > 0) {
      return Response.json(
        { message: 'Прогноз для этой гонки уже существует. Используйте обновление.' },
        { status: 400 },
      )
    }

    const newPrediction = await req.payload.create({
      collection: 'predictions',
      data: {
        user: req.user.id,
        race: raceId,
        predictions: predictions,
      },
    })

    return Response.json(
      {
        message: 'Прогноз успешно сохранен',
        prediction: newPrediction,
      },
      { status: 201 },
    )
  } catch (error: any) {
    return Response.json({ message: error.message || 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
