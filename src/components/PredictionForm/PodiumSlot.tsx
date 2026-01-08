import { Driver } from '@/payload-types'
import { useDroppable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { IconX } from '@tabler/icons-react'
import Image from 'next/image'

interface PodiumSlotProps {
  position: 1 | 2 | 3
  driver: Driver | null
  onRemove?: () => void
  disabled?: boolean
}

export function PodiumSlot({ position, driver, onRemove, disabled }: PodiumSlotProps) {
  const podiumSlotId = `podium-${position}`

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

  const positionLabels = {
    1: '1ST',
    2: '2ND',
    3: '3RD',
  }

  const positionHeights = {
    1: 'h-[340px]',
    2: 'h-[320px]',
    3: 'h-[300px]',
  }

  if (!driver) {
    // Пустой слот - объединяем оба ref
    return (
      <div
        ref={(node) => {
          setDroppableRef(node)
          setSortableRef(node)
        }}
        className={`${positionHeights[position]} p-0.5 clip-path-cut-corner transition-all duration-200 ${
          isDroppableOver ? 'bg-accent scale-105' : 'bg-border'
        }`}
      >
        <div className="w-full h-full bg-background clip-path-cut-corner flex flex-col items-center justify-center">
          <div
            className="text-6xl font-black opacity-20 mb-4"
            style={{ color: isDroppableOver ? '#FFDF2C' : '#666' }}
          >
            {position}
          </div>
          <div className="text-sm text-muted-foreground">{positionLabels[position]}</div>
        </div>
      </div>
    )
  }

  const style = driver
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }
    : {}

  const photo = driver && typeof driver.photo === 'object' ? driver.photo : null
  const countryFlag = driver && typeof driver.countryFlag === 'object' ? driver.countryFlag : null
  const team = typeof driver.team === 'object' ? driver.team : null
  const teamColor = team?.teamColor ?? '#FFDF2C'
  const teamName = team?.name ?? 'Unknown Team'

  // Заполненный слот
  return (
    <div
      ref={setSortableRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${positionHeights[position]} p-0.5 clip-path-cut-corner transition-all duration-200 ${
        !disabled ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed'
      }`}
      data-position={position}
      data-driver-id={driver.id}
    >
      <div
        className="w-full h-full clip-path-cut-corner relative overflow-hidden p-0.5"
        style={{
          backgroundColor: teamColor,
        }}
      >
        <div className="w-full h-full bg-background clip-path-cut-corner relative overflow-hidden p-0.5">
          <div className="w-full h-full bg-background clip-path-cut-corner relative overflow-hidden">
            {/* Фоновый градиент */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: `linear-gradient(135deg, ${teamColor}40 0%, transparent 70%)`,
              }}
            />

            {/* Фото пилота */}
            {photo && photo.url && (
              <div className="absolute inset-0 flex items-end justify-center">
                <div className="relative w-full h-full">
                  <Image
                    src={photo.url}
                    alt={driver.name}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              </div>
            )}

            {/* Позиция в углу */}
            <div
              className="absolute top-4 right-4 text-6xl font-black opacity-30"
              style={{ color: teamColor }}
            >
              {position}
            </div>

            {/* Кнопка удаления */}
            {!disabled && onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove()
                }}
                className="absolute top-4 left-4 w-8 h-8 rounded-full bg-background/80 hover:bg-background flex items-center justify-center transition-colors z-10"
              >
                <IconX className="w-5 h-5" />
              </button>
            )}

            {/* Информация внизу */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent p-4 pt-12 flex flex-row items-center justify-between">
              <div className="">
                <div
                  className="text-2xl font-black mb-1 tracking-wider"
                  style={{ color: teamColor }}
                >
                  {driver.shortName}
                </div>
                <div className="text-sm font-bold text-foreground/90 mb-1 truncate">
                  {driver.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">{teamName}</div>
              </div>
              {countryFlag && countryFlag.url && (
                <div className="relative w-10 h-7 flex items-center overflow-hidden shrink-0">
                  <Image
                    src={countryFlag.url}
                    alt="Country flag"
                    fill
                    className="object-cover"
                    sizes="28px"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
