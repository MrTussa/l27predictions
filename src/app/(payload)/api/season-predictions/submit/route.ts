import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getServerSideUser } from '@/utilities/getServerSideUser'

/**
 * POST /api/season-predictions/submit
 * Создает или обновляет сезонный прогноз пользователя
 */
export async function POST(req: Request) {
  try {
    const { user } = await getServerSideUser()

    // Только авторизованные пользователи
    if (!user) {
      return Response.json({ error: 'Необходима авторизация' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const body = await req.json()
    const { season, driverChampion, driver2nd, driver3rd, constructorChampion } = body

    // Валидация обязательных полей
    if (!season || !driverChampion || !driver2nd || !driver3rd || !constructorChampion) {
      return Response.json(
        { error: 'Все поля должны быть заполнены' },
        { status: 400 },
      )
    }

    // Проверяем, есть ли уже прогноз для этого пользователя и сезона
    const { docs: existing } = await payload.find({
      collection: 'season-predictions',
      where: {
        and: [
          {
            user: {
              equals: user.id,
            },
          },
          {
            season: {
              equals: season,
            },
          },
        ],
      },
      limit: 1,
    })

    let result

    if (existing.length > 0) {
      // Обновляем существующий прогноз
      result = await payload.update({
        collection: 'season-predictions',
        id: existing[0].id,
        data: {
          driverChampion,
          driver2nd,
          driver3rd,
          constructorChampion,
        },
      })

      return Response.json({
        success: true,
        message: 'Прогноз обновлен',
        prediction: result,
      })
    } else {
      // Создаем новый прогноз
      result = await payload.create({
        collection: 'season-predictions',
        data: {
          user: user.id,
          season,
          driverChampion,
          driver2nd,
          driver3rd,
          constructorChampion,
        },
      })

      return Response.json({
        success: true,
        message: 'Прогноз создан',
        prediction: result,
      })
    }
  } catch (error: any) {
    console.error('Error submitting season prediction:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
