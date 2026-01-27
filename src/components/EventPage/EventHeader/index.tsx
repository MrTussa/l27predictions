'use client'

import { Card } from '@/components/ui/card'
import { Event } from '@/payload-types'
import { IconTrophy, IconCoins, IconCalendar } from '@tabler/icons-react'

type Props = {
  event: Event
}

export const EventHeader: React.FC<Props> = ({ event }) => {
  const getRewardIcon = () => {
    return event.rewardType === 'points' ? (
      <IconTrophy className="w-5 h-5" />
    ) : (
      <IconCoins className="w-5 h-5" />
    )
  }

  const getRewardLabel = () => {
    return event.rewardType === 'points' ? 'очков' : 'Pit Coins'
  }

  return (
    <Card variant="default" corners="cut-corner" className="p-0.5 mb-6">
      <div className="p-6 space-y-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tight mb-2">{event.name}</h1>
          {event.description && <p className="text-muted-foreground">{event.description}</p>}
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            {getRewardIcon()}
            <span>
              {event.questions?.reduce((sum, q) => sum + (q.rewardPoints || 0), 0) || 0}{' '}
              {getRewardLabel()} за все вопросы
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconCalendar className="w-5 h-5" />
            <span>{event.questions?.length || 0} вопросов</span>
          </div>
        </div>

        <div className="p-3 rounded-md bg-blue-500/10 border border-blue-500/20">
          <p className="text-sm text-blue-500">
            <strong>Важно:</strong> После отправки ответов изменить их будет невозможно
          </p>
        </div>
      </div>
    </Card>
  )
}
