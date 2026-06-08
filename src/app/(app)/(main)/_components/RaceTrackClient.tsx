'use client'

import dynamic from 'next/dynamic'

const RaceTrackVisualization = dynamic(() => import('@/components/ui/racetrack'), {
  ssr: false,
  loading: () => <div className="absolute w-full h-full z-1 -translate-y-6 bg-[#141414]" />,
})

interface RaceTrackClientProps {
  svgPath?: string
}

export function RaceTrackClient({ svgPath }: RaceTrackClientProps) {
  return (
    <RaceTrackVisualization
      className="absolute w-full h-full z-1 -translate-y-6"
      backgroundColor="#141414"
      svgPath={svgPath}
    />
  )
}
