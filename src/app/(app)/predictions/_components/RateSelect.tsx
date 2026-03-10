'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'

type RatingValue = 'bad' | 'normal' | 'good'

type Props = {
  raceId: string
  initialRating?: RatingValue
}

export const RateSelect: React.FC<Props> = ({ raceId, initialRating }) => {
  const [rate, setRate] = useState<RatingValue | ''>(initialRating ?? '')
  const [loading, setLoading] = useState<boolean>(false)

  const handleChange = async (value: RatingValue) => {
    setRate(value)
    setLoading(true)

    try {
      await fetch('/api/update-race-ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ raceId, rating: value }),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Select
      disabled={loading}
      value={rate}
      onValueChange={(value) => handleChange(value as RatingValue)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Оцените гонку!" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={'bad'}>Плохо</SelectItem>
        <SelectItem value={'normal'}>Нормально</SelectItem>
        <SelectItem value={'good'}>Хорошо</SelectItem>
      </SelectContent>
    </Select>
  )
}
