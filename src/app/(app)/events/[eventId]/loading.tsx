import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function EventDetailLoading() {
  return (
    <div className="container mx-auto px-4 md:px-16 py-6 max-w-3xl">
      {/* EventHeader */}
      <Card variant="default" corners="cut-corner" className="p-0.5 mb-6">
        <div className="p-6 space-y-4">
          {/* Заголовок и статус */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <Skeleton variant="title" className="w-3/4 h-8" />
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-2/3 h-4" />
            </div>
            <Skeleton className="w-24 h-6 rounded shrink-0" />
          </div>

          {/* Информация */}
          <div className="flex flex-wrap gap-4 pt-2">
            <Skeleton className="w-48 h-5" />
            <Skeleton className="w-32 h-5" />
          </div>

          {/* Награда */}
          <div className="flex items-center gap-2 pt-2 border-t border-muted">
            <Skeleton variant="circle" className="w-6 h-6" />
            <Skeleton className="w-40 h-5" />
          </div>
        </div>
      </Card>

      {/* EventForm - Questions */}
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} variant="default" corners="sharp" className="p-0.5">
            <div className="p-4 space-y-4">
              {/* Номер вопроса и текст */}
              <div className="flex items-start gap-3">
                <Skeleton variant="circle" className="w-8 h-8 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-full h-5" />
                  <Skeleton className="w-3/4 h-4" />
                </div>
              </div>

              {/* Варианты ответов */}
              <div className="space-y-2 pl-11">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="w-full h-12 rounded-md" />
                ))}
              </div>
            </div>
          </Card>
        ))}

        {/* Кнопка отправки */}
        <Skeleton className="w-full h-12" />
      </div>
    </div>
  )
}
