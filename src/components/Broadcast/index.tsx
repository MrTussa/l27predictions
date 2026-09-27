import { cn } from '@/utilities/cn'
import type { RecapRace } from '@/utilities/seasonRecap/types'
import type { ReactNode } from 'react'

// Язык ТВ-графики F1: тёмные плашки, красные полосы, наклонный жирный текст,
// строки таймингтауэра и «командное радио» для текстов нейросети.

export const F1_RED = '#E10600'
export const PANEL = '#15151E'
export const PODIUM_COLORS = ['#FFDF2C', '#C2C9D2', '#CD6B2C']

export function Checkered({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`h-3 ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%), linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%)',
        backgroundSize: '12px 12px',
        backgroundPosition: '0 0, 6px 6px',
      }}
    />
  )
}

/** Заголовок раздела как плашка трансляции: красный скошенный номер + название */
export function Heading({
  index,
  children,
  aside,
}: {
  index: string
  children: ReactNode
  aside?: string
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3 border-b border-white/10 pb-2">
      <div className="flex items-center gap-3">
        <span
          className="-skew-x-12 px-2 py-0.5 font-mono text-sm font-black text-white"
          style={{ background: F1_RED }}
        >
          {index}
        </span>
        <h2 className="-skew-x-6 text-2xl font-black uppercase italic tracking-tight">
          {children}
        </h2>
      </div>
      {aside && (
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:block">
          {aside}
        </span>
      )}
    </div>
  )
}

/** Текст нейросети в виде «командного радио» из трансляций */
export function Radio({
  text,
  from = 'Паддок L27',
  color = F1_RED,
}: {
  text: string
  from?: string
  color?: string
}) {
  return (
    <div className="flex max-w-3xl overflow-hidden border border-white/10 bg-black/60">
      <div className="w-1.5 shrink-0" style={{ background: color }} />
      <div className="flex-1 px-4 py-3">
        <div className="mb-1 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em]">
          <span className="flex items-end gap-0.5" aria-hidden="true">
            {[6, 10, 7, 12].map((h, i) => (
              <span key={i} className="w-0.5 bg-white/70" style={{ height: h }} />
            ))}
          </span>
          <span className="text-white">Team radio</span>
          <span className="text-muted-foreground">· {from}</span>
        </div>
        <p className="text-sm font-semibold italic leading-snug text-white/90 sm:text-base">
          «{text}»
        </p>
      </div>
    </div>
  )
}

/** Тёмная плашка; stripe — цветная полоса сверху */
export function Panel({
  stripe,
  className,
  children,
}: {
  stripe?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn('relative overflow-hidden border border-white/10 bg-[#15151E]', className)}>
      {stripe && (
        <div className="absolute inset-x-0 top-0 z-1 h-1" style={{ background: stripe }} />
      )}
      {children}
    </div>
  )
}

/** Ячейка с цифрой: подпись, крупное наклонное значение, пояснение */
export function Fact({
  label,
  value,
  note,
  color,
}: {
  label: string
  value: ReactNode
  note?: ReactNode
  color?: string
}) {
  return (
    <div className="bg-[#15151E] px-4 py-3">
      <Caption>{label}</Caption>
      <div
        className="-skew-x-12 pt-1 text-3xl font-black italic leading-none tabular-nums"
        style={color ? { color } : undefined}
      >
        {value}
      </div>
      {note && (
        <div className="pt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {note}
        </div>
      )}
    </div>
  )
}

/** Мелкая подпись над значением */
export function Caption({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <div
      className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
      style={color ? { color } : undefined}
    >
      {children}
    </div>
  )
}

/** Плашка гонки с контуром трассы на фоне */
export function TrackPlate({
  label,
  race,
  value,
  unit,
  color,
}: {
  label: string
  race: RecapRace
  value: string
  unit: string
  color: string
}) {
  return (
    <div className="relative overflow-hidden border border-white/10 bg-[#15151E] p-4">
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: color }} />
      {race.trackSVGPath && (
        <svg
          viewBox="144 144 512 512"
          aria-hidden="true"
          className="pointer-events-none absolute -right-4 -top-2 size-36 opacity-25"
          fill={color}
        >
          <path d={race.trackSVGPath} />
        </svg>
      )}
      <div className="relative space-y-2">
        <Caption color={color}>{label}</Caption>
        <div className="max-w-[75%] font-black uppercase leading-tight">{race.name}</div>
        <div className="-skew-x-12 pt-2 text-4xl font-black italic tabular-nums">{value}</div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {unit}
        </div>
      </div>
    </div>
  )
}
