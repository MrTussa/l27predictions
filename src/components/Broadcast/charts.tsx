'use client'

import dynamic from 'next/dynamic'

// recharts меряет контейнер в браузере — рисуем графики только на клиенте,
// заглушка той же высоты, чтобы страница не прыгала

export const TelemetryChart = dynamic(
  () => import('./TelemetryChart').then((m) => m.TelemetryChart),
  { ssr: false, loading: () => <div className="h-16 w-full" /> },
)

export const RadarChart = dynamic(() => import('./RadarChart').then((m) => m.RadarChart), {
  ssr: false,
  loading: () => <div className="h-80 w-full" />,
})

export type { TelemetryPoint } from './TelemetryChart'
export type { RadarAxisPoint } from './RadarChart'
