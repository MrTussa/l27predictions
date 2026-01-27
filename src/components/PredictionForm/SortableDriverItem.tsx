'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Driver } from '@/payload-types'
import { GripVertical, X } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

type Props = {
  driver: Driver
  position: number
  onRemove: () => void
  disabled: boolean
}

export const SortableDriverItem: React.FC<Props> = ({ driver, position, onRemove, disabled }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: driver.id,
    disabled,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const photo = typeof driver.photo === 'object' ? driver.photo : null
  const positionLabels = ['1-е место', '2-е место', '3-е место']

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
    >
      {/* Drag Handle */}
      {!disabled && (
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="w-5 h-5" />
        </button>
      )}

      {/* Position Badge */}
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
        {position}
      </div>

      {/* Driver Photo */}
      {photo && photo.url && (
        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
          <Image src={photo.url} alt={driver.name} fill className="object-cover" sizes="48px" />
        </div>
      )}

      {/* Driver Info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{driver.name}</div>
        <div className="text-sm text-muted-foreground truncate">
          {positionLabels[position - 1]} •{' '}
          {typeof driver.team === 'object' && driver.team ? driver.team.name : driver.team}
        </div>
      </div>

      {/* Driver Number */}
      <div className="flex-shrink-0 text-2xl font-bold text-muted-foreground">
        #{driver.number}
      </div>

      {/* Remove Button */}
      {!disabled && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="flex-shrink-0 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}
