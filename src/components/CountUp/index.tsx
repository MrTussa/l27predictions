'use client'

import { animate, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'

// Animates 0 → value on mount. Honors prefers-reduced-motion.
export const CountUp: React.FC<{
  value: number
  duration?: number
  className?: string
}> = ({ value, duration = 1, className }) => {
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(reduce ? value : 0)

  useEffect(() => {
    if (reduce) {
      setDisplay(value)
      return
    }
    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => controls.stop()
  }, [value, duration, reduce])

  return <span className={className}>{display}</span>
}
