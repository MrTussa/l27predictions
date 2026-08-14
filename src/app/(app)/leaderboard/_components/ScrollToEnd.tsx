'use client'

import { useLayoutEffect, useRef } from 'react'

/**
 * Горизонтальный скроллер, открытый на конце списка.
 * Карточки фиксированной ширины, поэтому scrollWidth известен уже на layout — без прыжка.
 */
export function ScrollToEnd({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
