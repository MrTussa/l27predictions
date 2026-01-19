import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function EventsLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Заголовок */}
      <div className="mb-8">
        <Skeleton variant="title" className="w-48 h-10 mb-2" />
        <Skeleton className="w-96 h-4" />
      </div>

      {/* Сетка EventCard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} variant="default" corners="cut-corner" className="p-0.5">
            <div className="p-4 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <Skeleton variant="title" className="w-3/4 h-6" />
                  <Skeleton className="w-full h-4" />
                </div>
                <Skeleton className="w-20 h-6 rounded shrink-0" />
              </div>

              {/* Info */}
              <div className="flex flex-wrap gap-4">
                <Skeleton className="w-40 h-4" />
                <Skeleton className="w-24 h-4" />
              </div>

              {/* Reward */}
              <div className="flex items-center gap-2">
                <Skeleton variant="circle" className="w-5 h-5" />
                <Skeleton className="w-32 h-4" />
              </div>

              {/* Button */}
              <Skeleton className="w-full h-10" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
