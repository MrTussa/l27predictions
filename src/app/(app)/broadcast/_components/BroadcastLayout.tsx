'use client'

import { useEffect, useRef, useState } from 'react'

import { Card } from '@/components/ui/card'
import type { BroadcastSetting } from '@/payload-types'

import { IconArrowsMaximize, IconArrowsMinimize } from '@tabler/icons-react'
import { AdminControls } from './AdminControls'
import { OfflineState } from './OfflineState'
import { PipOverlay } from './PipOverlay'

interface BroadcastLayoutProps {
  settings: BroadcastSetting
  isAdmin: boolean
}

export function BroadcastLayout({ settings, isAdmin }: BroadcastLayoutProps) {
  const [parentDomain, setParentDomain] = useState<string>('')
  const [theatre, setTheatre] = useState<boolean>(false)
  const mainPlayerRef = useRef<HTMLDivElement>(null)

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

  const isLive = settings.isLive && settings.twitchChannel && settings.vkChannel

  const theatreStyle = theatre
    ? ({
        position: 'absolute',
        width: '100dvw',
        height: '100dvh',
        top: '0%',
        zIndex: '9999',
        overflow: 'hidden',
      } as React.CSSProperties)
    : {}

  return (
    <>
      <div className="container">
        {isAdmin && <AdminControls settings={settings} />}

        {!isLive && !isAdmin && <OfflineState />}

        {!isLive && isAdmin && (
          <p className="text-muted-foreground text-sm mb-4">
            Трансляция не активна. Заполните поля выше и нажмите &quot;Начать трансляцию&quot;.
          </p>
        )}
      </div>

      {isLive && parentDomain && (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-0" style={theatreStyle}>
          <div className="relative">
            {/* VK */}
            <div className="w-full h-full flex justify-center items-center bg-black ">
              <div
                ref={mainPlayerRef}
                className="relative w-full overflow-hidden"
                style={{ aspectRatio: '16/9' }}
              >
                <button
                  onClick={() => setTheatre((prevState) => !prevState)}
                  className="absolute top-0 left-0 w-fit z-20 flex items-center justify-center px-2 py-1.5 cursor-pointer"
                >
                  {theatre ? <IconArrowsMinimize /> : <IconArrowsMaximize />}
                </button>
                <iframe
                  src={`https://live.vkvideo.ru/app/embed/${settings.vkChannel}`}
                  title="VK Stream"
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  allow="autoplay; encrypted-media"
                />
              </div>
            </div>

            {/* Twitch */}
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

          {/* Twitch Chat */}
          <Card variant="default" corners="sharp" className="h-auto">
            <iframe
              src={`https://www.twitch.tv/embed/${settings.twitchChannel}/chat?parent=${parentDomain}&darkpopout`}
              title="Twitch Chat"
              className="w-full h-full border-0"
            />
          </Card>
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
