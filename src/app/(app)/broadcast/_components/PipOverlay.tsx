'use client'

import { IconGripHorizontal } from '@tabler/icons-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/utilities/cn'

const MIN_WIDTH = 240
const MAX_WIDTH = 640
const ASPECT_RATIO = 16 / 9
const STORAGE_KEY = 'broadcast-pip-state'

interface PipState {
  x: number
  y: number
  width: number
}

function loadState(): PipState {
  if (typeof window === 'undefined') return { x: -1, y: -1, width: 320 }
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return { x: -1, y: -1, width: 320 }
}

function saveState(s: PipState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {}
}

interface PipOverlayProps {
  children: React.ReactNode
  containerRef: React.RefObject<HTMLDivElement | null>
}

export function PipOverlay({ children, containerRef }: PipOverlayProps) {
  const pipRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<PipState>(() => loadState())
  const [initialized, setInitialized] = useState(false)
  const [interacting, setInteracting] = useState(false)

  const stateRef = useRef(state)
  stateRef.current = state

  const height = state.width / ASPECT_RATIO

  // Ненавижу математику, чертовы xy измерения

  useEffect(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()

    if (stateRef.current.x === -1 || stateRef.current.y === -1) {
      const w = stateRef.current.width
      const h = w / ASPECT_RATIO
      const init: PipState = {
        x: rect.width - w - 16,
        y: rect.height - h - 16,
        width: w,
      }
      setState(init)
      saveState(init)
    }
    setInitialized(true)
  }, [containerRef])

  const getContainerRect = useCallback(() => {
    return containerRef.current?.getBoundingClientRect() ?? null
  }, [containerRef])

  const clampState = useCallback(
    (x: number, y: number, w: number): PipState => {
      const cr = getContainerRect()
      if (!cr) return { x, y, width: w }
      const cw = Math.max(MIN_WIDTH, Math.min(w, MAX_WIDTH, cr.width * 0.6))
      const ch = cw / ASPECT_RATIO
      return {
        x: Math.max(0, Math.min(x, cr.width - cw)),
        y: Math.max(0, Math.min(y, cr.height - ch)),
        width: cw,
      }
    },
    [getContainerRect],
  )

  const handleDragStart = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const cr = getContainerRect()
      if (!cr) return

      setInteracting(true)
      const s = stateRef.current
      const offsetX = e.clientX - cr.left - s.x
      const offsetY = e.clientY - cr.top - s.y

      const onMove = (ev: PointerEvent) => {
        const rect = getContainerRect()
        if (!rect) return
        const rawX = ev.clientX - rect.left - offsetX
        const rawY = ev.clientY - rect.top - offsetY
        const clamped = clampState(rawX, rawY, stateRef.current.width)
        setState(clamped)
      }

      const onUp = () => {
        document.removeEventListener('pointermove', onMove)
        document.removeEventListener('pointerup', onUp)
        setInteracting(false)
        saveState(stateRef.current)
      }

      document.addEventListener('pointermove', onMove)
      document.addEventListener('pointerup', onUp)
    },
    [getContainerRect, clampState],
  )

  const handleResizeStart = useCallback(
    (edge: string) => (e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()

      setInteracting(true)
      const startX = e.clientX
      const ss = { ...stateRef.current }
      const startHeight = ss.width / ASPECT_RATIO

      const onMove = (ev: PointerEvent) => {
        const cr = getContainerRect()
        if (!cr) return
        const dx = ev.clientX - startX

        let newWidth = ss.width
        let newX = ss.x
        let newY = ss.y

        if (edge.includes('e')) {
          newWidth = ss.width + dx
        } else if (edge.includes('w')) {
          newWidth = ss.width - dx
        }

        newWidth = Math.max(MIN_WIDTH, Math.min(newWidth, MAX_WIDTH, cr.width * 0.6))
        const newHeight = newWidth / ASPECT_RATIO

        if (edge.includes('w')) {
          newX = ss.x + ss.width - newWidth
        }
        if (edge.includes('n') || edge === 'n') {
          newY = ss.y + startHeight - newHeight
        }

        newX = Math.max(0, Math.min(newX, cr.width - newWidth))
        newY = Math.max(0, Math.min(newY, cr.height - newHeight))

        setState({ x: newX, y: newY, width: newWidth })
      }

      const onUp = () => {
        document.removeEventListener('pointermove', onMove)
        document.removeEventListener('pointerup', onUp)
        setInteracting(false)
        saveState(stateRef.current)
      }

      document.addEventListener('pointermove', onMove)
      document.addEventListener('pointerup', onUp)
    },
    [getContainerRect],
  )

  if (!initialized) return null

  return (
    <>
      {interacting && <div className="fixed inset-0 z-9999" />}

      <div
        ref={pipRef}
        className={cn(
          'absolute z-10 rounded overflow-visible shadow-[0_0_20px_rgba(0,0,0,0.6)] border border-border/50 group',
          !interacting && 'transition-[width,height] duration-150',
        )}
        style={{
          left: state.x,
          top: state.y,
          width: state.width,
          height,
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 z-20 flex items-center justify-center px-2 py-1.5 bg-linear-to-b from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          onPointerDown={handleDragStart}
        >
          <IconGripHorizontal size={16} className="text-white/80" />
        </div>

        <div
          className="absolute -bottom-1.5 -right-1.5 w-4 h-4 cursor-nwse-resize z-40"
          onPointerDown={handleResizeStart('se')}
        />
        <div
          className="absolute -bottom-1.5 -left-1.5 w-4 h-4 cursor-nesw-resize z-40"
          onPointerDown={handleResizeStart('sw')}
        />
        <div
          className="absolute -top-1.5 -right-1.5 w-4 h-4 cursor-nesw-resize z-40"
          onPointerDown={handleResizeStart('ne')}
        />
        <div
          className="absolute -top-1.5 -left-1.5 w-4 h-4 cursor-nwse-resize z-40"
          onPointerDown={handleResizeStart('nw')}
        />

        <div className="w-full h-full rounded overflow-hidden">{children}</div>
      </div>
    </>
  )
}
