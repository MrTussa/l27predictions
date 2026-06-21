'use client'

import dynamic from 'next/dynamic'

export const PointsEvolutionChart = dynamic(
  () => import('./Chart').then((m) => m.PointsEvolutionChart),
  {
    ssr: false,
    loading: () => <div className="h-137.5 rounded-lg bg-muted/20" />,
  },
)
