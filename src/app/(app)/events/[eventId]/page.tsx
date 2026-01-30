import { EventForm } from '@/components/EventPage/EventForm'
import { EventHeader } from '@/components/EventPage/EventHeader'
import { getServerSideUser } from '@/utilities/getServerSideUser'
import configPromise from '@payload-config'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

type Props = {
  params: Promise<{
    eventId: string
  }>
}

export default async function EventDetailPage({ params }: Props) {
  const { eventId } = await params
  const { user } = await getServerSideUser()
  const payload = await getPayload({ config: configPromise })

  if (!user) {
    redirect('/login')
  }

  const event = await payload.findByID({
    collection: 'events',
    id: eventId,
  })

  if (!event) {
    redirect('/events')
  }

  const { docs: existingResponses } = await payload.find({
    collection: 'event-responses',
    where: {
      and: [{ user: { equals: user.id } }, { event: { equals: eventId } }],
    },
    limit: 1,
  })

  const hasResponded = existingResponses.length > 0

  if (event.status !== 'open' || hasResponded) {
    redirect('/events')
  }

  const { docs: drivers } = await payload.find({
    collection: 'drivers',
    where: {
      isActive: { equals: true },
    },
    sort: 'name',
    limit: 100,
  })

  const { docs: teams } = await payload.find({
    collection: 'teams',
    where: {
      isActive: { equals: true },
    },
    sort: 'name',
    limit: 100,
  })

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      {/* Event Header */}
      <EventHeader event={event} />

      {/* Event Form */}
      <EventForm event={event} drivers={drivers} teams={teams} />
    </div>
  )
}
