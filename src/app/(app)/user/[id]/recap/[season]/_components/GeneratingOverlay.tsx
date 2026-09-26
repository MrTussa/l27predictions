'use client'

import { useEffect, useState } from 'react'

const DEFAULT_PHRASES = [
  'Считаем очки…',
  'Разбираем твои нули…',
  'Смотрим стартовую решётку…',
  'Проверяем, шёл ли дождь…',
  'Нейросеть подбирает выражения…',
  'Пишем прожарку…',
]

/** Метка в fallback Suspense: пока она в DOM, тексты ещё генерируются */
export function GeneratingMarker() {
  return <span data-recap-generating hidden />
}

/**
 * Экран «нейросеть пишет тексты» со стартовыми огнями F1.
 * Стоит вне Suspense: React не гидрирует fallback ожидающей границы, поэтому оверлей
 * следит за меткой GeneratingMarker и прячется, когда контент пришёл.
 * Появляется с задержкой, чтобы не мелькать, когда тексты уже сохранены.
 */
export function GeneratingOverlay({ phrases = DEFAULT_PHRASES }: { phrases?: string[] }) {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const generating = () => !!document.querySelector('[data-recap-generating]')
    const show = setTimeout(() => setVisible(generating()), 600)
    const tick = setInterval(() => {
      if (!generating()) setVisible(false)
      setStep((current) => current + 1)
    }, 450)
    return () => {
      clearTimeout(show)
      clearInterval(tick)
    }
  }, [])

  if (!visible) return null

  // Огни загораются по одному, потом гаснут — как на старте
  const lit = step % 8
  const phrase = phrases[Math.floor(step / 8) % phrases.length]

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-40 flex items-center justify-center bg-background/70 backdrop-blur-sm"
    >
      <div className="clip-path-cut-corner flex flex-col items-center gap-5 border border-border bg-card px-10 py-8">
        <div className="flex gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="size-7 rounded-full border-2 border-black/60 transition-all duration-150"
              style={{
                background: i < lit && lit <= 5 ? '#E10600' : '#2a0a0a',
                boxShadow: i < lit && lit <= 5 ? '0 0 18px rgba(225,6,0,0.8)' : 'none',
              }}
            />
          ))}
        </div>
        <div className="text-center">
          <div className="text-lg font-black uppercase tracking-wide">Готовим итоги</div>
          <div className="mt-1 min-h-5 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {phrase}
          </div>
        </div>
      </div>
    </div>
  )
}
