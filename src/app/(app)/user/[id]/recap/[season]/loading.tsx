export default function SeasonRecapLoading() {
  return (
    <div className="mx-auto max-w-450 space-y-6 px-4 py-6 md:px-16">
      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-12">
        <div className="space-y-6 lg:col-span-2 xl:order-2 xl:col-span-6">
          <div className="h-48 animate-pulse rounded bg-muted" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded bg-muted" />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded bg-muted" />
        </div>
        <div className="space-y-6 xl:order-1 xl:col-span-3">
          <div className="h-96 animate-pulse rounded bg-muted" />
        </div>
        <div className="space-y-6 xl:order-3 xl:col-span-3">
          <div className="h-72 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}
