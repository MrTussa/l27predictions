'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowUpDown, Award, Medal, Trophy } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type LeaderboardEntry = {
  id: string
  nickname: string
  chartColor: string
  totalPoints: number
  totalPredictions: number
  perfectPredictions: number
  averagePoints: number
  currentStreak: number
  bestStreak: number
}

type Props = {
  data: LeaderboardEntry[]
}

type SortKey =
  | 'totalPoints'
  | 'totalPredictions'
  | 'perfectPredictions'
  | 'averagePoints'
  | 'currentStreak'
  | 'bestStreak'

import { PayloadSDK } from '@payloadcms/sdk'

const sdk = new PayloadSDK({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL!,
})

export const LeaderboardTable: React.FC<Props> = ({ data: initialData }) => {
  const [sortKey, setSortKey] = useState<SortKey>('totalPoints')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [leaderboardData, setLeaderboardData] = useState(initialData)
  const [currentPage, setCurentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('desc')
    }
  }

  function getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(1)
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', currentPage)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }

    return pages
  }

  const pages = getPageNumbers()

  useEffect(() => {
    async function getLeaderboardData() {
      const data = await sdk.find({
        collection: 'season-stats',
        where: {
          season: { equals: new Date().getFullYear() },
        },
        sort: '-totalPoints',
        limit: 15,
        depth: 1,
        page: currentPage,
      })
      return data
    }

    getLeaderboardData().then((result) => {
      setLeaderboardData(result.docs as unknown as LeaderboardEntry[])
      setTotalPages(result.totalPages)
    })
  }, [currentPage])

  const sortedData = [...leaderboardData].sort((a, b) => {
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
    <Card variant="yellow-glow" corners="cut-corner" className="overflow-hidden gap-0">
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
            <TableHead className="text-right">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => handleSort('currentStreak')}
              >
                Стрик
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => handleSort('bestStreak')}
              >
                Лучший стрик
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
                  <Link
                    href={`/user/${entry.id}`}
                    className="flex items-center gap-3 hover:text-accent transition-colors"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.chartColor }}
                    />
                    {entry.nickname}
                  </Link>
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
                <TableCell className="text-right">
                  {entry.currentStreak > 0 ? (
                    <span className="text-accent font-semibold">🔥 {entry.currentStreak}</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {entry.bestStreak > 0 ? entry.bestStreak : '-'}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-center flex-row gap-1 p-3">
          <Button
            variant={'ghost'}
            disabled={currentPage === 1}
            onClick={() => setCurentPage((p) => Math.max(1, p - 1))}
          >
            ←
          </Button>
          {pages.map((page, i) =>
            page === '...' ? (
              <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'ghost'}
                disabled={currentPage === page}
                onClick={() => setCurentPage(page as number)}
              >
                {page}
              </Button>
            ),
          )}
          <Button
            variant={'ghost'}
            disabled={currentPage === totalPages}
            onClick={() => setCurentPage((p) => Math.max(1, p + 1))}
          >
            →
          </Button>
        </div>
      )}
    </Card>
  )
}
