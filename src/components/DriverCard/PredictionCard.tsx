import { Team } from '@/payload-types'
import { cva, type VariantProps } from 'class-variance-authority'
import Image from 'next/image'
import type { CSSProperties } from 'react'

const outerVariants = cva('clip-path-cut-corner-sm relative overflow-hidden', {
  variants: {
    variant: {
      default: 'bg-accent/20',
      colored: '',
      clear: '',
    },
  },
  defaultVariants: { variant: 'default' },
})

const contentVariants = cva('relative z-10 flex items-center gap-3', {
  variants: {
    size: {
      default: 'py-[9px] px-3 text-sm',
      sm: 'py-2 px-2.5 text-xs',
      clear: '',
    },
  },
  defaultVariants: { size: 'default' },
})

type PredictionCardTypes = React.ComponentProps<'div'> &
  VariantProps<typeof outerVariants> &
  VariantProps<typeof contentVariants> & {
    position?: number
    name: string
    team?: Team
  }

export function PredictionCard({ position, name, team, variant, size }: PredictionCardTypes) {
  const logo = team && typeof team.logo === 'object' ? team.logo : null
  const teamColor = team?.teamColor

  const outerStyle: CSSProperties =
    variant === 'colored' && teamColor
      ? ({ background: teamColor } as CSSProperties)
      : {}

  return (
    <div
      className={outerVariants({ variant })}
      style={{ '--teamColor': teamColor, ...outerStyle } as CSSProperties}
    >
      {variant !== 'clear' && (
        <div
          className={`absolute clip-path-cut-corner-sm ${variant === 'colored' ? 'bg-[color-mix(in_srgb,#000_100%,var(--teamColor)_50%)]' : 'bg-card'}`}
          style={{ inset: '1px 1px 1px 4px' }}
        />
      )}
      <div className={contentVariants({ size })}>
        {position != null && (
          <div
            className={`w-6 h-6 clip-path-cut-corner-xs shrink-0 flex items-center justify-center font-bold text-xs ${
              position === 1
                ? 'bg-yellow-500 text-black'
                : position === 2
                  ? 'bg-gray-400 text-black'
                  : 'bg-orange-700 text-white'
            }`}
          >
            {position}
          </div>
        )}
        <span className="font-medium truncate min-w-0 flex-1">{name}</span>
        {logo?.url && (
          <div className="absolute w-24 h-4/5 right-[5%]">
            <Image src={logo.url} alt={logo.alt} fill className="object-fill" />
          </div>
        )}
      </div>
    </div>
  )
}
