import { Card, type CardProps } from '@/components/ui/card'
import { cn } from '@/utilities/cn'
import type { RecapRace } from '@/utilities/seasonRecap/types'
import type { ReactNode } from 'react'

// Язык ТВ-графики F1 в цветах сайта: карточки со срезанными углами, жёлтые плашки,
// строки таймингтауэра и «командное радио» для текстов нейросети.

/** Фирменный жёлтый сайта */
export const ACCENT = '#FFDF2C'
/** Только для смысла «плохо»: ноль очков, падение в таблице, плохая оценка */
export const NEGATIVE = '#ff4d4d'
export const POSITIVE = '#00d26a'
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

/** Заголовок раздела как плашка трансляции: жёлтый номер + название */
export function Heading({
  index,
  children,
  aside,
  as: Tag = 'h2',
}: {
  index: string
  children: ReactNode
  aside?: ReactNode
  /** h1 — для заголовка страницы */
  as?: 'h1' | 'h2'
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3 border-b border-white/10 pb-2">
      <div className="flex items-center gap-3">
        <span className="clip-path-cut-corner-xs bg-accent px-2 py-0.5 font-mono text-sm font-black text-black">
          {index}
        </span>
        <Tag className="text-2xl font-bold uppercase tracking-tight">{children}</Tag>
      </div>
      {aside && (
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:block">
          {aside}
        </span>
      )}
    </div>
  )
}

/**
 * Фирменная карточка сайта со срезанными углами.
 * accent — цветная рамка слева (или снизу) с лёгкой подсветкой фона, как у Card.
 */
export function Panel({
  accent,
  accentPosition,
  variant = 'default',
  corners = 'cut-corner',
  className,
  bodyClassName,
  children,
}: {
  accent?: string
  accentPosition?: 'left' | 'bottom'
  variant?: CardProps['variant']
  corners?: CardProps['corners']
  className?: string
  bodyClassName?: string
  children: ReactNode
}) {
  return (
    <Card
      variant={variant}
      corners={corners}
      accentColor={accent}
      accentPosition={accentPosition}
      className={className}
    >
      <div className={cn('relative h-full px-5', bodyClassName)}>{children}</div>
    </Card>
  )
}

/** Текст нейросети в виде «командного радио» из трансляций */
export function Radio({
  text,
  from = 'Паддок L27',
  color = ACCENT,
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
        <p className="text-sm font-medium leading-relaxed text-white/90 sm:text-base">«{text}»</p>
      </div>
    </div>
  )
}

/** Заголовок внутри карточки: жёлтая черта и подпись, справа — дополнение */
export function CardHeading({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-base font-bold uppercase tracking-wide">
        <span className="inline-block h-0.75 w-3.5 bg-accent" />
        {children}
      </h2>
      {aside && (
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {aside}
        </span>
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

/** Ячейка с цифрой: подпись, крупное значение, пояснение */
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
    <div className="bg-card px-4 py-3">
      <Caption>{label}</Caption>
      <div
        className="pt-1 text-3xl font-black leading-none tabular-nums"
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
    <Panel accent={color} accentPosition="bottom" className="h-full" bodyClassName="px-4">
      {race.trackSVGPath && (
        <svg
          viewBox="144 144 512 512"
          aria-hidden="true"
          className="pointer-events-none absolute -right-2 -top-4 size-32 opacity-20"
          fill={color}
        >
          <path d={race.trackSVGPath} />
        </svg>
      )}
      <div className="relative space-y-2">
        <Caption color={color}>{label}</Caption>
        <div className="max-w-[75%] font-bold leading-snug">{race.name}</div>
        <div className="pt-1 text-4xl font-black tabular-nums">{value}</div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {unit}
        </div>
      </div>
    </Panel>
  )
}
