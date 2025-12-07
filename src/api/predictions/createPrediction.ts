import { addDataAndFileToRequest } from 'payload'
import type { PayloadRequest } from 'payload'

export const createPrediction = async (req: PayloadRequest) => {
  try {
    // Добавляем данные из body в req
    await addDataAndFileToRequest(req)

    // Проверяем авторизацию
    if (!req.user) {
      return Response.json({ message: 'Необходима авторизация' }, { status: 401 })
    }

    const { race: raceId, predictions } = req.data || {}

    // Валидация: должно быть ровно 3 прогноза
    if (!predictions || predictions.length !== 3) {
      return Response.json({ message: 'Необходимо заполнить все 3 позиции' }, { status: 400 })
    }

    // Проверяем, что гонка существует и окно прогнозов открыто
    const race = await req.payload.findByID({
      collection: 'races',
      id: raceId,
    })

    if (!race) {
      return Response.json({ message: 'Гонка не найдена' }, { status: 404 })
    }

    const now = new Date()
    const closeDate = new Date(race.predictionCloseDate)

    if (now > closeDate) {
      return Response.json(
        { message: 'Окно прогнозов для этой гонки закрыто' },
        { status: 400 },
      )
    }

    // Проверяем, нет ли уже прогноза для этой гонки от этого пользователя
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

    // Создаем новый прогноз
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
    return Response.json(
      { message: error.message || 'Внутренняя ошибка сервера' },
      { status: 500 },
    )
  }
}
