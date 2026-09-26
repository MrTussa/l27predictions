import { cn } from '@/utilities/cn'
import type { ReactNode } from 'react'

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-base font-black uppercase tracking-wide">
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

/** Текст от нейросети; пока он генерируется — мерцающая заглушка той же высоты */
export function AiText({ text, lines = 1 }: { text?: string; lines?: number }) {
  if (text) return <>{text}</>
  return (
    <span className="inline-flex w-full flex-col gap-1.5 align-middle" aria-busy="true">
      {Array.from({ length: lines }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'block h-[0.9em] animate-pulse rounded-sm bg-muted/60',
            i === lines - 1 ? 'w-2/3' : 'w-full',
          )}
        />
      ))}
    </span>
  )
}

export function Pill({
  children,
  color = 'var(--accent)',
}: {
  children: ReactNode
  color?: string
}) {
  return (
    <span
      className="clip-path-cut-corner-xs inline-block px-3 py-1 text-[11px] font-black uppercase tracking-widest text-black"
      style={{ backgroundColor: color }}
    >
      {children}
    </span>
  )
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border border-border bg-background/60 px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider [&_svg]:size-3.5',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function StatTile({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="border border-border bg-background/60 px-2 py-2 text-center">
      <div className="text-xl font-black italic leading-none tabular-nums">{value}</div>
      <div className="mt-1 font-mono text-[9px] uppercase leading-tight tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  )
}
