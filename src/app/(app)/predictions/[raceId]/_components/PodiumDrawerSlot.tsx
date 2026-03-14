import { DriverCardBase, EmptySlot } from '@/components/DriverCard/DriverCardBase'
import type { Driver } from '@/payload-types'
import { IconX } from '@tabler/icons-react'

interface PodiumDrawerSlotProps {
  position: 1 | 2 | 3
  driver: Driver | null
  onRemove?: () => void
  disabled?: boolean
}

const POSITION_HEIGHTS = {
  1: 'h-[250px] lg:h-[340px]',
  2: 'h-[250px] lg:h-[320px]',
  3: 'h-[250px] lg:h-[300px]',
} as const

/**
 * Droppable/sortable podium slot for prediction form
 */
export function PodiumDrawerSlot({ position, driver, onRemove, disabled }: PodiumDrawerSlotProps) {
  const height = POSITION_HEIGHTS[position]

  if (!driver) {
    return <EmptySlot position={position} height={height} />
  }

  const team = typeof driver.team === 'object' ? driver.team : null
  const teamColor = team?.teamColor ?? '#FFDF2C'

  return (
    <div
      className={`${!disabled ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed'}`}
      data-position={position}
      data-driver-id={driver.id}
    >
      <div className="p-0.5 clip-path-cut-corner" style={{ backgroundColor: teamColor }}>
        <div className="bg-background clip-path-cut-corner p-0.5">
          <DriverCardBase
            driver={driver}
            height={height}
            priority={position === 1}
            topRightContent={position}
            topLeftContent={
              !disabled && onRemove ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove()
                  }}
                  className="w-8 h-8 rounded-full bg-background/80 hover:bg-background flex items-center justify-center transition-colors"
                >
                  <IconX className="w-5 h-5" />
                </button>
              ) : null
            }
            showGlow={false}
          />
        </div>
      </div>
    </div>
  )
}
