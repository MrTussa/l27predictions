'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

function parts(target: number, now: number) {
  const ms = Math.max(0, target - now)
  const totalSec = Math.floor(ms / 1000)
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  }
}

const Digit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center">
    {/* серверное и клиентское время расходятся на секунды — гидрация чинит сама */}
    <span
      suppressHydrationWarning
      className="-skew-x-6 text-3xl font-black italic text-accent text-shadow-accent text-shadow-[0_0_30px] tabular-nums md:text-6xl"
    >
      {value}
    </span>
    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground md:text-xs">
      {label}
    </span>
  </div>
)

const Colon = () => (
  <span className="px-1.5 text-xl font-black leading-9 text-white/30 md:px-2.5 md:text-4xl md:leading-15">
    :
  </span>
)

// Live ticking countdown. The server value was static and only updated on
// reload; this ticks every second.
export const Countdown: React.FC<{ targetDate: string }> = ({ targetDate }) => {
  const target = new Date(targetDate).getTime()
  const [now, setNow] = useState<number>(() => Date.now())
  const router = useRouter()
  const isOver = now >= target

  useEffect(() => {
    if (isOver) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [isOver])

  useEffect(() => {
    if (isOver) router.refresh()
  }, [isOver, router])

  const { days, hours, minutes, seconds } = parts(target, now)

  return (
    <div className="flex flex-row" role="timer" aria-label="До закрытия прогнозов">
      <Digit value={days} label="дни" />
      <Colon />
      <Digit value={hours} label="часы" />
      <Colon />
      <Digit value={minutes} label="мин" />
      <Colon />
      <Digit value={seconds} label="сек" />
    </div>
  )
}
