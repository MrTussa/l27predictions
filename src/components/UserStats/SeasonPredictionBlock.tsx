import { Card } from '@/components/ui/card'
import type { Driver, EventResponse, Event as F1Event, Team } from '@/payload-types'
import { formatDate } from '@/utilities/formatDate'
import configPromise from '@payload-config'
import Image from 'next/image'
import { getPayload } from 'payload'

interface SeasonPredictionBlockProps {
  userId: string
  season: number
  timeZone: string
}

export async function SeasonPredictionBlock({
  userId,
  season,
  timeZone,
}: SeasonPredictionBlockProps) {
  const payload = await getPayload({ config: configPromise })
  const { docs: seasonEvents } = await payload.find({
    collection: 'events',
    where: {
      and: [{ eventType: { equals: 'season-prediction' } }, { season: { equals: season } }],
    },
    depth: 1,
    pagination: false,
    limit: 1,
  })

  const seasonEvent = seasonEvents[0] as F1Event | undefined

  if (!seasonEvent) {
    return null
  }

  const { docs: responses } = await payload.find({
    collection: 'event-responses',
    where: {
      and: [{ user: { equals: userId } }, { event: { equals: seasonEvent.id } }],
    },
    limit: 1,
    depth: 2,
  })

  const response = responses[0] as EventResponse | undefined

  if (!response) {
    return null
  }

  const answers = response.answers || []
  const questions = seasonEvent.questions || []

  const driverAnswers: Array<{ question: string; driver: Driver | null; points: number }> = []
  const teamAnswers: Array<{ question: string; team: Team | null; points: number }> = []

  for (const answer of answers) {
    const question = questions[answer.questionIndex]
    if (!question) continue

    if (question.questionType === 'driver-select') {
      const driver = (
        typeof answer.selectedDriver === 'object' ? answer.selectedDriver : null
      ) as Driver | null
      driverAnswers.push({
        question: question.questionText || '',
        driver,
        points: question.rewardPoints || 0,
      })
    } else if (question.questionType === 'team-select') {
      const team = (
        typeof answer.selectedTeam === 'object' ? answer.selectedTeam : null
      ) as Team | null
      teamAnswers.push({
        question: question.questionText || '',
        team,
        points: question.rewardPoints || 0,
      })
    }
  }

  const maxReward = questions.reduce((sum, q) => sum + (q.rewardPoints || 0), 0)
  const currentReward = response.reward || 0
  const isCompleted = seasonEvent.status === 'completed'

  return (
    <Card variant="default" corners="sharp" className="p-0.5">
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold uppercase tracking-tight mb-2">Сезонный прогноз</h3>
            <p className="text-sm text-muted-foreground">
              {isCompleted
                ? `Набрано ${currentReward} из ${maxReward} коинов`
                : 'Результаты появятся после завершения сезона'}
            </p>
          </div>
        </div>

        {/* Прогнозы на пилотов */}
        {driverAnswers.length > 0 && (
          <div className="space-y-3">
            {driverAnswers.map((answer, index) => {
              const driver = answer.driver
              const photo = driver && typeof driver.photo === 'object' ? driver.photo : null
              const team = driver && typeof driver.team === 'object' ? driver.team : null
              const teamColor = team?.teamColor ?? '#FFDF2C'
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-md bg-muted/20"
                  style={{
                    backgroundColor: `color-mix(in srgb, #000 100%, ${teamColor} 50%)`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-primary-foreground font-bold">
                      {index + 1}
                    </div>
                    {photo?.url && (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden">
                        <Image
                          src={photo.url}
                          alt={driver?.name || 'Driver'}
                          fill
                          className="object-cover object-top"
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{driver?.name || 'Неизвестно'}</p>
                      <p className="text-xs text-muted-foreground">{answer.question}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-accent">{answer.points} коинов</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Прогнозы на команды */}
        {teamAnswers.length > 0 && (
          <div className="space-y-3">
            {teamAnswers.map((answer, index) => {
              const team = answer.team
              const logo = team && typeof team.logo === 'object' ? team.logo : null
              return (
                <div
                  key={index}
                  className="relative flex items-center justify-between p-3 rounded-md bg-muted/20"
                >
                  {logo?.url && (
                    <div className="absolute w-full h-4/5">
                      <Image src={logo.url} alt={logo.alt} fill className="object-fill " />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{team?.name || 'Неизвестно'}</p>
                      <p className="text-xs text-muted-foreground">{answer.question}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-accent">{answer.points} коинов</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {response.submittedAt && (
          <p className="text-xs text-muted-foreground text-center">
            Прогноз сделан: {formatDate(response.submittedAt, timeZone, 'short')}
          </p>
        )}
      </div>
    </Card>
  )
}
