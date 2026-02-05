import { Card } from '@/components/ui/card'
import type { Race, User } from '@/payload-types'
import { IconCalendar, IconCheck, IconClock, IconFlag, IconUser, IconX } from '@tabler/icons-react'
import Link from 'next/link'

interface AboutRaceProps {
  race: Race
  isPredictionOpen: boolean
  isPredictionClosed: boolean
  hasUserPrediction: boolean
  recentPredictors: User[]
}

export function AboutRace({
  race,
  isPredictionOpen,
  isPredictionClosed,
  hasUserPrediction,
  recentPredictors,
}: AboutRaceProps) {
  const raceDate = new Date(race.raceDate)
  const closeDate = new Date(race.predictionCloseDate)

  // Определяем статус
  let status: { text: string; icon: React.ReactElement; color: string } | null = null

  if (isPredictionClosed) {
    status = {
      text: 'Прогнозы закрыты',
      icon: <IconX className="w-4 h-4" />,
      color: 'text-red-500',
    }
  } else if (!isPredictionOpen) {
    status = {
      text: 'Прогнозы еще не открыты',
      icon: <IconClock className="w-4 h-4" />,
      color: 'text-blue-500',
    }
  } else if (hasUserPrediction) {
    status = {
      text: 'Вы проголосовали',
      icon: <IconCheck className="w-4 h-4" />,
      color: 'text-green-500',
    }
  } else if (isPredictionOpen) {
    status = {
      text: 'Прогнозы открыты',
      icon: <IconCheck className="w-4 h-4" />,
      color: 'text-accent',
    }
  }

  return (
    <Card variant="elevated" corners="cut-corner" className="h-fit sticky top-4 ">
      <div className="space-y-4 px-4">
        {/* Заголовок */}
        <div className="border-b border-muted pb-4">
          <div className="flex items-start gap-3">
            <IconFlag className="w-5 h-5 text-accent mt-1 shrink-0" />
            <div>
              <h2 className="text-xl font-bold">{race.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">Этап {race.round}</p>
            </div>
          </div>
        </div>

        {/* Дата начала гонки */}
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <IconCalendar className="w-4 h-4" />
            Начало гонки
          </div>
          <div className="text-base font-bold">
            {raceDate.toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>
          <div className="text-sm text-muted-foreground">
            {raceDate.toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>

        {/* Закрытие прогнозов */}
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <IconClock className="w-4 h-4" />
            Прогнозы до
          </div>
          <div className="text-base font-bold">
            {closeDate.toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
            })}
          </div>
          <div className="text-sm text-muted-foreground">
            {closeDate.toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>

        {/* Статус */}
        {status && (
          <div className="pt-4 border-t border-muted">
            <div
              className={`flex items-center gap-2 font-bold uppercase tracking-wider text-sm ${status.color}`}
            >
              {status.icon}
              {status.text}
            </div>
          </div>
        )}

        {/* Список проголосовавших */}
        {recentPredictors.length > 0 && (
          <div className="pt-4 border-t border-muted">
            <div className="text-sm text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <IconUser className="w-4 h-4" />
              Уже проголосовали ({recentPredictors.length})
            </div>
            <div className="space-y-2">
              {recentPredictors.map((user) => (
                <Link
                  key={user.id}
                  href={`/user/${user.id}`}
                  className="flex items-center gap-2 text-sm hover:text-accent transition-colors group"
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: user.chartColor || '#FFDF2C' }}
                  />
                  <span className="truncate group-hover:underline">
                    {user.nickname || user.email}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
