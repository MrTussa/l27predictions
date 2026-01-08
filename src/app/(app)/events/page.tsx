import { EventCard } from '@/components/EventPage/EventCard'
import { getServerSideUser } from '@/utilities/getServerSideUser'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export default async function EventsPage() {
  const { user } = await getServerSideUser()
  const payload = await getPayload({ config: configPromise })

  // Получаем все открытые и завершенные события
  const { docs: events } = await payload.find({
    collection: 'events',
    where: {
      status: {
        in: ['open', 'closed', 'completed'],
      },
    },
    sort: '-openedAt',
    limit: 50,
  })

  // Получаем ответы пользователя (если авторизован)
  let userResponses: any[] = []
  if (user) {
    const { docs } = await payload.find({
      collection: 'event-responses',
      where: {
        user: {
          equals: user.id,
        },
      },
      limit: 100,
    })
    userResponses = docs
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-2">События</h1>
        <p className="text-muted-foreground">
          Участвуйте в голосованиях, квизах и предсказаниях для получения наград
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Пока нет доступных событий</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => {
            const userResponse = userResponses.find((response) => {
              const responseEventId =
                typeof response.event === 'object' ? response.event.id : response.event
              return responseEventId === event.id
            })

            return (
              <EventCard
                key={event.id}
                event={event}
                hasResponded={!!userResponse}
                userResponse={
                  userResponse
                    ? {
                        correctAnswersCount: userResponse.correctAnswersCount,
                        reward: userResponse.reward,
                      }
                    : undefined
                }
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
