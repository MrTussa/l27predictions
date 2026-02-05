import type { Driver } from '@/payload-types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DriverCardBase } from './DriverCardBase'

interface DriverCardSelectableProps {
  driver: Driver | null
  onClick?: () => void
  disabled?: boolean
  draggable?: boolean
}

/**
 * Selectable/draggable driver card for picking predictions
 */
export function DriverCardSelectable({
  driver,
  onClick,
  disabled,
  draggable = false,
}: DriverCardSelectableProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: driver?.id ?? '',
    disabled: !draggable || disabled || !driver,
  })

  if (!driver) {
    return null
  }

  const style = draggable
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }
    : {}

  const Component = draggable ? 'div' : 'button'

  const team = typeof driver.team === 'object' ? driver.team : null
  const teamColor = team?.teamColor ?? '#FFDF2C'

  return (
    <div className="glow-border" style={{ '--glow-color': teamColor } as React.CSSProperties}>
      <Component
        ref={draggable ? setNodeRef : undefined}
        onClick={onClick}
        disabled={!draggable ? disabled : undefined}
        {...(draggable ? { ...attributes, ...listeners } : {})}
        className={`block w-full ${
          draggable
            ? !disabled
              ? 'cursor-grab active:cursor-grabbing'
              : 'cursor-not-allowed opacity-50'
            : 'hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
        } transition-all duration-200`}
        style={style}
      >
        <DriverCardBase
          driver={driver}
          height="h-[280px]"
          topRightContent={driver.number}
          showGlow={false}
          className={draggable ? 'pointer-events-none' : ''}
        />
      </Component>
    </div>
  )
}
