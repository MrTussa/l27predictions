import { EventForm } from '@/components/EventPage/EventForm'
import { EventHeader } from '@/components/EventPage/EventHeader'
import { getServerSideUser } from '@/utilities/getServerSideUser'
import { getDrivers, getEventById, getTeams, getUserEventResponse } from '@/utilities/queries'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{
    eventId: string
  }>
}

export default async function EventDetailPage({ params }: Props) {
  const { eventId } = await params
  const { user } = await getServerSideUser()

  if (!user) {
    redirect('/login')
  }

  const event = await getEventById(eventId)

  if (!event) {
    redirect('/events')
  }

  const existingResponse = await getUserEventResponse(user.id, eventId)

  if (event.status !== 'open' || existingResponse) {
    redirect('/events')
  }

  const [drivers, teams] = await Promise.all([
    getDrivers({ activeOnly: true, sort: 'name' }),
    getTeams({ activeOnly: true }),
  ])

  return (
    <div className="container mx-auto px-4 md:px-16 py-6 max-w-3xl">
      {/* Event Header */}
      <EventHeader event={event} />

      {/* Event Form */}
      <EventForm event={event} drivers={drivers} teams={teams} />
    </div>
  )
}
