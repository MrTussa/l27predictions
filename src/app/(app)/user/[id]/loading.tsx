export default function UserProfileLoading() {
  return (
    <div className="container px-4 md:px-16 py-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-10 w-48 bg-muted animate-pulse rounded" />
        <div className="h-6 w-72 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded" />
          ))}
        </div>
        <div className="h-64 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
      </div>
    </div>
  )
}
