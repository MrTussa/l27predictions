'use client'

import { useState } from 'react'
import { toast } from 'sonner'

type RatingValue = 'bad' | 'normal' | 'good'

type Props = {
  raceId: string
  initialRating?: RatingValue
}

const OPTIONS: {
  value: RatingValue
  label: string
  color: string
  glowColor: string
  shadowColor: string
  idleDot: string
  idleBorder: string
}[] = [
  {
    value: 'bad',
    label: 'Плохая гонка',
    color: '#ff0000',
    glowColor: 'rgba(255, 0, 0, 0.6)',
    shadowColor: 'rgba(255, 0, 0, 0.3)',
    idleDot: '#3a1010',
    idleBorder: 'rgba(255, 0, 0, 0.15)',
  },
  {
    value: 'normal',
    label: 'Нормальная гонка',
    color: '#ffcc00',
    glowColor: 'rgba(255, 204, 0, 0.6)',
    shadowColor: 'rgba(255, 204, 0, 0.3)',
    idleDot: '#2e2810',
    idleBorder: 'rgba(255, 204, 0, 0.15)',
  },
  {
    value: 'good',
    label: 'Хорошая гонка',
    color: '#00ff44',
    glowColor: 'rgba(0, 255, 68, 0.6)',
    shadowColor: 'rgba(0, 255, 68, 0.3)',
    idleDot: '#0e2a14',
    idleBorder: 'rgba(0, 255, 68, 0.15)',
  },
]

export const RateSelect: React.FC<Props> = ({ raceId, initialRating }) => {
  const [rate, setRate] = useState<RatingValue | ''>(initialRating ?? '')
  const [loading, setLoading] = useState<boolean>(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const handleChange = async (value: RatingValue) => {
    if (value === rate || loading) return
    const previous = rate
    setRate(value)
    setLoading(true)

    try {
      const res = await fetch('/api/update-race-ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ raceId, rating: value }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Оценка сохранена!`)
    } catch {
      setRate(previous)
      toast.error('Не удалось сохранить оценку, попробуйте ещё раз')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex w-full items-center justify-center flex-col gap-4">
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        Оцените гонку
      </span>
      <div
        style={{
          display: 'flex',
          gap: '12px',
          opacity: loading ? 0.6 : 1,
          transition: 'opacity 0.15s',
        }}
      >
        {OPTIONS.map((opt, i) => {
          const isActive = rate === opt.value
          const isHovered = hoveredIndex === i

          return (
            <button
              key={opt.value}
              onClick={() => handleChange(opt.value)}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              disabled={loading}
              aria-label={opt.label}
              aria-pressed={isActive}
              className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              style={{
                position: 'relative',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                border: `2px solid ${isActive ? opt.color + '44' : opt.idleBorder}`,
                cursor: loading ? 'not-allowed' : 'pointer',
                padding: 0,
                background: '#111',
                boxShadow: isActive
                  ? `0 0 16px ${opt.glowColor}, 0 0 48px ${opt.shadowColor}`
                  : 'none',
                transition: 'box-shadow 0.15s ease-out, border-color 0.15s ease-out',
              }}
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 64 64"
                style={{ position: 'absolute', inset: 0 }}
              >
                {Array.from({ length: 15 }).map((_, row) =>
                  Array.from({ length: 15 }).map((_, col) => {
                    const cx = 4 + col * 4
                    const cy = 4 + row * 4
                    const dist = Math.sqrt((cx - 32) ** 2 + (cy - 32) ** 2)
                    if (dist > 27) return null
                    return (
                      <circle
                        key={`${row}-${col}`}
                        cx={cx}
                        cy={cy}
                        r={1.2}
                        fill={isActive ? opt.color : isHovered ? `${opt.color}66` : opt.idleDot}
                        opacity={isActive ? Math.max(0.5, 1 - dist / 40) : isHovered ? 0.6 : 0.7}
                        style={{ transition: 'fill 0.12s, opacity 0.12s' }}
                      />
                    )
                  }),
                )}
              </svg>
            </button>
          )
        })}
      </div>
    </div>
  )
}
