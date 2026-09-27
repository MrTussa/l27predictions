import { ACCENT, Caption, Panel } from '@/components/Broadcast'
import { Button } from '@/components/ui/button'
import { Event } from '@/payload-types'
import { plural } from '@/utilities/plural'
import { IconCheck, IconLock, IconTrophy } from '@tabler/icons-react'
import Link from 'next/link'

type Props = {
  event: Event
  hasResponded?: boolean
  userResponse?: {
    correctAnswersCount?: number
    reward?: number
  }
}

const STATUS = {
  open: { label: 'Открыто', color: ACCENT, icon: IconCheck },
  closed: { label: 'Закрыто', color: '#fb923c', icon: IconLock },
  completed: { label: 'Завершено', color: '#8b8b9a', icon: IconTrophy },
} as const

/** Награда за событие: очки чемпионата или Pit Coins */
export const rewardLabel = (event: Event) => (event.rewardType === 'points' ? 'очков' : 'Pit Coins')

export const totalReward = (event: Event) =>
  event.questions?.reduce((sum, q) => sum + (q.rewardPoints || 0), 0) || 0

export const EventCard: React.FC<Props> = ({ event, hasResponded, userResponse }) => {
  const status = event.status === 'draft' ? null : STATUS[event.status]
  const questions = event.questions?.length || 0
  const canParticipate = event.status === 'open' && !hasResponded

  return (
    <Panel
      accent={status?.color}
      className="h-full"
      bodyClassName="flex h-full flex-col justify-between gap-4"
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-1">
            {status && (
              <span
                className="clip-path-cut-corner-xs inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{
                  color: status.color,
                  background: `color-mix(in srgb, ${status.color} 15%, transparent)`,
                }}
              >
                <status.icon className="size-3" />
                {status.label}
              </span>
            )}
            <h3 className="text-lg font-bold uppercase leading-snug tracking-wide">{event.name}</h3>
            {event.description && (
              <p className="text-sm text-muted-foreground">{event.description}</p>
            )}
          </div>

          {/* Награда — главная цифра карточки */}
          <div className="shrink-0 text-right">
            <div className="text-3xl font-black leading-none tabular-nums text-accent">
              +{totalReward(event)}
            </div>
            <div className="pt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {rewardLabel(event)}
            </div>
          </div>
        </div>

        <Caption>
          {questions} {plural(questions, ['вопрос', 'вопроса', 'вопросов'])} · награда за все ответы
        </Caption>

        {hasResponded && userResponse && (
          <div className="clip-path-cut-corner-sm flex items-center justify-between gap-3 bg-black/30 px-3 py-2">
            <div>
              <Caption>Ваш результат</Caption>
              <div className="text-sm font-bold">
                Правильных ответов: {userResponse.correctAnswersCount || 0} из {questions}
              </div>
            </div>
            {(userResponse.reward ?? 0) > 0 && (
              <div className="shrink-0 text-xl font-black tabular-nums text-[#00d26a]">
                +{userResponse.reward}
              </div>
            )}
          </div>
        )}
      </div>

      {canParticipate ? (
        <Button asChild className="w-full">
          <Link href={`/events/${event.id}`}>Принять участие</Link>
        </Button>
      ) : event.status === 'open' && hasResponded ? (
        <Button disabled className="w-full">
          Вы уже участвовали
        </Button>
      ) : null}
    </Panel>
  )
}
