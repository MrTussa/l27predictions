import { plural } from '@/utilities/plural'
import type { RecapTexts, SeasonRecap } from '@/utilities/seasonRecap/types'
import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// Разметка для next/og (Satori): только flex, инлайн-стили, у блока с несколькими детьми — display: flex

// Картинка рисуется шрифтом Geist: next/og нужен статичный TTF с кириллицей
const fontsDir = join(process.cwd(), 'src/fonts/geist')
const [regular, bold, black, monoBold] = await Promise.all(
  ['Geist-Regular.ttf', 'Geist-Bold.ttf', 'Geist-Black.ttf', 'GeistMono-Bold.ttf'].map((file) =>
    readFile(join(fontsDir, file)),
  ),
)

const fonts = [
  { name: 'Geist', data: regular, weight: 400 as const, style: 'normal' as const },
  { name: 'Geist', data: bold, weight: 700 as const, style: 'normal' as const },
  { name: 'Geist', data: black, weight: 900 as const, style: 'normal' as const },
  { name: 'Geist Mono', data: monoBold, weight: 700 as const, style: 'normal' as const },
]

/** PNG суперлицензии; без данных — заглушка «Итоги сезона» без личной статистики */
export function renderLicenceImage(
  data: { recap: SeasonRecap; texts: RecapTexts } | null,
  season: number | null,
  cacheControl: string,
) {
  return new ImageResponse(
    data ? <LicenceImage {...data} /> : <RecapTeaserImage season={season} />,
    { width: 1200, height: 630, fonts, headers: { 'Cache-Control': cacheControl } },
  )
}

const ACCENT = '#FFDF2C'
// Красный — только там, где он значит «плохо»: нули, штрафные баллы
const NEGATIVE = '#ff4d4d'
const DARK = '#15151E'
const PANEL = '#1F1F2B'
const GREY = '#9B9BAA'
const PODIUM = [ACCENT, '#C2C9D2', '#CD6B2C']

// Стиль ТВ-графики F1 в цветах сайта: тёмный фон, жёлтые акценты, без наклона.

const page = {
  width: '100%',
  height: '100%',
  display: 'flex',
  fontFamily: 'Geist',
  color: '#fff',
  background: `linear-gradient(135deg, #1b1b26 0%, ${DARK} 55%, #0e0e14 100%)`,
} as const

