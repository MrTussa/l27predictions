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

      // Вычисляем позицию для центрирования
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

      <div ref={scrollContainerRef} className="flex gap-4 overflow-x-auto px-16 py-4 no-scrollbar">
        {races.map((race) => {
          const isSelected = race.id === selectedRace.id
          const svgPath = race.trackSVGPath || undefined

          return (
            <button
              key={race.id}
              ref={isSelected ? selectedCardRef : null}
              onClick={() => onRaceSelect(race)}
              className={`shrink-0 transition-all ${
                isSelected ? 'scale-110' : 'scale-90 opacity-50 hover:opacity-75'
              }`}
            >
              <Card
                variant={isSelected ? 'yellow' : 'gray'}
                corners={isSelected ? 'cut-corner' : 'sharp'}
                className="w-48 h-48 p-0 overflow-hidden"
              >
                <div className="h-32">
                  {svgPath ? (
                    <RaceTrackVisualization
                      svgPath={svgPath}
                      color={isSelected ? '#FFDF2C' : '#666666'}
                      useBloom={false}
                      rotationSpeed={0.001}
                    />
                  ) : (
                    <div className="w-full h-full bg-muted/20 flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">Нет трассы</span>
                    </div>
                  )}
                </div>
                <div className="p-3 text-center">
                  <div className="text-xs font-bold uppercase truncate">{race.name}</div>
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
