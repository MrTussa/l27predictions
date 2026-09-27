import { Caption, Panel } from '@/components/Broadcast'
import { Event } from '@/payload-types'
import { plural } from '@/utilities/plural'
import { IconAlertTriangle } from '@tabler/icons-react'
import { rewardLabel, totalReward } from '../../_components/EventCard'

type Props = {
  event: Event
}

export const EventHeader: React.FC<Props> = ({ event }) => {
  const questions = event.questions?.length || 0

  return (
    <Panel variant="yellow-glow" className="mb-6" bodyClassName="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <span className="clip-path-cut-corner-xs inline-block bg-accent px-2 py-0.5 font-mono text-xs font-black text-black">
            Событие
          </span>
          <h1 className="text-3xl font-bold uppercase leading-snug tracking-tight">{event.name}</h1>
          {event.description && <p className="text-muted-foreground">{event.description}</p>}
        </div>
        <div className="shrink-0 text-right">
          <div className="text-4xl font-black leading-none tabular-nums text-accent">
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

      <div className="clip-path-cut-corner-sm flex items-center gap-2 bg-accent/10 px-3 py-2 text-sm text-accent">
        <IconAlertTriangle className="size-4 shrink-0" />
        После отправки ответы изменить нельзя
      </div>
    </Panel>
  )
}
