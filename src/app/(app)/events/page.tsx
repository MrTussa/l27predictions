import { Heading, Panel } from '@/components/Broadcast'
import { RenderParams } from '@/components/RenderParams'
import { getServerSideUser } from '@/utilities/getServerSideUser'
import { getEvents, getUserEventResponses } from '@/utilities/queries'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import type { Metadata } from 'next'
import { EventCard } from './_components/EventCard'

export const metadata: Metadata = {
  title: 'События',
  description: 'Участвуйте в голосованиях, квизах и предсказаниях для получения наград',
  openGraph: mergeOpenGraph({ title: 'События', url: '/events' }),
}

export default async function EventsPage() {
  const [{ user }, events] = await Promise.all([
    getServerSideUser(),
    getEvents(['open', 'closed', 'completed']),
  ])

  const userResponses = user ? await getUserEventResponses(user.id) : []

  const responseFor = (eventId: string) =>
    userResponses.find((response) => {
      const responseEventId =
        typeof response.event === 'object' ? response.event.id : response.event
      return responseEventId === eventId
    })

  const sections = [
    {
      title: 'Открытые',
      aside: 'можно ответить',
      events: events.filter((e) => e.status === 'open'),
    },
    {
      title: 'Завершённые',
      aside: 'приём ответов закрыт',
      events: events.filter((e) => e.status !== 'open'),
    },
  ].filter((section) => section.events.length > 0)

  return (
    <div className="container mx-auto space-y-10 px-4 py-6 md:px-16">
      <RenderParams />
      <div>
        <h1 className="text-4xl font-bold uppercase tracking-tight">События</h1>
        <p className="mt-2 text-muted-foreground">
          Участвуйте в голосованиях, квизах и предсказаниях для получения наград
        </p>
      </div>

      {sections.length === 0 ? (
        <Panel bodyClassName="py-8 text-center text-muted-foreground">
          Пока нет доступных событий
        </Panel>
      ) : (
        sections.map((section, i) => (
          <section key={section.title}>
            <Heading index={String(i + 1).padStart(2, '0')} aside={section.aside}>
              {section.title}
            </Heading>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {section.events.map((event) => {
                const userResponse = responseFor(event.id)
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
          </section>
        ))
      )}
    </div>
  )
}
