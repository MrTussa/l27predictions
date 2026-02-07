import { EventCard } from '@/components/EventPage/EventCard'
import { getServerSideUser } from '@/utilities/getServerSideUser'
import { getEvents, getUserEventResponses } from '@/utilities/queries'

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const { user } = await getServerSideUser()

  const events = await getEvents(['open', 'closed', 'completed'])

  const userResponses = user ? await getUserEventResponses(user.id) : []

  return (
    <div className="container mx-auto px-4 md:px-16 py-6">
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
                        correctAnswersCount: userResponse.correctAnswersCount ?? undefined,
                        reward: userResponse.reward ?? undefined,
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
