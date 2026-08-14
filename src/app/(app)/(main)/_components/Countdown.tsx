'use client'

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
      className="text-2xl md:text-6xl font-bold font-mono text-accent text-shadow-accent text-shadow-[0_0_30px] tabular-nums"
    >
      {value}
    </span>
    <span className="text-xs md:text-base text-muted-foreground">{label}</span>
  </div>
)

const Colon = () => (
  <span className="font-bold font-mono text-muted-foreground text-xl leading-8 md:text-4xl md:leading-14">
    :
  </span>
)

// Live ticking countdown. The server value was static and only updated on
// reload; this ticks every second.
export const Countdown: React.FC<{ targetDate: string }> = ({ targetDate }) => {
  const target = new Date(targetDate).getTime()
  const [now, setNow] = useState<number>(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const { days, hours, minutes, seconds } = parts(target, now)

  return (
    <div className="flex flex-row">
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
