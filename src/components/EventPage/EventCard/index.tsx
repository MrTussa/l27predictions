import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Event } from '@/payload-types'
import { IconCalendar, IconCheck, IconCoins, IconLock, IconTrophy } from '@tabler/icons-react'
import Link from 'next/link'

type Props = {
  event: Event
  hasResponded?: boolean
  userResponse?: {
    correctAnswersCount?: number
    reward?: number
  }
}

export const EventCard: React.FC<Props> = ({ event, hasResponded, userResponse }) => {
  const getStatusBadge = () => {
    switch (event.status) {
      case 'open':
        return (
          <div className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-green-500/20 text-green-500">
            <IconCheck className="w-3 h-3" />
            Открыто
          </div>
        )
      case 'closed':
        return (
          <div className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-orange-500/20 text-orange-500">
            <IconLock className="w-3 h-3" />
            Закрыто
          </div>
        )
      case 'completed':
        return (
          <div className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-500">
            <IconTrophy className="w-3 h-3" />
            Завершено
          </div>
        )
    }
  }

  const getRewardIcon = () => {
    return event.rewardType === 'points' ? (
      <IconTrophy className="w-4 h-4" />
    ) : (
      <IconCoins className="w-4 h-4" />
    )
  }

  const getRewardLabel = () => {
    return event.rewardType === 'points' ? 'очков' : 'Pit Coins'
  }

  const canParticipate = event.status === 'open' && !hasResponded

  return (
    <Card variant="default" corners="cut-corner" className="p-0.5">
      <div className="px-4  h-full flex flex-col justify-between gap-3">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="text-lg font-bold uppercase tracking-tight">{event.name}</h3>
              {event.description && (
                <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
              )}
            </div>
            {getStatusBadge()}
          </div>

          {/* Info */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              {getRewardIcon()}
              <span>
                {event.questions?.reduce((sum, q) => sum + (q.rewardPoints || 0), 0) || 0}{' '}
                {getRewardLabel()} за все вопросы
              </span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <IconCalendar className="w-4 h-4" />
              <span>{event.questions?.length || 0} вопросов</span>
            </div>
          </div>

          {/* User Response */}
          {hasResponded && userResponse && (
            <div className="p-3 rounded-md bg-muted/20 border border-border">
              <p className="text-sm font-medium">Ваш результат</p>
              <p className="text-xs text-muted-foreground mt-1">
                Правильных ответов: {userResponse.correctAnswersCount || 0} из{' '}
                {event.questions?.length || 0}
              </p>
              {userResponse.reward && userResponse.reward > 0 && (
                <p className="text-sm font-bold text-accent mt-1">
                  +{userResponse.reward} {getRewardLabel()}
                </p>
              )}
            </div>
          )}
        </div>
        <div>
          {/* Action Button */}
          {canParticipate ? (
            <Link href={`/events/${event.id}`}>
              <Button className="w-full">Принять участие</Button>
            </Link>
          ) : event.status === 'open' && hasResponded ? (
            <Button disabled className="w-full">
              Вы уже участвовали
            </Button>
          ) : event.status === 'completed' ? (
            <Link href={`/events/${event.id}/results`}>
              <Button variant="outline" className="w-full">
                Посмотреть результаты
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
    </Card>
  )
}
