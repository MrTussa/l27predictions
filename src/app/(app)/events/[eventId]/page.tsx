import { getServerSideUser } from '@/utilities/getServerSideUser'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getDrivers, getEventById, getTeams, getUserEventResponse } from '@/utilities/queries'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { EventForm } from './_components/EventForm'
import { EventHeader } from './_components/EventHeader'


type Props = {
  params: Promise<{
    eventId: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { eventId } = await params
    const event = await getEventById(eventId)
    if (!event) return { title: 'Событие' }
    return {
      title: event.name,
      description: `Участвуйте в событии ${event.name}`,
      openGraph: mergeOpenGraph({ title: event.name, url: `/events/${eventId}` }),
    }
  } catch {
    return { title: 'Событие' }
  }
}

export default async function EventDetailPage({ params }: Props) {
  const { eventId } = await params
  const [{ user }, event] = await Promise.all([
    getServerSideUser(),
    getEventById(eventId).catch(() => null),
  ])

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(`/events/${eventId}`)}`)
  }

  if (!event || event.status === 'draft') {
    notFound()
  }

  if (event.status !== 'open') {
    redirect(`/events?warning=${encodeURIComponent('Приём ответов на это событие закрыт')}`)
  }

  const [existingResponse, drivers, teams] = await Promise.all([
    getUserEventResponse(user.id, eventId),
    getDrivers({ activeOnly: true, sort: 'name' }),
    getTeams({ activeOnly: true }),
  ])

  if (existingResponse) {
    redirect(`/events?warning=${encodeURIComponent('Вы уже ответили на это событие')}`)
  }

  return (
    <div className="container mx-auto px-4 md:px-16 py-6 max-w-3xl">
      {/* Event Header */}
      <EventHeader event={event} />

      {/* Event Form */}
      <EventForm event={event} drivers={drivers} teams={teams} />
    </div>
  )
}
