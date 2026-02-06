import type { Driver } from '@/payload-types'
import { Trophy } from 'lucide-react'
import { DriverCardBase, EmptySlot } from './DriverCardBase'

interface PodiumDriverProps {
  position: 1 | 2 | 3
  driver: Driver | null
}

const POSITION_HEIGHTS = {
  1: 'h-[250px] lg:h-[340px]',
  2: 'h-[250px] lg:h-[320px]',
  3: 'h-[250px] lg:h-[300px]',
} as const

/**
 * Static podium display for race results
 */
export function PodiumDriver({ position, driver }: PodiumDriverProps) {
  const height = POSITION_HEIGHTS[position]

  if (!driver) {
    return <EmptySlot position={position} height={height} />
  }

  return (
    <DriverCardBase
      driver={driver}
      height={height}
      topRightContent={position}
      topLeftContent={
        position === 1 ? <Trophy className="w-10 h-10 text-accent" fill="#FFDF2C" /> : null
      }
      showGlow={true}
    />
  )
}
