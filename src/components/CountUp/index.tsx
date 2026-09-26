'use client'

import { useEffect, useState } from 'react'

const easeOut = (t: number) => 1 - (1 - t) ** 3

export const CountUp: React.FC<{
  value: number
  duration?: number
  className?: string
}> = ({ value, duration = 1, className }) => {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value)
      return
    }
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000))
      setDisplay(Math.round(value * easeOut(t)))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration])

  return <span className={className}>{display}</span>
}
