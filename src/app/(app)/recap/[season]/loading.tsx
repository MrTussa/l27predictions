export default function CommunityRecapLoading() {
  return (
    <div className="mx-auto max-w-450 space-y-6 px-4 py-6 md:px-16">
      <div className="h-36 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded bg-muted" />
        ))}
      </div>
    </div>
  )
}
