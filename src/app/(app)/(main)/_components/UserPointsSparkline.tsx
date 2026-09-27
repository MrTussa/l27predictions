'use client'

import dynamic from 'next/dynamic'

// Lazy: defers recharts on the home page (sparkline only shows when data exists)
export const UserPointsSparkline = dynamic(
  () => import('./UserPointsSparklineChart').then((m) => m.UserPointsSparkline),
  { ssr: false, loading: () => <div className="w-full h-[60px]" /> },
)
