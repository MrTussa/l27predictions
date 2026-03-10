import { addDataAndFileToRequest, type PayloadRequest } from 'payload'

type RatingValue = 'bad' | 'normal' | 'good'

export const submitRaceRating = async (req: PayloadRequest) => {
  try {
    await addDataAndFileToRequest(req)
    if (!req.user) {
      return Response.json({ message: 'Необходима авторизация' }, { status: 401 })
    }

    const { raceId, rating } = (req.data || {}) as { raceId: string; rating: RatingValue }

    if (!raceId) {
      return Response.json({ message: 'ID гонки не указан' }, { status: 400 })
    }

    if (!rating || !['bad', 'normal', 'good'].includes(rating)) {
      return Response.json({ message: 'Оценка не указана либо неверна' }, { status: 400 })
    }

    const existing = await req.payload.find({
      collection: 'race-ratings',
      where: {
        and: [{ user: { equals: req.user.id } }, { race: { equals: raceId } }],
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      await req.payload.update({
        collection: 'race-ratings',
        id: existing.docs[0].id,
        data: { rating },
      })
    } else {
      await req.payload.create({
        collection: 'race-ratings',
        data: { user: req.user.id, race: raceId, rating },
      })
    }

    const updatedRace = await req.payload.findByID({
      collection: 'races',
      id: raceId,
    })

    return Response.json(
      {
        message: existing.docs.length > 0 ? 'Оценка обновлена' : 'Оценка сохранена',
        rating,
        raceRating: updatedRace?.rating ?? null,
      },
      { status: existing.docs.length > 0 ? 200 : 201 },
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Внутренняя ошибка сервера'
    return Response.json({ message }, { status: 500 })
  }
}
