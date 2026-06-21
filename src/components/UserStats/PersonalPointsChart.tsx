'use client'

import dynamic from 'next/dynamic'

// Lazy: defers recharts on the user profile until the chart mounts
export const PersonalPointsChart = dynamic(
  () => import('./PersonalPointsChartImpl').then((m) => m.PersonalPointsChart),
  { ssr: false, loading: () => <div className="w-full h-75 rounded-lg bg-muted/20" /> },
)
