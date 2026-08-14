import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function LeaderboardLoading() {
  return (
    <div className="px-4 md:px-16 py-6 space-y-6 max-w-450 mx-auto">
      {/* Верхняя зона: слева стопка, справа Топ-10 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          {/* Подиум сезона */}
          <Card variant="default" corners="cut-corner" className="relative overflow-hidden">
            <span className="absolute left-0 top-0 h-0.75 w-[calc(100%-18px)] bg-accent/40" />
            <div className="px-6 pt-6 pb-2">
              <div className="mb-6 flex items-center justify-between gap-3">
                <Skeleton variant="title" className="w-40 h-6" />
                <Skeleton className="w-24 h-3" />
              </div>
              <div className="grid grid-cols-3 gap-3 items-end">
                {['h-40', 'h-48', 'h-36'].map((h, i) => (
                  <Skeleton key={i} className={`w-full ${h} clip-path-cut-corner-sm`} />
                ))}
              </div>
            </div>
          </Card>

          {/* Рейтинг гонок */}
          <Card variant="default" corners="cut-corner">
            <div className="px-6 space-y-6">
              <Skeleton variant="title" className="w-40 h-6" />
              <div className="flex gap-4 overflow-hidden pb-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="min-w-43.75 max-w-43.75 shrink-0 space-y-2 rounded border border-muted/30 p-3"
                  >
                    <Skeleton className="w-full h-20" />
                    <Skeleton className="w-24 h-3" />
                    <Skeleton className="w-16 h-3" />
                    <Skeleton className="w-full h-2 rounded-full" />
                    <Skeleton className="w-20 h-3" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Топ-10 график */}
        <Card variant="default" corners="cut-corner" className="h-full">
          <div className="w-full space-y-4 px-6 py-6">
            <Skeleton className="w-full h-137.5" />
            <div className="flex flex-wrap justify-center gap-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="w-24 h-7 clip-path-cut-corner-xs" />
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Таблица (LeaderboardTable) */}
      <div className="w-full flex justify-center">
        <Card variant="yellow-glow" corners="cut-corner" className="overflow-hidden w-full">
          {/* Заголовок таблицы */}
          <div className="flex gap-4 px-4 py-3 bg-muted/50">
            <Skeleton className="w-12 h-4" />
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-16 h-4 ml-auto" />
            <Skeleton className="w-20 h-4" />
            <Skeleton className="w-20 h-4" />
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-14 h-4" />
            <Skeleton className="w-24 h-4" />
          </div>
          {/* Строки таблицы */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`flex items-center gap-4 px-4 py-4 border-b border-muted/20 ${
                i === 0
                  ? 'bg-accent/10 border-l-4 border-l-accent'
                  : i === 1
                    ? 'bg-muted/30 border-l-4 border-l-gray-400'
                    : i === 2
                      ? 'bg-muted/20 border-l-4 border-l-amber-600'
                      : ''
              }`}
            >
              <div className="w-12 flex items-center justify-center gap-2">
                {i < 3 && <Skeleton variant="circle" className="w-5 h-5" />}
                <Skeleton className="w-4 h-5" />
              </div>
              <div className="flex items-center gap-3 w-32">
                <Skeleton variant="circle" className="w-3 h-3 shrink-0" />
                <Skeleton className="flex-1 h-4" />
              </div>
              <Skeleton className="w-12 h-5 ml-auto" />
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-20 h-4" />
              <Skeleton className="w-12 h-4" />
              <Skeleton className="w-12 h-4" />
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
