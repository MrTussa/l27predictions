import { Skeleton } from '@/components/ui/skeleton'

export default function AuthLoading() {
  return (
    <div className="container py-16 max-w-2xl mx-auto">
      {/* Заголовок */}
      <Skeleton variant="title" className="w-32 h-9 mb-2" />
      <Skeleton className="w-96 h-4 mb-8" />

      {/* Форма */}
      <div className="max-w-lg space-y-6">
        {/* Поля формы */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-full h-10" />
          </div>
        ))}

        {/* Кнопки */}
        <div className="flex gap-4 flex-col sm:flex-row pt-4">
          <Skeleton className="flex-1 h-12" />
          <Skeleton className="flex-1 h-12" />
        </div>
      </div>
    </div>
  )
}