/** Клетчатый флаг — две строки квадратов */
function Checkered({ columns, size = 9 }: { columns: number; size?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {[0, 1].map((row) => (
        <div key={row} style={{ display: 'flex' }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div
              key={i}
              style={{
                width: size,
                height: size,
                background: (i + row) % 2 === 0 ? '#fff' : 'transparent',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/** Строка «таймингтауэра»: метка слева, значение справа, серое дополнение после него */
function TowerRow({
  label,
  value,
  extra,
  color,
  chip,
}: {
  label: string
  value: string
  extra?: string
  color?: string
  /** Трёхбуквенный код пилота на плашке цвета команды */
  chip?: { text: string; color: string }
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 46,
        background: PANEL,
        borderLeft: `6px solid ${color ?? ACCENT}`,
        marginBottom: 6,
      }}
    >
      <div
        style={{
          width: 210,
          paddingLeft: 16,
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: 2,
          color: GREY,
        }}
      >
        {label}
      </div>
      {chip && (
        <div
          style={{
            display: 'flex',
            padding: '2px 8px',
            marginRight: 10,
            background: chip.color,
            color: '#fff',
            fontFamily: 'Geist Mono',
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          {chip.text}
        </div>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          flex: 1,
          paddingRight: 16,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 900 }}>{value}</div>
        {extra && (
          <div style={{ fontSize: 17, fontWeight: 700, color: GREY, marginLeft: 10 }}>{extra}</div>
        )}
      </div>
    </div>
  )
}

/** Очки по гонкам столбиками: жёлтый — идеальный подиум, красный — ноль, пунктир — пропуск */
function Telemetry({ recap }: { recap: SeasonRecap }) {
  const timeline = recap.timeline
  const barWidth = Math.max(
    6,
    Math.min(22, Math.floor((312 - timeline.length * 3) / timeline.length)),
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, color: GREY }}>
        ТЕЛЕМЕТРИЯ СЕЗОНА
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 3,
          height: 50,
          marginTop: 8,
          borderBottom: '2px solid #3a3a4a',
        }}
      >
        {timeline.map((entry) => {
          const points = entry.points ?? 0
          const color =
            entry.points === null
              ? 'transparent'
              : points === 15
                ? ACCENT
                : points === 0
                  ? NEGATIVE
                  : recap.user.chartColor
          return (
            <div
              key={entry.race.id}
              style={{
                display: 'flex',
                width: barWidth,
                height: entry.points === null ? 48 : Math.max(4, (points / 15) * 48),
                background: color,
                border: entry.points === null ? '2px dashed #3a3a4a' : 'none',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

/** Печать поверх лицензии — итог сезона одной фразой */
function stamp(recap: SeasonRecap): { text: string; color: string } | null {
  if (recap.penaltyPoints >= 12) return { text: 'ЛИЦЕНЗИЯ ПРИОСТАНОВЛЕНА', color: NEGATIVE }
  if (recap.rank === 1) return { text: 'ЧЕМПИОН СЕЗОНА', color: ACCENT }
  if (recap.rank && recap.rank <= 3) return { text: 'ПОДИУМ СЕЗОНА', color: '#C2C9D2' }
  if (!recap.isSeasonComplete) return null
  return { text: `ДОПУЩЕН К СЕЗОНУ ${recap.season + 1}`, color: '#6fdc8c' }
}

export function LicenceImage({ recap, texts }: { recap: SeasonRecap; texts: RecapTexts }) {
  const number = parseInt(recap.user.id.replace(/[^0-9a-f]/gi, '').slice(-8) || '0', 16)
    .toString()
    .padStart(8, '0')
    .slice(-8)
  const accuracy = recap.radar.find((axis) => axis.key === 'accuracy')?.value ?? 0
  const penalty = recap.penaltyPoints
  const suspended = penalty >= 12
  const userColor = recap.user.chartColor
  const favorite = recap.favorite?.driver
  const best = recap.topRaces[0]
  const sniper = recap.radar.find((axis) => axis.key === 'sniper')?.value ?? 0
  const contrarian = recap.contrarian
  const seal = stamp(recap)

  return (
    <div style={page}>
      {/* Косые «скоростные» полосы на фоне */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: -100,
            right: 120 + i * 70,
            width: 26 - i * 7,
            height: 900,
            background: i === 0 ? ACCENT : 'rgba(255,255,255,0.06)',
            opacity: i === 0 ? 0.9 : 1,
            transform: 'rotate(20deg)',
          }}
        />
      ))}

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, position: 'relative' }}>
        <div style={{ display: 'flex', height: 8, background: ACCENT }} />

        {/* Шапка */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '22px 40px 0', gap: 22 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 96,
              height: 60,
              background: ACCENT,
              color: DARK,
              fontSize: 32,
              fontWeight: 900,
            }}
          >
            L27
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ fontSize: 46, fontWeight: 900, letterSpacing: 1, lineHeight: 1 }}>
              СУПЕРЛИЦЕНЗИЯ
            </div>
            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: 4,
                color: ACCENT,
                marginTop: 6,
              }}
            >
              {`ПРОГНОЗИСТА · ЧЕМПИОНАТ L27 · СЕЗОН ${recap.season}`}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <Checkered columns={14} />
            <div
              style={{ fontFamily: 'Geist Mono', fontSize: 20, fontWeight: 700, letterSpacing: 3 }}
            >
              {`SL ${number.slice(0, 4)} ${number.slice(4)}`}
            </div>
          </div>
        </div>

        {/* Основной блок */}
        <div style={{ display: 'flex', padding: '24px 40px 0', gap: 30, flex: 1 }}>
          {/* Карточка «пилота» */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: 360,
              marginBottom: 22,
              background: PANEL,
              borderTop: `6px solid ${userColor}`,
              padding: '18px 24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
              <div
                style={{
                  fontSize: 92,
                  fontWeight: 900,
                  lineHeight: 0.9,
                  color: recap.rank && recap.rank <= 3 ? PODIUM[recap.rank - 1] : '#fff',
                }}
              >
                {recap.rank ? `P${recap.rank}` : '—'}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: GREY, marginBottom: 8 }}>
                {`из ${recap.playersTotal}`}
              </div>
            </div>
            <div
              style={{
                marginTop: 10,
                flexShrink: 0,
                fontSize: 34,
                fontWeight: 900,
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {recap.user.nickname}
            </div>
            <div
              style={{
                display: 'flex',
                height: 4,
                width: 70,
                background: userColor,
                margin: '8px 0',
              }}
            />
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, color: GREY }}>
              ПОЗЫВНОЙ
            </div>
            <div
              style={{
                flexShrink: 0,
                fontSize: 24,
                fontWeight: 900,
                color: ACCENT,
                lineHeight: 1.15,
              }}
            >
              {texts.title}
            </div>
            <div style={{ display: 'flex', flex: 1 }} />
            {recap.timeline.length > 1 && <Telemetry recap={recap} />}
            <div style={{ display: 'flex', flex: 1 }} />
            {best && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, color: GREY }}>
                  ЛУЧШАЯ ГОНКА
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: 230,
                    }}
                  >
                    {best.race.name}
                  </div>
                  <div
                    style={{
                      padding: '2px 8px',
                      background: ACCENT,
                      color: DARK,
                      fontSize: 18,
                      fontWeight: 900,
                    }}
                  >
                    {`+${best.points}`}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Таймингтауэр */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <TowerRow
              label="ОЧКИ"
              value={`${recap.points} ${plural(recap.points, ['очко', 'очка', 'очков'])}`}
              extra={
                recap.seasonPredictionPoints > 0
                  ? `+${recap.seasonPredictionPoints} за события`
                  : `идеальных: ${recap.perfect}`
              }
            />
            <TowerRow
              label="СТАЖ"
              value={`${recap.predictions} из ${recap.racesCompleted} ${plural(recap.racesCompleted, ['гонки', 'гонок', 'гонок'])}`}
              extra={`серия ${recap.bestStreak}${recap.peakRank ? ` · пик P${recap.peakRank}` : ''}`}
            />
            <TowerRow label="ТОЧНОСТЬ" value={`${accuracy}% подиумов`} extra={`${sniper}% точно`} />
            <TowerRow
              label="ЛЮБИМЫЙ ПИЛОТ"
              value={favorite ? favorite.name : 'не завёл'}
              color={favorite?.teamColor}
              chip={favorite ? { text: favorite.shortName, color: favorite.teamColor } : undefined}
            />
            {contrarian ? (
              <TowerRow
                label="ПРОТИВ ТОЛПЫ"
                value={`${contrarian.driver.shortName} на P${contrarian.position}`}
                extra={`${contrarian.race.name} · верили ${contrarian.sharePct}%`}
                color={ACCENT}
              />
            ) : (
              <TowerRow label="ИДЕАЛЬНЫЕ" value={String(recap.perfect)} color={ACCENT} />
            )}

            {/* Награды от нейросети */}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              {texts.badges.slice(0, 4).map((badge) => (
                <div
                  key={badge.name}
                  style={{
                    display: 'flex',
                    padding: '2px 10px',
                    border: `2px solid ${ACCENT}`,
                    color: ACCENT,
                    fontSize: 14,
                    fontWeight: 900,
                    letterSpacing: 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {badge.name}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: 12, gap: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, color: GREY }}>
                  ОСОБЫЕ ПРИМЕТЫ
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 3, lineHeight: 1.25 }}>
                  {texts.specialMarks}
                </div>
              </div>
              {seal && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: 230,
                    marginTop: 4,
                    padding: '6px 10px',
                    border: `4px solid ${seal.color}`,
                    background: DARK,
                    color: seal.color,
                    transform: 'rotate(-8deg)',
                    opacity: 0.9,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3 }}>
                    {`L27 · ${recap.season}`}
                  </div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 900,
                      letterSpacing: 1,
                      textAlign: 'center',
                      lineHeight: 1.05,
                    }}
                  >
                    {seal.text}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Низ: допуски и штрафные баллы */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            padding: '0 40px 26px',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, width: 700 }}>
            {recap.categories.map((category) => (
              <div
                key={category.code}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: 28,
                  padding: '0 12px',
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  background: category.earned ? '#fff' : 'transparent',
                  color: category.earned ? DARK : '#5c5c6e',
                  border: category.earned ? '2px solid #fff' : '2px solid #3a3a4a',
                }}
              >
                {`${category.code} · ${category.label}`}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, color: GREY }}>
              {suspended
                ? 'ЛИЦЕНЗИЯ ПРИОСТАНОВЛЕНА'
                : `ШТРАФНЫЕ БАЛЛЫ · ДО ДИСКВАЛИФИКАЦИИ ${12 - penalty}`}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 14,
                    height: 26,
                    background: i < penalty ? NEGATIVE : '#2c2c3a',
                  }}
                />
              ))}
              <div style={{ fontSize: 30, fontWeight: 900, marginLeft: 10 }}>{`${penalty}/12`}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function RecapTeaserImage({ season }: { season: number | null }) {
  return (
    <div style={{ ...page, alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          color: '#fff',
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 900, color: ACCENT, letterSpacing: 4 }}>L27</div>
        <div style={{ fontSize: 64, fontWeight: 900 }}>
          {season ? `ИТОГИ СЕЗОНА ${season}` : 'ИТОГИ СЕЗОНА'}
        </div>
        <Checkered columns={24} />
        <div style={{ fontSize: 26, color: GREY }}>Чемпионат прогнозов Формулы 1</div>
      </div>
    </div>
  )
}
