import type { Driver } from '@/payload-types'
import { Trophy } from 'lucide-react'
import { DriverCardBase, EmptySlot } from './DriverCardBase'

interface PodiumDriverProps {
  position: 1 | 2 | 3
  driver: Driver | null
}

const POSITION_HEIGHTS = {
  1: 'h-[340px]',
  2: 'h-[320px]',
  3: 'h-[300px]',
} as const

const POSITION_WIDTHS = {
  1: 'w-[260px]',
  2: 'w-[240px]',
  3: 'w-[220px]',
} as const

/**
 * Static podium display for race results
 */
export function PodiumDriver({ position, driver }: PodiumDriverProps) {
  const height = POSITION_HEIGHTS[position]
  const width = POSITION_WIDTHS[position]

  if (!driver) {
    return (
      <div className={width}>
        <EmptySlot position={position} height={height} />
      </div>
    )
  }

  return (
    <div className={width}>
      <DriverCardBase
        driver={driver}
        height={height}
        topRightContent={position}
        topLeftContent={
          position === 1 ? <Trophy className="w-10 h-10 text-accent" fill="#FFDF2C" /> : null
        }
        showGlow={true}
      />
    </div>
  )
}
