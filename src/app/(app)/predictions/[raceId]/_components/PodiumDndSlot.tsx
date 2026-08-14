import type { Driver } from '@/payload-types'
import { useDroppable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PodiumSlot } from './PodiumSlot'

interface PodiumDndSlotProps {
  position: 1 | 2 | 3
  driver: Driver | null
  onRemove?: () => void
  disabled?: boolean
}

/** Слот подиума с drag-and-drop: пустой — droppable, заполненный — sortable. */
export function PodiumDndSlot({ position, driver, onRemove, disabled }: PodiumDndSlotProps) {
  const podiumSlotId = `podium-${position}`

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({ id: podiumSlotId })

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

  if (!driver) {
    return (
      <PodiumSlot
        position={position}
        driver={null}
        isHighlighted={isOver}
        ref={(node) => {
          setDroppableRef(node)
          setSortableRef(node)
        }}
      />
    )
  }

  return (
    <PodiumSlot
      position={position}
      driver={driver}
      onRemove={onRemove}
      disabled={disabled}
      ref={setSortableRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      {...attributes}
      {...listeners}
    />
  )
}
