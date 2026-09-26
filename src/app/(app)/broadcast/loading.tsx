import { Skeleton } from '@/components/ui/skeleton'

export default function BroadcastLoading() {
  return (
    <div>
      <div className="container px-4 md:px-16 py-4">
        <Skeleton variant="title" className="w-64 h-10" />
      </div>
      <div className="px-4 md:px-16">
        <Skeleton className="w-full aspect-video" />
      </div>
    </div>
  )
}
