import { cn } from '@/utilities/cn'
import { cva, type VariantProps } from 'class-variance-authority'

/**
 * Base Skeleton Component with Glass Morphism Effect
 *
 */

export type SkeletonProps = React.ComponentProps<'div'> & VariantProps<typeof skeletonVariants>

const skeletonVariants = cva(
  'animate-pulse rounded-lg bg-gradient-to-br from-neutral-800/50 via-neutral-700/30 to-neutral-800/50',
  {
    variants: {
      variant: {
        default: 'h-4',
        text: 'h-4',
        title: 'h-8',
        card: 'h-64',
        circle: 'rounded-full aspect-square',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)
export function Skeleton({ className, variant }: SkeletonProps) {
  return <div className={cn(skeletonVariants({ variant }), className)} />
}

/**
 * Skeleton Text - Multiple lines of text skeleton
 */
export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={i === lines - 1 ? 'w-3/4' : 'w-full'} />
      ))}
    </div>
  )
}
