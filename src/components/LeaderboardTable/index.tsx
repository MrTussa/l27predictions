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
import type { SeasonStat, User } from '@/payload-types'
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

type SortKey =
  | 'totalPoints'
  | 'totalPredictions'
  | 'perfectPredictions'
  | 'averagePoints'
  | 'currentStreak'
  | 'bestStreak'

import { PayloadSDK } from '@payloadcms/sdk'
import { Skeleton } from '../ui/skeleton'

const sdk = new PayloadSDK({
  baseURL: `${process.env.NEXT_PUBLIC_SERVER_URL}/api`,
})

export const LeaderboardTable: React.FC = () => {
  const [sortKey, setSortKey] = useState<SortKey>('totalPoints')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)
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
        pages.push(i + 1)
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages)
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
    const controller = new AbortController()

    async function fetchData() {
      try {
        setError(null)
        const result = await sdk.find({
          collection: 'season-stats',
          where: {
            season: { equals: new Date().getFullYear() },
          },
          sort: '-totalPoints',
          limit: 15,
          depth: 1,
          page: currentPage,
        })
        if (controller.signal.aborted) return
        const mapped: LeaderboardEntry[] = (result.docs as unknown as SeasonStat[]).map((stat) => {
          const user = typeof stat.user === 'object' ? (stat.user as User) : null
          return {
            id: user?.id || '',
            nickname: user?.nickname || user?.email || 'Unknown',
            chartColor: user?.chartColor || '#FFDF2C',
            totalPoints: stat.totalPoints,
            totalPredictions: stat.predictionsCount,
            perfectPredictions: stat.perfectPredictions,
            averagePoints: stat.predictionsCount > 0 ? stat.totalPoints / stat.predictionsCount : 0,
            currentStreak: stat.currentStreak,
            bestStreak: stat.bestStreak,
          }
        })
        setLeaderboardData(mapped)
        setTotalPages(result.totalPages)
      } catch {
        if (controller.signal.aborted) return
        setError('Не удалось загрузить данные')
      }
    }

    fetchData()
    return () => controller.abort()
  }, [currentPage])

  const sortedData = leaderboardData
    ? [...leaderboardData].sort((a, b) => {
        const aValue = a[sortKey]
        const bValue = b[sortKey]
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      })
    : null

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

  if (error) {
    return (
      <Card variant="yellow-glow" corners="cut-corner" className="p-8 text-center text-muted-foreground">
        {error}
      </Card>
    )
  }

  if (leaderboardData?.length === 0) {
    return (
      <Card variant="yellow-glow" corners="cut-corner" className="p-8 text-center text-muted-foreground">
        Нет данных за текущий сезон
      </Card>
    )
  }

  if (sortedData === null || !leaderboardData) {
    return (
      <Card variant="yellow-glow" corners="cut-corner" className="overflow-hidden">
        {/* Заголовок таблицы */}
        <div className="flex gap-4 px-4 py-3 bg-muted/50">
          <Skeleton className="w-12 h-4" />
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-16 h-4 ml-auto" />
          <Skeleton className="w-20 h-4" />
          <Skeleton className="w-20 h-4" />
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-14 h-4" />
          <Skeleton className="w-24 h-4" />
        </div>
        {/* Строки таблицы */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 px-4 py-4 border-b border-muted/20 ${
              i === 0
                ? 'bg-accent/10 border-l-4 border-l-accent'
                : i === 1
                  ? 'bg-muted/30 border-l-4 border-l-gray-400'
                  : i === 2
                    ? 'bg-muted/20 border-l-4 border-l-amber-600'
                    : ''
            }`}
          >
            <div className="w-12 flex items-center justify-center gap-2">
              {i < 3 && <Skeleton variant="circle" className="w-5 h-5" />}
              <Skeleton className="w-4 h-5" />
            </div>
            <div className="flex items-center gap-3 w-32">
              <Skeleton variant="circle" className="w-3 h-3 shrink-0" />
              <Skeleton className="flex-1 h-4" />
            </div>
            <Skeleton className="w-12 h-5 ml-auto" />
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-20 h-4" />
            <Skeleton className="w-12 h-4" />
            <Skeleton className="w-12 h-4" />
          </div>
        ))}
      </Card>
    )
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
                className="h-auto whitespace-normal w-min p-0 hover:bg-transparent"
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
                className="h-auto whitespace-normal w-min p-0 hover:bg-transparent "
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
            const position = index + 1 + (currentPage - 1) * 15
            return (
              <TableRow key={entry.id || index} className={getRowStyles(position)}>
                <TableCell className="text-center font-medium">
                  <div className="flex items-center justify-center gap-2">
                    {getPositionIcon(position)}
                    <span>{position}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <Link
                    href={`/user/${entry.id}`}
                    className="flex items-center gap-3 hover:text-accent transition-colors "
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.chartColor }}
                    />
                    <span className="truncate max-w-22">{entry.nickname}</span>
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
            className="rounded-full px-3"
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
                size={'sm'}
                className="disabled:opacity-100 rounded-full px-3"
                onClick={() => setCurentPage(page as number)}
              >
                {page}
              </Button>
            ),
          )}
          <Button
            variant={'ghost'}
            disabled={currentPage === totalPages}
            className="rounded-full px-3"
            onClick={() => setCurentPage((p) => Math.max(1, p + 1))}
          >
            →
          </Button>
        </div>
      )}
    </Card>
  )
}
