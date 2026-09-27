'use client'

import { Button } from '@/components/ui/button'
import { F1_RED, PODIUM_COLORS, Panel } from '@/components/Broadcast'
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
import { IconArrowsUpDown } from '@tabler/icons-react'
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

  const leaderPoints = entries[0]?.totalPoints ?? 0

  const renderSortHead = ({ key, label, wrap }: (typeof SORT_COLUMNS)[number]) => (
    <TableHead
      key={key}
      className="text-right"
      aria-sort={sortKey === key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <Button
        variant="ghost"
        size="sm"
        className={`h-auto p-0 font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-transparent ${
          sortKey === key ? 'text-accent' : ''
        } ${wrap ? 'w-min whitespace-normal' : ''}`}
        onClick={() => handleSort(key)}
      >
        {label}
        <IconArrowsUpDown className="ml-1 h-3.5 w-3.5" aria-hidden />
      </Button>
    </TableHead>
  )

  if (entries.length === 0) {
    return (
      <Panel className="w-full max-w-6xl p-8 text-center text-muted-foreground">
        Нет данных за текущий сезон
      </Panel>
    )
  }

  return (
    <Panel stripe={F1_RED} className="w-full max-w-6xl">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="w-20 pl-5 font-mono text-[10px] uppercase tracking-[0.2em]">
              Поз
            </TableHead>
            <TableHead className="font-mono text-[10px] uppercase tracking-[0.2em]">
              Участник
            </TableHead>
            {SORT_COLUMNS.slice(0, 1).map(renderSortHead)}
            <TableHead className="text-right font-mono text-[10px] uppercase tracking-[0.2em]">
              Отрыв
            </TableHead>
            {SORT_COLUMNS.slice(1).map(renderSortHead)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageData.map((entry, index) => {
            // Место — по очкам (порядок с сервера), а не по текущей сортировке таблицы
            const position = rankById.get(entry.id) ?? index + 1 + (currentPage - 1) * PER_PAGE
            const podiumColor = PODIUM_COLORS[position - 1]
            const gap = leaderPoints - entry.totalPoints
            return (
              <TableRow
                key={entry.id || index}
                className="border-white/5 transition-colors animate-in fade-in duration-200 hover:bg-white/[0.03]"
                style={
                  podiumColor
                    ? {
                        background: `linear-gradient(90deg, color-mix(in srgb, ${podiumColor} 14%, transparent), transparent 45%)`,
                      }
                    : undefined
                }
              >
                <TableCell className="pl-5">
                  <div className="flex items-center gap-2">
                    <span
                      className="-skew-x-12 w-9 text-xl font-black italic tabular-nums"
                      style={{ color: podiumColor }}
                    >
                      {position}
                    </span>
                    <PositionChange value={entry.positionChange} />
                  </div>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/user/${entry.id}`}
                    className="flex items-center gap-3 font-black uppercase tracking-wide transition-colors hover:text-accent"
                  >
                    <span
                      className="h-6 w-1 shrink-0"
                      style={{ backgroundColor: entry.chartColor }}
                    />
                    <Nickname effect={entry.equippedNicknameEffect} className="max-w-40 truncate">
                      {entry.nickname}
                    </Nickname>
                  </Link>
                </TableCell>
                <TableCell className="text-right">
                  <span className="-skew-x-12 inline-block text-lg font-black italic tabular-nums">
                    {entry.totalPoints}
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground">
                  {position === 1 ? (
                    <span className="font-bold uppercase tracking-wider text-accent">Лидер</span>
                  ) : (
                    `+${gap}`
                  )}
                </TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {entry.totalPredictions}
                </TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {entry.perfectPredictions > 0 ? (
                    <span className="font-bold text-accent">{entry.perfectPredictions}</span>
                  ) : (
                    0
                  )}
                </TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {entry.averagePoints.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {entry.currentStreak > 0 ? (
                    <span className="font-mono font-semibold text-accent">
                      🔥 {entry.currentStreak}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="pr-5 text-right font-mono text-muted-foreground">
                  {entry.bestStreak > 0 ? entry.bestStreak : '-'}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex flex-row items-center justify-center gap-1 border-t border-white/5 py-2">
          <Button
            variant={'ghost'}
            disabled={currentPage === 1}
            className="px-3"
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
                className="px-3 font-mono disabled:opacity-100"
                onClick={() => setCurentPage(page as number)}
              >
                {page}
              </Button>
            ),
          )}
          <Button
            variant={'ghost'}
            disabled={currentPage === totalPages}
            className="px-3"
            onClick={() => setCurentPage((p) => Math.max(1, p + 1))}
            aria-label="Следующая страница"
          >
            →
          </Button>
        </div>
      )}
    </Panel>
  )
}

/** ▲ — отыграл места за последнюю гонку, ▼ — потерял */
function PositionChange({ value }: { value: number | null }) {
  if (value === null) return null
  if (value === 0) return <span className="w-6 font-mono text-[10px] text-white/25">—</span>
  const up = value > 0
  return (
    <span
      className="w-6 font-mono text-[10px] font-bold"
      style={{ color: up ? '#00d26a' : F1_RED }}
      title={up ? `+${value} за последнюю гонку` : `${value} за последнюю гонку`}
    >
      {up ? '▲' : '▼'}
      {Math.abs(value)}
    </span>
  )
}
