import { DriverCardBase, EmptySlot } from '@/components/DriverCard/DriverCardBase'
import type { Driver } from '@/payload-types'
import { useDroppable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { IconX } from '@tabler/icons-react'

interface PodiumDndSlotProps {
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
export function PodiumDndSlot({ position, driver, onRemove, disabled }: PodiumDndSlotProps) {
  const podiumSlotId = `podium-${position}`
  const height = POSITION_HEIGHTS[position]

  const { setNodeRef: setDroppableRef, isOver: isDroppableOver } = useDroppable({
    id: podiumSlotId,
  })

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: driver?.id || podiumSlotId,
    disabled: !driver || disabled,
    animateLayoutChanges: () => false,
    data: {
      type: 'podium',
      position,
    },
  })

  // Empty slot - droppable zone
  if (!driver) {
    return (
      <div
        ref={(node) => {
          setDroppableRef(node)
          setSortableRef(node)
        }}
      >
        <EmptySlot position={position} height={height} isHighlighted={isDroppableOver} />
      </div>
    )
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const team = typeof driver.team === 'object' ? driver.team : null
  const teamColor = team?.teamColor ?? '#FFDF2C'

  // Filled slot - sortable
  return (
    <div
      ref={setSortableRef}
      style={style}
      {...attributes}
      {...listeners}
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
