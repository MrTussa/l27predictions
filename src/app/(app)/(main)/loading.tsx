import { Card } from '@/components/ui/card'
import { Skeleton, SkeletonText } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="px-4 md:px-16 py-6 min-h-[calc(100vh-100px)]">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card variant="gray" corners="cut-corner" className="h-full min-h-80 ">
            <SkeletonText lines={8} className="space-y-6 px-6 py-8" />
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card variant="yellow-glow" corners="cut-corner" className="h-full">
            <div className=" flex flex-col justify-between h-full px-6">
              <SkeletonText lines={2} className="space-y-6 " />
              <div>
                <div className="flex flex-row justify-between w-full mb-4">
                  <div className="w-1/3 space-y-2">
                    <Skeleton variant={'text'} />
                    <Skeleton variant={'title'} />
                  </div>
                  <SkeletonText lines={4} className="space-y-2 w-1/3" />
                </div>
                <Skeleton className="h-12 w-full " />
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card variant="gray" corners="cut-corner" className="h-full min-h-80 ">
            <SkeletonText lines={8} className="space-y-6 px-6 py-8" />
          </Card>
        </div>
      </div>
    </div>
  )
}
