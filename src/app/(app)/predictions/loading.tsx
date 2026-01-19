import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function PredictionsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-8 pt-8">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
            {/* Podium секция */}
            <div className="p-1">
              <Skeleton variant="title" className="w-64 h-8 mx-auto mb-6" />
              <div className="flex justify-center items-end gap-4 min-h-[400px]">
                {/* 2 место */}
                <Skeleton className="w-[240px] h-[320px] clip-path-cut-corner" />
                {/* 1 место */}
                <Skeleton className="w-[260px] h-[340px] clip-path-cut-corner" />
                {/* 3 место */}
                <Skeleton className="w-[220px] h-[300px] clip-path-cut-corner" />
              </div>
            </div>

            {/* Карточка результатов */}
            <Card variant="gray" corners="cut-corner" className="p-1 sticky top-8">
              <div className="px-4">
                <Skeleton variant="title" className="w-40 h-6 mx-auto mb-4" />
                <div className="space-y-4 mb-4">
                  {/* Очки */}
                  <div className="text-center">
                    <Skeleton className="w-12 h-4 mx-auto mb-2" />
                    <Skeleton className="w-20 h-12 mx-auto" />
                  </div>

                  {/* Мой прогноз */}
                  <div>
                    <Skeleton className="w-28 h-4 mb-3" />
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 bg-background/50 p-3 border border-accent/20 mb-2"
                      >
                        <Skeleton variant="circle" className="w-8 h-8 shrink-0" />
                        <Skeleton className="flex-1 h-4" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Кнопка */}
                <Skeleton className="w-full h-10" />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Race Carousel */}
      <div className="relative py-8 overflow-hidden">
        <div className="flex gap-4 px-16 py-4 justify-center">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton
              key={i}
              className={`shrink-0 w-48 h-48 rounded-lg ${
                i === 3 ? 'scale-110' : 'scale-90 opacity-50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
