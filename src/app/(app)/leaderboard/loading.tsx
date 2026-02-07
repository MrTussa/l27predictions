import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function LeaderboardLoading() {
  return (
    <div className="container px-4 md:px-16 py-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* График (PointsEvolutionChart) */}
        <Card variant="default" corners="cut-corner">
          <Skeleton variant="title" className="w-24 h-8 mb-6 mx-6" />
          <div className="flex gap-6 px-6 pb-6">
            {/* Левая панель - список игроков */}
            <div className="w-64 shrink-0 space-y-2">
              <Skeleton className="w-20 h-4 mb-4" />
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2 border border-muted/20 rounded"
                >
                  <Skeleton variant="circle" className="w-3 h-3 shrink-0" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-16 h-3" />
                  </div>
                </div>
              ))}
            </div>
            {/* График */}
            <Skeleton className="flex-1 h-[500px]" />
          </div>
        </Card>

        {/* Таблица (LeaderboardTable) */}
        <Card variant="yellow-glow" corners="cut-corner" className="overflow-hidden">
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
