import type { ReactNode } from 'react'

/** Рамка подсказки для графиков recharts в стиле ТВ-графики */
export function ChartTooltip({
  title,
  color = '#FFDF2C',
  children,
}: {
  title: ReactNode
  color?: string
  children: ReactNode
}) {
  return (
    <div className="flex max-w-60 overflow-hidden border border-white/15 bg-black/90 shadow-xl backdrop-blur-sm">
      <div className="w-1 shrink-0" style={{ background: color }} />
      <div className="space-y-1.5 px-3 py-2">
        <div className="truncate font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white">
          {title}
        </div>
        <div className="space-y-1 text-xs">{children}</div>
      </div>
    </div>
  )
}

/** Строка подсказки: цветная метка, подпись, значение */
export function ChartTooltipRow({
  color,
  label,
  value,
}: {
  color?: string
  label: ReactNode
  value: ReactNode
}) {
  return (
    <div className="flex items-center gap-2">
      {color && <span className="h-2.5 w-1 shrink-0" style={{ background: color }} />}
      <span className="min-w-0 flex-1 truncate text-muted-foreground">{label}</span>
      <span className="font-mono font-bold tabular-nums text-white">{value}</span>
    </div>
  )
}
