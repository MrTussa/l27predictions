'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Race } from '@/payload-types'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useLayoutEffect, useRef, useState, useTransition } from 'react'

const RaceTrackVisualization = dynamic(() => import('@/components/ui/racetrack'), { ssr: false })

type CarouselRace = Pick<Race, 'id' | 'name' | 'round' | 'trackSVGPath'>

interface RaceCarouselProps {
  races: CarouselRace[]
  selectedRaceId: string
}

export function RaceCarousel({ races, selectedRaceId }: RaceCarouselProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const selectedCardRef = useRef<HTMLButtonElement>(null)

  const [activeId, setActiveId] = useState(selectedRaceId)
  const [prevSelectedId, setPrevSelectedId] = useState(selectedRaceId)
  if (prevSelectedId !== selectedRaceId) {
    setPrevSelectedId(selectedRaceId)
    setActiveId(selectedRaceId)
  }
  const selectedRace = races.find((r) => r.id === activeId) ?? races[0]

  const onRaceSelect = (race: CarouselRace) => {
    setActiveId(race.id)
    startTransition(() => router.replace(`/predictions?race=${race.id}`, { scroll: false }))
  }

  // Центрирование выбранной гонки
  useLayoutEffect(() => {
    if (scrollContainerRef.current && selectedCardRef.current) {
      const container = scrollContainerRef.current
      const selectedCard = selectedCardRef.current
      const containerWidth = container.clientWidth
      const cardLeft = selectedCard.offsetLeft
      const cardWidth = selectedCard.offsetWidth

      const scrollPosition = cardLeft - containerWidth / 2 + cardWidth / 2

      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      })
    }
  }, [selectedRace.id])

  const scrollToRace = (direction: 'left' | 'right') => {
    const currentIndex = races.findIndex((r) => r.id === selectedRace.id)
    if (direction === 'left' && currentIndex > 0) {
      onRaceSelect(races[currentIndex - 1])
    } else if (direction === 'right' && currentIndex < races.length - 1) {
      onRaceSelect(races[currentIndex + 1])
    }
  }

  const currentIndex = races.findIndex((r) => r.id === selectedRace.id)

  return (
    <div className="relative py-8 overflow-hidden" aria-busy={isPending}>
      <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
        onClick={() => scrollToRace('left')}
        disabled={currentIndex === 0}
        aria-label="Предыдущая гонка"
      >
        <IconChevronLeft className="w-6 h-6" />
      </Button>

      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto px-16 py-4 no-scrollbar text-accent"
      >
        {races.map((race) => {
          const isSelected = race.id === selectedRace.id
          const svgPath = race.trackSVGPath || undefined

          return (
            <button
              key={race.id}
              ref={isSelected ? selectedCardRef : null}
              onClick={() => onRaceSelect(race)}
              aria-current={isSelected ? 'true' : undefined}
              className={`shrink-0 cursor-pointer transition-all ${
                isSelected ? 'scale-110' : 'scale-90 opacity-50 hover:opacity-75'
              }`}
            >
              <Card
                variant={isSelected ? 'yellow' : 'gray'}
                corners={isSelected ? 'cut-corner' : 'sharp'}
                className="w-48 h-48 p-0.5 overflow-hidden"
              >
                <div className="h-32 ">
                  {svgPath ? (
                    isSelected ? (
                      <RaceTrackVisualization
                        svgPath={svgPath}
                        className={'absolute w-full h-full z-1 -translate-y-8'}
                        color="#FFDF2C"
                        useBloom={false}
                        rotationSpeed={0.001}
                      />
                    ) : (
                      <svg
                        viewBox="100 100 512 512"
                        className="w-full h-full opacity-60 p-2"
                        fill="#FFFFFF"
                      >
                        <path d={svgPath} />
                      </svg>
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">Нет трассы</span>
                    </div>
                  )}
                </div>
                <div className="p-3 text-center">
                  <div className="text-xs font-bold uppercase truncate">{race.name}</div>
                  <div className="text-xs text-muted-foreground/70 mt-0.5">{race.round} Раунд</div>
                </div>
              </Card>
            </button>
          )
        })}
      </div>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
        onClick={() => scrollToRace('right')}
        disabled={currentIndex === races.length - 1}
        aria-label="Следующая гонка"
      >
        <IconChevronRight className="w-6 h-6" />
      </Button>
    </div>
  )
}
