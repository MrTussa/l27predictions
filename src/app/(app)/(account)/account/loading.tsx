import { Skeleton } from '@/components/ui/skeleton'

export default function AccountLoading() {
  return (
    <div className="space-y-4">
      <Skeleton variant="title" className="w-64 h-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
