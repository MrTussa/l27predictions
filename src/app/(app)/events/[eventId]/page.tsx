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

  // Получаем событие
  const event = await payload.findByID({
    collection: 'events',
    id: eventId,
  })

  if (!event) {
    redirect('/events')
  }

  // Проверяем, не отправлял ли пользователь уже ответ
  const { docs: existingResponses } = await payload.find({
    collection: 'event-responses',
    where: {
      and: [{ user: { equals: user.id } }, { event: { equals: eventId } }],
    },
    limit: 1,
  })

  const hasResponded = existingResponses.length > 0

  // Если событие не открыто или пользователь уже участвовал, редирект
  if (event.status !== 'open' || hasResponded) {
    redirect('/events')
  }

  // Получаем пилотов и команды для селектов (если нужны)
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
