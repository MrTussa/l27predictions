import { Team } from '@/payload-types'
import { cva, type VariantProps } from 'class-variance-authority'
import Image from 'next/image'

const PredictionCardVariants = cva('flex items-center gap-3 relative truncate', {
  variants: {
    variant: {
      default: 'bg-background/50 border border-accent/20',
      clear: '',
      colored:
        'bg-[color-mix(in_srgb,_#000_100%,_var(--teamColor)_50%)] border border-(--teamColor)',
    },
    size: {
      clear: '',
      default: 'p-3 text-sm',
      sm: 'p-2 text-xs',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

type PredictionCardTypes = React.ComponentProps<'div'> &
  VariantProps<typeof PredictionCardVariants> & {
    position?: number
    name: string
    team?: Team
  }

export function PredictionCard({ position, name, team, variant, size }: PredictionCardTypes) {
  const logo = team && typeof team.logo === 'object' ? team.logo : null
  return (
    <div
      className={PredictionCardVariants({ variant, size })}
      style={{ '--teamColor': team?.teamColor } as React.CSSProperties}
    >
      {position && (
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
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
      <span className="font-medium">{name}</span>
      {logo?.url && (
        <div className="absolute w-24 h-4/5 right-[5%]">
          <Image src={logo.url} alt={logo.alt} fill className="object-fill " />
        </div>
      )}
    </div>
  )
}
