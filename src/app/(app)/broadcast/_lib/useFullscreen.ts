'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface WebkitDocument extends Document {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void>
}

interface WebkitElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>
}

export function useFullscreen() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => {
      const doc = document as WebkitDocument
      setIsFullscreen(!!(document.fullscreenElement || doc.webkitFullscreenElement))
    }
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
    }
  }, [])

  const enter = useCallback(async () => {
    const el = (containerRef.current ?? document.documentElement) as WebkitElement
    try {
      if (el.requestFullscreen) {
        await el.requestFullscreen()
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen()
      }
    } catch {}
  }, [])

  const exit = useCallback(async () => {
    const doc = document as WebkitDocument
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen()
      }
    } catch {}
  }, [])

  const toggle = useCallback(() => {
    const doc = document as WebkitDocument
    if (document.fullscreenElement || doc.webkitFullscreenElement) {
      exit()
    } else {
      enter()
    }
  }, [enter, exit])

  return { containerRef, isFullscreen, toggle }
}
