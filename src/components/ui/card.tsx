import * as React from 'react'

import { cn } from '@/utilities/cn'
import { cva, type VariantProps } from 'class-variance-authority'

const cardOuterVariants = cva('relative transition-all duration-200', {
  variants: {
    variant: {
      default: 'bg-border shadow-sm',
      yellow:
        'bg-accent shadow-[0_0_20px_rgba(255,223,44,0.15)] hover:shadow-[0_0_30px_rgba(255,223,44,0.25)]',
      'yellow-glow':
        'bg-accent shadow-[0_0_30px_rgba(255,223,44,0.3),inset_0_0_20px_rgba(255,223,44,0.05)] hover:shadow-[0_0_40px_rgba(255,223,44,0.4),inset_0_0_30px_rgba(255,223,44,0.08)]',
      gray: 'bg-muted shadow-sm',
      ghost: 'bg-border/50',
      elevated: 'bg-accent/30 shadow-[0_4px_20px_rgba(0,0,0,0.4)]',
    },
    corners: {
      sharp: '',
      'cut-corner': 'clip-path-cut-corner',
      'cut-corner-sm': 'clip-path-cut-corner-sm',
      'angled-top': 'clip-path-angled-top',
    },
    borderWidth: {
      thin: 'p-px',
      normal: 'p-[2px]',
    },
  },
  defaultVariants: {
    variant: 'default',
    corners: 'sharp',
    borderWidth: 'normal',
  },
})

const cardInnerVariants = cva('bg-card text-card-foreground w-full h-full flex flex-col gap-4 ', {
  variants: {
    corners: {
      sharp: '',
      'cut-corner': 'clip-path-cut-corner py-4',
      'cut-corner-sm': 'clip-path-cut-corner-sm',
      'angled-top': 'clip-path-angled-top py-4',
    },
  },
  defaultVariants: {
    corners: 'sharp',
  },
})

export interface CardProps
  extends React.ComponentProps<'div'>, VariantProps<typeof cardOuterVariants> {
  accentColor?: string
  accentPosition?: 'left' | 'bottom'
}

function Card({
  className,
  variant,
  corners,
  borderWidth,
  accentColor,
  accentPosition = 'left',
  children,
  style,
  ...props
}: CardProps) {
  const hasClippedCorners = corners !== 'sharp'
  const accentPad = accentPosition === 'bottom' ? 'pb-1 pt-px px-px' : 'pl-1 pr-px py-px'
  const accentGradientDir = accentPosition === 'bottom' ? 'to top' : '110deg'

  return (
    <div
      data-slot="card-outer"
      className={cn(
        cardOuterVariants({ variant, corners, borderWidth: accentColor ? undefined : borderWidth }),
        accentColor && accentPad,
        className,
      )}
      style={accentColor ? { backgroundColor: accentColor, ...style } : style}
      {...props}
    >
      <div
        data-slot="card-inner"
        className={cn(cardInnerVariants({ corners: hasClippedCorners ? corners : 'sharp' }))}
        style={
          accentColor
            ? {
                background: `linear-gradient(${accentGradientDir}, color-mix(in srgb, ${accentColor} 24%, var(--card)), var(--card))`,
              }
            : undefined
        }
      >
        {children}
      </div>
    </div>
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn('flex flex-col gap-1.5 px-6', className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('leading-none font-semibold', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('px-6', className)} {...props} />
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="card-footer" className={cn('flex items-center px-6', className)} {...props} />
  )
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
