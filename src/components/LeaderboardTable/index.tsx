'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { ArrowUpDown, Trophy, Medal, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'

type LeaderboardEntry = {
  id: string
  nickname: string
  chartColor: string
  totalPoints: number
  totalPredictions: number
  perfectPredictions: number
  averagePoints: number
}

type Props = {
  data: LeaderboardEntry[]
}

type SortKey = 'totalPoints' | 'totalPredictions' | 'perfectPredictions' | 'averagePoints'

export const LeaderboardTable: React.FC<Props> = ({ data: initialData }) => {
  const [sortKey, setSortKey] = useState<SortKey>('totalPoints')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('desc')
    }
  }

  const sortedData = [...initialData].sort((a, b) => {
    const aValue = a[sortKey]
    const bValue = b[sortKey]
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
  })

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-5 h-5 text-accent" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return null
    }
  }

  const getRowStyles = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-accent/10 hover:bg-accent/15 border-l-4 border-accent font-bold'
      case 2:
        return 'bg-muted/30 hover:bg-muted/40 border-l-4 border-gray-400'
      case 3:
        return 'bg-muted/20 hover:bg-muted/30 border-l-4 border-amber-600'
      default:
        return 'hover:bg-muted/20'
    }
  }

  return (
    <Card variant="yellow-glow" corners="cut-corner" className="overflow-hidden gap-0 py-0">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-16 text-center">#</TableHead>
            <TableHead>Участник</TableHead>
            <TableHead className="text-right">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => handleSort('totalPoints')}
              >
                Баллы
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => handleSort('totalPredictions')}
              >
                Прогнозов
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => handleSort('perfectPredictions')}
              >
                Идеальных
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => handleSort('averagePoints')}
              >
                Средний балл
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((entry, index) => {
            const position = index + 1
            return (
              <TableRow key={entry.id} className={getRowStyles(position)}>
                <TableCell className="text-center font-medium">
                  <div className="flex items-center justify-center gap-2">
                    {getPositionIcon(position)}
                    <span>{position}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.chartColor }}
                    />
                    {entry.nickname}
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold">{entry.totalPoints}</TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {entry.totalPredictions}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {entry.perfectPredictions}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {entry.averagePoints.toFixed(2)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
