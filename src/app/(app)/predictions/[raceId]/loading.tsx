import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function StartingGridSkeleton({ className }: { className?: string }) {
  return (
    <Card variant="gray" corners="cut-corner" className={className}>
      <div className="px-2">
        <Skeleton variant="title" className="w-40 h-5 mx-auto mb-3" />
        <div className="space-y-1.5 py-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="w-5 h-4 shrink-0" />
              <Skeleton className="flex-1 h-4" />
              <Skeleton className="w-8 h-4 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

export default function PredictionFormLoading() {
  return (
    <div className="px-4 md:px-16 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-8">
          <div>
            <Skeleton variant="title" className="w-64 h-8 mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:items-end lg:justify-center gap-4 lg:gap-6mb-8">
              <div className="md:col-span-2 lg:order-2 lg:flex-1 flex justify-center">
                <Skeleton className="h-[250px] lg:h-[320px] w-full clip-path-cut-corner max-w-[280px] lg:max-w-none" />
              </div>
              <div className="lg:order-1 lg:flex-1 flex justify-center">
                <Skeleton className="h-[250px] lg:h-[280px] w-full clip-path-cut-corner max-w-[280px] lg:max-w-none" />
              </div>
              <div className="lg:order-3 lg:flex-1 flex justify-center">
                <Skeleton className="h-[250px] lg:h-[260px] w-full clip-path-cut-corner max-w-[280px] lg:max-w-none" />
              </div>
            </div>
          </div>

          <div>
            <Skeleton className="w-full h-12" />
            <div className="hidden lg:grid lg:grid-cols-4 gap-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <StartingGridSkeleton className="hidden lg:block" />

          <Card variant="elevated" corners="cut-corner" className="h-fit sticky top-4">
            <div className="space-y-4 px-4">
              <div className="border-b border-muted pb-4">
                <div className="flex items-start gap-3">
                  <Skeleton variant="circle" className="w-5 h-5 mt-1 shrink-0" />
                  <div className="flex-1">
                    <Skeleton variant="title" className="w-full h-6" />
                    <Skeleton className="w-16 h-4 mt-2" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Skeleton className="w-28 h-4" />
                <Skeleton className="w-40 h-5" />
                <Skeleton className="w-16 h-4" />
              </div>

              <div className="space-y-1">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-32 h-5" />
                <Skeleton className="w-16 h-4" />
              </div>

              <div className="pt-4 border-t border-muted">
                <Skeleton className="w-36 h-5" />
              </div>

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
