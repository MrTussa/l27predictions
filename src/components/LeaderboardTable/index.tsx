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
import { Nickname } from '@/components/Nickname'
import type { LeaderboardEntry } from '@/app/(app)/leaderboard/_lib/getLeaderboardData'
import { IconArrowsUpDown, IconAward, IconMedal, IconTrophy } from '@tabler/icons-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

const PER_PAGE = 15

const SORT_COLUMNS: { key: SortKey; label: string; wrap?: boolean }[] = [
  { key: 'totalPoints', label: 'Баллы' },
  { key: 'totalPredictions', label: 'Прогнозов' },
  { key: 'perfectPredictions', label: 'Идеальных' },
  { key: 'averagePoints', label: 'Средний балл', wrap: true },
  { key: 'currentStreak', label: 'Стрик' },
  { key: 'bestStreak', label: 'Лучший стрик', wrap: true },
]

type SortKey =
  | 'totalPoints'
  | 'totalPredictions'
  | 'perfectPredictions'
  | 'averagePoints'
  | 'currentStreak'
  | 'bestStreak'

export const LeaderboardTable: React.FC<{ entries: LeaderboardEntry[] }> = ({ entries }) => {
  const [sortKey, setSortKey] = useState<SortKey>('totalPoints')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurentPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(entries.length / PER_PAGE))
  const rankById = new Map(entries.map((e, i) => [e.id, i + 1]))

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
      if (currentPage < 3) {
        pages.push(1, 2, 3, '...', totalPages)
      } else if (currentPage === 3) {
        pages.push(1, currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pages
  }

  const pages = getPageNumbers()

  const pageData = useMemo(
    () =>
      entries
        .toSorted((a, b) =>
          sortDirection === 'asc' ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey],
        )
        .slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE),
    [entries, sortKey, sortDirection, currentPage],
  )

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <IconTrophy className="w-5 h-5 text-accent" />
      case 2:
        return <IconMedal className="w-5 h-5 text-gray-400" />
      case 3:
        return <IconAward className="w-5 h-5 text-amber-600" />
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

  if (entries.length === 0) {
    return (
      <Card
        variant="yellow-glow"
        corners="cut-corner"
        className="p-8 text-center text-muted-foreground"
      >
        Нет данных за текущий сезон
      </Card>
    )
  }

  return (
    <Card variant="yellow-glow" corners="cut-corner" className="overflow-hidden gap-0 max-w-6xl">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-16 text-center">#</TableHead>
            <TableHead>Участник</TableHead>
            {SORT_COLUMNS.map(({ key, label, wrap }) => (
              <TableHead
                key={key}
                className="text-right"
                aria-sort={
                  sortKey === key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'
                }
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-auto p-0 hover:bg-transparent ${wrap ? 'whitespace-normal w-min' : ''}`}
                  onClick={() => handleSort(key)}
                >
                  {label}
                  <IconArrowsUpDown className="ml-2 h-4 w-4" aria-hidden />
                </Button>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageData.map((entry, index) => {
            // Место — по очкам (порядок с сервера), а не по текущей сортировке таблицы
            const position = rankById.get(entry.id) ?? index + 1 + (currentPage - 1) * PER_PAGE
            return (
              <TableRow
                key={entry.id || index}
                className={
                  getRowStyles(position) +
                  ' border-b transition-colors animate-in fade-in duration-200'
                }
              >
                <TableCell className="text-center font-medium">
                  <div className="flex items-center justify-center gap-2">
                    {getPositionIcon(position)}
                    <span className="font-mono">{position}</span>
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
                    <Nickname effect={entry.equippedNicknameEffect} className="truncate max-w-22">
                      {entry.nickname}
                    </Nickname>
                  </Link>
                </TableCell>
                <TableCell className="text-right font-bold font-mono">
                  {entry.totalPoints}
                </TableCell>
                <TableCell className="text-right text-muted-foreground font-mono">
                  {entry.totalPredictions}
                </TableCell>
                <TableCell className="text-right text-muted-foreground font-mono">
                  {entry.perfectPredictions}
                </TableCell>
                <TableCell className="text-right text-muted-foreground font-mono">
                  {entry.averagePoints.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {entry.currentStreak > 0 ? (
                    <span className="text-accent font-semibold font-mono">
                      🔥 {entry.currentStreak}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right text-muted-foreground font-mono">
                  {entry.bestStreak > 0 ? entry.bestStreak : '-'}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-center flex-row gap-1 ">
          <Button
            variant={'ghost'}
            disabled={currentPage === 1}
            className="rounded-full px-3"
            onClick={() => setCurentPage((p) => Math.max(1, p - 1))}
            aria-label="Предыдущая страница"
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
            aria-label="Следующая страница"
          >
            →
          </Button>
        </div>
      )}
    </Card>
  )
}
