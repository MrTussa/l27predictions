import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function PredictionFormLoading() {
  return (
    <div className="px-4 md:px-16 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Форма прогноза - 75% */}
        <div className="lg:col-span-3 space-y-8">
          {/* Заголовок */}
          <div>
            <Skeleton variant="title" className="w-64 h-8 mb-6" />

            {/* Podium Slots */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:items-end lg:justify-center gap-4 lg:gap-6mb-8">
              {/* 2 место */}
              <div className="md:col-span-2 lg:order-2 lg:flex-1 flex justify-center">
                <Skeleton className="h-[250px] lg:h-[320px] w-full clip-path-cut-corner max-w-[280px] lg:max-w-none" />
              </div>
              {/* 1 место */}
              <div className="lg:order-1 lg:flex-1 flex justify-center">
                <Skeleton className="h-[250px] lg:h-[280px] w-full clip-path-cut-corner max-w-[280px] lg:max-w-none" />
              </div>
              {/* 3 место */}
              <div className="lg:order-3 lg:flex-1 flex justify-center">
                <Skeleton className="h-[250px] lg:h-[260px] w-full clip-path-cut-corner max-w-[280px] lg:max-w-none" />
              </div>
            </div>
          </div>

          {/* Доступные пилоты */}
          <div>
            <Skeleton variant="title" className="w-56 h-8 mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-lg" />
              ))}
            </div>
          </div>

          {/* Кнопка сохранения */}
          <Skeleton className="w-full h-12" />
        </div>

        {/* Информация о гонке - 25% */}
        <div className="lg:col-span-1">
          <Card variant="elevated" corners="cut-corner" className="h-fit sticky top-4">
            <div className="space-y-4 px-4">
              {/* Заголовок */}
              <div className="border-b border-muted pb-4">
                <div className="flex items-start gap-3">
                  <Skeleton variant="circle" className="w-5 h-5 mt-1 shrink-0" />
                  <div className="flex-1">
                    <Skeleton variant="title" className="w-full h-6" />
                    <Skeleton className="w-16 h-4 mt-2" />
                  </div>
                </div>
              </div>

              {/* Дата гонки */}
              <div className="space-y-1">
                <Skeleton className="w-28 h-4" />
                <Skeleton className="w-40 h-5" />
                <Skeleton className="w-16 h-4" />
              </div>

              {/* Закрытие прогнозов */}
              <div className="space-y-1">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-32 h-5" />
                <Skeleton className="w-16 h-4" />
              </div>

              {/* Статус */}
              <div className="pt-4 border-t border-muted">
                <Skeleton className="w-36 h-5" />
              </div>

              {/* Проголосовавшие */}
              <div className="pt-4 border-t border-muted">
                <Skeleton className="w-44 h-4 mb-3" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <Skeleton variant="circle" className="w-2 h-2 shrink-0" />
                    <Skeleton className="flex-1 h-4" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
