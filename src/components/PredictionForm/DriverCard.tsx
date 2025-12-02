import { Driver } from '@/payload-types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Image from 'next/image'

interface DriverCardProps {
  driver: Driver
  onClick?: () => void
  disabled?: boolean
  className?: string
  draggable?: boolean
}

export function DriverCard({
  driver,
  onClick,
  disabled,
  className,
  draggable = false,
}: DriverCardProps) {
  const photo = typeof driver.photo === 'object' ? driver.photo : null
  const countryFlag = typeof driver.countryFlag === 'object' ? driver.countryFlag : null
  const teamColor = driver.teamColor || '#FFDF2C'

  // Используем sortable только если draggable=true
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: driver.id,
    disabled: !draggable || disabled,
  })

  const style = draggable
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }
    : {}

  const Component = draggable ? 'div' : 'button'

  return (
    <Component
      ref={draggable ? setNodeRef : undefined}
      onClick={onClick}
      disabled={!draggable ? disabled : undefined}
      style={style}
      {...(draggable ? { ...attributes, ...listeners } : {})}
      className={`relative w-full h-[280px] overflow-hidden transition-all duration-200  clip-path-cut-corner ${
        draggable
          ? !disabled
            ? 'cursor-grab active:cursor-grabbing'
            : 'cursor-not-allowed opacity-50'
          : 'hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
      } ${className || ''}`}
    >
      <div
        className="w-full h-full clip-path-cut-corner relative overflow-hidden p-0.5"
        style={{
          backgroundColor: teamColor,
          boxShadow: `0 4px 20px ${teamColor}30`,
        }}
      >
        <div
          className={`w-full h-full bg-background clip-path-cut-corner relative overflow-hidden ${draggable ? 'pointer-events-none' : ''}`}
        >
          {/* Фоновый градиент с цветом команды */}
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
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </div>
          )}

          {/* Номер пилота (верхний правый угол) */}
          <div
            className="absolute top-4 right-4 text-6xl font-black opacity-30"
            style={{ color: teamColor }}
          >
            {driver.number}
          </div>

          {/* Информация внизу */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent p-4 pt-12 flex flex-row justify-between items-center">
            <div>
              {/* Аббревиатура */}
              <div className="text-2xl font-black mb-1 tracking-wider" style={{ color: teamColor }}>
                {driver.shortName}
              </div>

              {/* Имя пилота */}
              <div className="text-sm font-bold text-foreground/90 mb-1 truncate">
                {driver.name}
              </div>

              {/* Команда и флаг */}
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-muted-foreground truncate flex-1">{driver.team}</div>
              </div>
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
    </Component>
  )
}
