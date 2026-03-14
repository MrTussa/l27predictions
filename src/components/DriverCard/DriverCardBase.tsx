import type { Driver } from '@/payload-types'
import Image from 'next/image'
import type { ReactNode } from 'react'

export interface DriverCardBaseProps {
  driver: Driver
  height?: string
  topRightContent?: ReactNode
  topLeftContent?: ReactNode
  showGlow?: boolean
  className?: string
  size?: 'base' | 'sm'
  priority?: boolean
}

/**
 * Base visual component for driver cards
 * Used by DriverCard, PodiumSlot, and PodiumDriver
 */
export function DriverCardBase({
  driver,
  height = 'h-[280px]',
  topRightContent,
  topLeftContent,
  showGlow = true,
  className = '',
  size = 'base',
  priority = false,
}: DriverCardBaseProps) {
  const photo = typeof driver.photo === 'object' ? driver.photo : null
  const countryFlag = typeof driver.countryFlag === 'object' ? driver.countryFlag : null
  const team = typeof driver.team === 'object' ? driver.team : null
  const teamColor = team?.teamColor ?? '#FFDF2C'
  const teamName = team?.name ?? 'Unknown Team'

  const content = (
    <div
      className={`w-full ${height} p-0.5 clip-path-cut-corner transition-all duration-200 ${className}`}
      style={{ backgroundColor: teamColor }}
    >
      <div
        className="w-full h-full clip-path-cut-corner relative overflow-hidden"
        style={{
          backgroundColor: `color-mix(in srgb, #000 100%, ${teamColor} 8%)`,
        }}
      >
        {/* Background mask pattern */}
        <div
          className="absolute inset-0 w-[200%] left-[-50%]"
          style={{
            backgroundColor: `color-mix(in srgb, #000 100%, ${teamColor} 50%)`,
            maskImage: 'url(/mask.webp)',
            maskSize: 'contain',
            maskPosition: 'center',
          }}
        />

        {/* Driver photo */}
        {photo?.url && (
          <div className="absolute inset-0 flex items-end justify-center">
            <div className="relative w-full h-full">
              <Image
                src={photo.url}
                alt={driver.name}
                fill
                priority={priority}
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          </div>
        )}

        {/* Top right content (position number, driver number, etc.) */}
        {topRightContent && (
          <div
            className={`absolute top-4 right-4   font-black opacity-30 ${size === 'base' ? 'text-6xl' : 'text-4xl sm:text-6xl'}`}
            style={{ color: teamColor }}
          >
            {topRightContent}
          </div>
        )}

        {/* Top left content (trophy, remove button, etc.) */}
        {topLeftContent && <div className="absolute top-4 left-4 z-10">{topLeftContent}</div>}

        {/* Bottom info section */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent p-4 pt-12 flex flex-row items-center justify-between">
          <div className="text-left">
            <div className="text-2xl font-black mb-1 tracking-wider" style={{ color: teamColor }}>
              {driver.shortName}
            </div>
            <div
              className={`text-sm font-bold text-foreground/90 mb-1 truncate ${size === 'sm' && 'max-w-20 sm:max-w-none'}`}
            >
              {driver.name}
            </div>
            <div className="text-xs text-muted-foreground truncate">{teamName}</div>
          </div>
          {countryFlag?.url && (
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
  )

  if (showGlow) {
    return (
      <div className="glow-border" style={{ '--glow-color': teamColor } as React.CSSProperties}>
        {content}
      </div>
    )
  }

  return content
}

/**
 * Empty slot placeholder for podium positions
 */
export interface EmptySlotProps {
  position: 1 | 2 | 3
  height?: string
  isHighlighted?: boolean
}

export function EmptySlot({
  position,
  height = 'h-[280px]',
  isHighlighted = false,
}: EmptySlotProps) {
  const positionLabels = {
    1: '1ST',
    2: '2ND',
    3: '3RD',
  }

  return (
    <div
      className={`w-full ${height} p-0.5 clip-path-cut-corner transition-all duration-200 ${
        isHighlighted ? 'bg-accent scale-105' : 'bg-border'
      }`}
    >
      <div className="w-full h-full bg-background clip-path-cut-corner flex flex-col items-center justify-center">
        <div
          className="text-6xl font-black opacity-20 mb-4"
          style={{ color: isHighlighted ? '#FFDF2C' : '#666' }}
        >
          {position}
        </div>
        <div className="text-sm text-muted-foreground">{positionLabels[position]}</div>
      </div>
    </div>
  )
}
