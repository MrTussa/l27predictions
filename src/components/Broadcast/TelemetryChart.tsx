'use client'

import { plural } from '@/utilities/plural'
import { useId, type ReactNode } from 'react'
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartTooltip, ChartTooltipRow } from './ChartTooltip'

export type TelemetryPoint = {
  key: string
  /** Название гонки для подсказки */
  label: string
  round: number
  /** null — прогноза не было */
  points: number | null
  /** Среднее по игрокам */
  avg?: number
  /** Место в таблице после гонки */
  rank?: number
}

const MAX_POINTS = 15
const PERFECT = '#FFDF2C'
const ZERO = '#E10600'
const AVG = 'rgba(255,255,255,0.75)'
const AXIS_TICK = { fill: 'rgba(255,255,255,0.45)', fontSize: 10, fontFamily: 'var(--font-mono)' }
const Y_WIDTH = 28

const barColor = (points: number | null, color: string) =>
  points === MAX_POINTS ? PERFECT : points === 0 ? ZERO : color

const pointsLabel = (points: number) => plural(points, ['очко', 'очка', 'очков'])

type Row = TelemetryPoint & { bar: number }

function TelemetryTooltip({
  active,
  payload,
  color,
}: {
  active?: boolean
  payload?: { payload: Row }[]
  color: string
}) {
  const row = payload?.[0]?.payload
  if (!active || !row) return null
  return (
    <ChartTooltip title={`Этап ${row.round} · ${row.label}`} color={barColor(row.points, color)}>
      <ChartTooltipRow
        color={barColor(row.points, color)}
        label="Очки"
        value={row.points === null ? 'нет прогноза' : `${row.points} ${pointsLabel(row.points)}`}
      />
      {row.avg !== undefined && <ChartTooltipRow color={AVG} label="Среднее" value={row.avg} />}
      {row.rank !== undefined && (
        <ChartTooltipRow color={ZERO} label="Место в таблице" value={`P${row.rank}`} />
      )}
    </ChartTooltip>
  )
}

/**
 * Очки по гонкам: столбцы (жёлтый — идеальный подиум, красный — ноль, штриховка — пропуск)
 * и среднее по игрокам на той же шкале. Место в таблице — отдельным графиком под ним,
 * со своей шкалой: две шкалы на одном графике читаются неверно.
 */
export function TelemetryChart({
  data,
  color,
  compact = false,
}: {
  data: TelemetryPoint[]
  color: string
  /** Только столбцы, без осей и графика места — для карточек */
  compact?: boolean
}) {
  const id = useId().replace(/:/g, '')
  const hatch = `telemetry-hatch-${id}`
  const rows: Row[] = data.map((point) => ({ ...point, bar: point.points ?? MAX_POINTS }))
  const hasAvg = rows.some((row) => row.avg !== undefined)
  const hasRank = !compact && rows.some((row) => row.rank !== undefined)
  const worstRank = Math.max(2, ...rows.map((row) => row.rank ?? 1))
  const tooltip = (
    <Tooltip
      content={<TelemetryTooltip color={color} />}
      cursor={{ fill: 'rgba(255,255,255,0.06)' }}
      isAnimationActive={false}
    />
  )

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={compact ? 64 : 200}>
        <ComposedChart
          data={rows}
          syncId={hasRank ? `telemetry-${id}` : undefined}
          margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
          barCategoryGap={compact ? 2 : '18%'}
        >
          <defs>
            <pattern
              id={hatch}
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width="2" height="6" fill="rgba(255,255,255,0.14)" />
            </pattern>
          </defs>
          {!compact && (
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" />
          )}
          <XAxis
            dataKey="round"
            hide={compact}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            hide={compact}
            domain={[0, MAX_POINTS]}
            ticks={[0, 5, 10, 15]}
            width={Y_WIDTH}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
          />
          {tooltip}
          <Bar dataKey="bar" minPointSize={3} radius={[2, 2, 0, 0]} isAnimationActive={false}>
            {rows.map((row) => (
              <Cell
                key={row.key}
                fill={row.points === null ? `url(#${hatch})` : barColor(row.points, color)}
                stroke={row.points === null ? 'rgba(255,255,255,0.18)' : undefined}
                strokeDasharray={row.points === null ? '3 3' : undefined}
              />
            ))}
          </Bar>
          {hasAvg && (
            <Line
              dataKey="avg"
              type="linear"
              stroke={AVG}
              strokeWidth={2}
              dot={{ r: 3, fill: AVG, stroke: '#15151E', strokeWidth: 2 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {hasRank && (
        <div className="mt-3">
          <div className="mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Место в таблице
          </div>
          <ResponsiveContainer width="100%" height={90}>
            <ComposedChart
              data={rows}
              syncId={`telemetry-${id}`}
              margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="rgba(255,255,255,0.07)"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="round"
                scale="band"
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                reversed
                domain={[1, worstRank]}
                ticks={[1, worstRank]}
                allowDecimals={false}
                tickFormatter={(value: number) => `P${value}`}
                width={Y_WIDTH}
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
              />
              {tooltip}
              <Line
                dataKey="rank"
                type="linear"
                stroke={ZERO}
                strokeWidth={2}
                dot={{ r: 3, fill: ZERO, stroke: '#15151E', strokeWidth: 2 }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {!compact && (
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <Legend swatch={<span className="size-2.5" style={{ background: color }} />}>
            очки за гонку
          </Legend>
          <Legend swatch={<span className="size-2.5" style={{ background: PERFECT }} />}>
            идеальный подиум
          </Legend>
          <Legend swatch={<span className="size-2.5" style={{ background: ZERO }} />}>ноль</Legend>
          <Legend swatch={<span className="size-2.5 border border-dashed border-white/30" />}>
            пропуск
          </Legend>
          {hasAvg && (
            <Legend swatch={<span className="h-0.5 w-3" style={{ background: AVG }} />}>
              среднее по игрокам
            </Legend>
          )}
        </div>
      )}
    </div>
  )
}

function Legend({ swatch, children }: { swatch: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {swatch}
      {children}
    </span>
  )
}
