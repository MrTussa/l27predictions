import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { IconLoader2 } from '@tabler/icons-react'

import { cn } from '@/utilities/cn'

const buttonVariants = cva(
  'relative inline-flex items-center justify-center hover:cursor-pointer gap-2 whitespace-nowrap text-sm font-bold uppercase tracking-wider transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        // Желтая кнопка - главная для важных действий
        default:
          'bg-accent text-black shadow-[0_0_20px_rgba(255,223,44,0.3)] hover:shadow-[0_0_30px_rgba(255,223,44,0.5)] hover:scale-[1.02] border-2 border-accent',
        // Outline желтая - для второстепенных действий
        outline:
          'border-2 border-accent bg-transparent text-accent hover:bg-accent/10 shadow-[0_0_15px_rgba(255,223,44,0.2)] hover:shadow-[0_0_25px_rgba(255,223,44,0.4)]',
        // Серая outline - для завершенных/неактивных
        secondary:
          'border-2 border-muted bg-transparent text-muted-foreground hover:bg-muted/10 hover:text-foreground',
        // Ghost для навигации
        ghost: 'text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors',
        // Деструктивная (красная) - для ошибок и удаления
        destructive:
          'bg-red-600 text-white border-2 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:scale-[1.02]',
        // Success (зеленая) - для успешных действий
        success:
          'bg-green-600 text-white border-2 border-green-600 shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:shadow-[0_0_30px_rgba(22,163,74,0.5)] hover:scale-[1.02]',
        // Loading - состояние загрузки
        loading:
          'bg-accent/50 text-black border-2 border-accent/50 cursor-wait opacity-70',
        // Link стиль
        link: 'text-accent underline-offset-4 hover:underline uppercase tracking-wide',
        // Nav для хедера
        nav: 'text-muted-foreground hover:text-accent [&.active]:text-accent p-0 pt-2 pb-6 tracking-widest text-xs',
      },
      size: {
        clear: '',
        default: 'h-10 px-6 py-2',
        sm: 'h-8 px-4 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    isLoading?: boolean
  }

function Button({
  className,
  variant,
  size,
  asChild = false,
  isLoading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  // Если загрузка, переопределяем variant
  const effectiveVariant = isLoading ? 'loading' : variant
  const computedClassName = cn(buttonVariants({ variant: effectiveVariant, size, className }))

  // Если asChild и не загружается, используем Slot
  if (asChild && !isLoading) {
    return (
      <Slot
        data-slot="button"
        className={computedClassName}
        {...props}
      >
        {children}
      </Slot>
    )
  }

  // Обычная кнопка
  return (
    <button
      data-slot="button"
      className={computedClassName}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <IconLoader2 className="animate-spin" />}
      {children}
    </button>
  )
}

export { Button, buttonVariants }
