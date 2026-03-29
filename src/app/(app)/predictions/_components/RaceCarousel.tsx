'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import RaceTrackVisualization from '@/components/ui/racetrack'
import type { Race } from '@/payload-types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLayoutEffect, useRef } from 'react'

interface RaceCarouselProps {
  races: Race[]
  selectedRace: Race
  onRaceSelect: (race: Race) => void
}

export function RaceCarousel({ races, selectedRace, onRaceSelect }: RaceCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const selectedCardRef = useRef<HTMLButtonElement>(null)

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
    <div className="relative py-8 overflow-hidden">
      <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
        onClick={() => scrollToRace('left')}
        disabled={currentIndex === 0}
      >
        <ChevronLeft className="w-6 h-6" />
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
      >
        <ChevronRight className="w-6 h-6" />
      </Button>
    </div>
  )
}
