import { Race, User } from '@/payload-types'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Calendar, Clock, Flag } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import Image from 'next/image'

type RaceCardProps = {
  race: Race
  user: User | null
  status: 'open' | 'upcoming' | 'closed'
}

export const RaceCard: React.FC<RaceCardProps> = ({ race, status }) => {
  const raceDate = new Date(race.raceDate)
  const openDate = new Date(race.predictionOpenDate)
  const closeDate = new Date(race.predictionCloseDate)

  const flagImage = typeof race.countryFlag === 'object' ? race.countryFlag : null

  const statusConfig = {
    open: {
      badge: 'bg-accent/20 text-accent border border-accent/40 font-bold tracking-wider',
      badgeText: 'ОТКРЫТО',
      action: 'СДЕЛАТЬ ПРОГНОЗ',
      buttonVariant: 'default' as const,
      cardVariant: 'yellow' as const,
      corners: 'cut-corner' as const,
    },
    upcoming: {
      badge: 'bg-blue-500/20 text-blue-400 border border-blue-500/40 font-bold tracking-wider',
      badgeText: 'СКОРО',
      action: 'ПРОСМОТР',
      buttonVariant: 'outline' as const,
      cardVariant: 'default' as const,
      corners: 'sharp' as const,
    },
    closed: {
      badge: 'bg-muted/20 text-muted-foreground border border-muted font-bold tracking-wider',
      badgeText: 'ЗАВЕРШЕНА',
      action: 'РЕЗУЛЬТАТЫ',
      buttonVariant: 'outline' as const,
      cardVariant: 'gray' as const,
      corners: 'sharp' as const,
    },
  }

  const config = statusConfig[status]

  return (
    <Card
      variant={config.cardVariant}
      corners={config.corners}
      className="overflow-hidden group hover:scale-[1.02] transition-all duration-200 gap-0 py-0"
    >
      {/* Флаг страны */}
      <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        {flagImage && flagImage.url && (
          <Image
            src={flagImage.url}
            alt={race.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.badge}`}>
            {config.badgeText}
          </span>
        </div>
        <div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">
          Этап {race.round}
        </div>
      </div>

      {/* Информация о гонке */}
      <div className="p-5">
        <h3 className="font-bold text-lg mb-3 line-clamp-2">{race.name}</h3>

        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4" />
            <span>{format(raceDate, 'd MMMM yyyy, HH:mm', { locale: ru })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Открытие: {format(openDate, 'd MMM, HH:mm', { locale: ru })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Закрытие: {format(closeDate, 'd MMM, HH:mm', { locale: ru })}</span>
          </div>
        </div>

        <Button asChild variant={config.buttonVariant} className="w-full font-bold tracking-wide">
          <Link href={`/predictions/${race.id}`}>{config.action}</Link>
        </Button>
      </div>
    </Card>
  )
}
