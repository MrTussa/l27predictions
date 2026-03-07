'use client'

import { useEffect, useRef, useState } from 'react'

import { Card } from '@/components/ui/card'
import type { BroadcastSetting } from '@/payload-types'

import { cn } from '@/utilities/cn'
import {
  IconArrowBarLeft,
  IconArrowBarRight,
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconMaximize,
  IconMinimize,
} from '@tabler/icons-react'
import { useFullscreen } from '../_lib/useFullscreen'
import useOrientation from '../_lib/useOrientation'
import { AdminControls } from './AdminControls'
import { OfflineState } from './OfflineState'
import { PipOverlay } from './PipOverlay'

function getVkEmbedUrl(url: string): string {
  const match = url.match(/video(-?\d+)_(\d+)/)
  if (!match) return url
  return `https://vk.com/video_ext.php?oid=${match[1]}&id=${match[2]}&autoplay=1`
}

interface BroadcastLayoutProps {
  settings: BroadcastSetting
  isAdmin: boolean
  isMobile: boolean
}

export function BroadcastLayout({ settings, isAdmin, isMobile }: BroadcastLayoutProps) {
  const [parentDomain, setParentDomain] = useState<string>('')
  const [theatre, setTheatre] = useState<boolean>(false)
  const [chatToggle, setChatToggle] = useState<boolean>(false)
  const mainPlayerRef = useRef<HTMLDivElement>(null)
  const orientation = useOrientation()
  const { containerRef: fullscreenRef, isFullscreen, toggle: toggleFullscreen } = useFullscreen()
  useEffect(() => {
    setParentDomain(window.location.hostname)
  }, [])

  useEffect(() => {
    document.body.style.overflow = theatre ? 'hidden' : ''
    window.scrollTo({
      top: 0,
      left: 0,
    })
    return () => {
      document.body.style.overflow = ''
    }
  }, [theatre])
  useEffect(() => {
    if (orientation === 'landscape' && isMobile) {
      setTheatre(true)
    } else {
      setTheatre(false)
    }
  }, [orientation, isMobile])

  const isLive = settings.isLive && settings.twitchChannel && settings.vkChannel

  const theatreStyle = theatre
    ? ({
        position: 'absolute',
        width: '100dvw',
        height: '100dvh',
        top: '0%',
        zIndex: '9999',
        overflow: 'hidden',
        display: isMobile && orientation === 'portrait' ? 'flex' : 'grid',
        flexDirection: isMobile && orientation === 'portrait' ? 'column' : 'row',
      } as React.CSSProperties)
    : {}

  return (
    <>
      {isAdmin && (
        <div className="container">
          <AdminControls settings={settings} />

          {!isLive && !isAdmin && <OfflineState />}

          {!isLive && isAdmin && (
            <p className="text-muted-foreground text-sm mb-4">
              Трансляция не активна. Заполните поля выше и нажмите &quot;Начать трансляцию&quot;.
            </p>
          )}
        </div>
      )}

      {isLive && parentDomain && (
        <div
          ref={fullscreenRef}
          className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto]"
          style={theatreStyle}
        >
          {isMobile && orientation === 'portrait' && (
            <>
              <div className="w-full h-auto flex justify-center items-center bg-black">
                <div
                  ref={mainPlayerRef}
                  className="relative w-full"
                  style={{ aspectRatio: '16/9' }}
                >
                  <button
                    onClick={() => setTheatre((prevState) => !prevState)}
                    className="absolute top-0 left-0 w-fit z-20 flex items-center justify-center px-2 py-1.5 cursor-pointer"
                  >
                    {theatre ? <IconArrowsMinimize /> : <IconArrowsMaximize />}
                  </button>
                  <iframe
                    src={getVkEmbedUrl(settings.vkChannel!)}
                    title="VK Stream"
                    className="w-full h-full border-0"
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock"
                    allowFullScreen
                  />

                  <iframe
                    src={`https://player.twitch.tv/?channel=${settings.twitchChannel}&parent=${parentDomain}`}
                    title="Twitch Stream"
                    className="w-full h-full border-0"
                    allowFullScreen
                    allow="autoplay; encrypted-media"
                  />
                </div>
              </div>

              <Card variant="default" corners="sharp" className="h-full">
                <iframe
                  src={`https://www.twitch.tv/embed/${settings.twitchChannel}/chat?parent=${parentDomain}&darkpopout`}
                  title="Twitch Chat"
                  className="w-full h-full border-0"
                />
              </Card>
            </>
          )}
          {(!isMobile || orientation === 'landscape') && (
            <>
              <div
                className={cn(
                  'relative flex justify-center items-center bg-black',
                  theatre ? 'flex-1 h-full' : 'h-auto',
                )}
              >
                {(!isMobile || orientation === 'portrait') && (
                  <button
                    onClick={() => setTheatre((prevState) => !prevState)}
                    className="absolute top-0 left-0 w-fit z-20 flex items-center justify-center px-2 py-1.5 cursor-pointer"
                  >
                    {theatre ? <IconArrowsMinimize /> : <IconArrowsMaximize />}
                  </button>
                )}

                {theatre && (
                  <button
                    onClick={toggleFullscreen}
                    className={`absolute top-0 z-20 flex items-center justify-center px-2 py-1.5 cursor-pointer ${isMobile && orientation === 'landscape' ? 'left-0' : 'left-8'}`}
                  >
                    {isFullscreen ? <IconMinimize /> : <IconMaximize />}
                  </button>
                )}

                <div
                  ref={mainPlayerRef}
                  className="relative"
                  style={
                    theatre
                      ? { aspectRatio: '16/9', height: '100%', width: 'auto', maxWidth: '100%' }
                      : { aspectRatio: '16/9', width: '100%' }
                  }
                >
                  <iframe
                    src={getVkEmbedUrl(settings.vkChannel!)}
                    title="VK Stream"
                    className="absolute inset-0 w-full h-full border-0"
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock"
                    allowFullScreen
                  />

                  <PipOverlay containerRef={mainPlayerRef}>
                    <iframe
                      src={`https://player.twitch.tv/?channel=${settings.twitchChannel}&parent=${parentDomain}`}
                      title="Twitch Stream"
                      className="w-full h-full border-0"
                      allowFullScreen
                      allow="autoplay; encrypted-media"
                    />
                  </PipOverlay>
                </div>

                <button
                  onClick={() => setChatToggle((prevState) => !prevState)}
                  className="absolute top-0 right-0 w-fit z-20 flex items-center justify-center px-2 py-1.5 cursor-pointer"
                >
                  {chatToggle ? <IconArrowBarLeft /> : <IconArrowBarRight />}
                </button>
              </div>

              {/* Twitch Chat */}
              <div
                className={`h-auto w-full md:w-[25vw] bg-secondary min-w-0 md:min-w-[350px] ${chatToggle && 'hidden'}`}
              >
                <iframe
                  src={`https://www.twitch.tv/embed/${settings.twitchChannel}/chat?parent=${parentDomain}&darkpopout`}
                  title="Twitch Chat"
                  className="w-full h-full border-0"
                />
              </div>
            </>
          )}
        </div>
      )}

      {isLive && !parentDomain && (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-0">
          <div className="w-full animate-pulse bg-card" style={{ aspectRatio: '16/9' }} />
          <div className="w-full h-[400px] xl:h-[calc(100vh-120px)] animate-pulse bg-card" />
        </div>
      )}
    </>
  )
}
