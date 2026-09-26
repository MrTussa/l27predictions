import { plural } from '@/utilities/plural'
import type { RecapTexts, SeasonRecap } from '@/utilities/seasonRecap/types'
import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// Разметка для next/og (Satori): только flex, инлайн-стили, у блока с несколькими детьми — display: flex

// В шрифте сайта (Titillium) нет кириллицы, поэтому картинка рисуется шрифтом Geist
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

const INK = '#111a33'
const MUTED = '#5b6687'
const RED = '#c8102e'
const ACCENT = '#FFDF2C'

const page = {
  width: '100%',
  height: '100%',
  display: 'flex',
  padding: 28,
  fontFamily: 'Geist',
  background:
    'radial-gradient(circle at 12% 0%, rgba(255,223,44,0.35), transparent 45%), radial-gradient(circle at 95% 100%, rgba(225,6,0,0.35), transparent 45%), #0a0a0a',
} as const

const card = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  borderRadius: 28,
  padding: '24px 34px',
  color: INK,
  background: 'linear-gradient(120deg, #f7f4ea 0%, #e8eef7 48%, #f6e8ef 100%)',
  boxShadow: '0 0 40px rgba(255,223,44,0.25)',
} as const

/** Штрихкод из id пользователя — чисто декоративный, но у каждого свой */
function Barcode({ id }: { id: string }) {
  const bars = id
    .replace(/[^0-9a-f]/gi, '')
    .slice(-20)
    .split('')
    .map((char) => parseInt(char, 16))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', height: 40, alignItems: 'stretch' }}>
        {bars.map((value, i) => (
          <div
            key={i}
            style={{
              width: 2 + (value % 3),
              marginRight: 1 + ((value >> 2) % 3),
              background: INK,
            }}
          />
        ))}
      </div>
      <div style={{ fontFamily: 'Geist Mono', fontSize: 11, color: MUTED, letterSpacing: 1 }}>
        {id.slice(-16).toUpperCase()}
      </div>
    </div>
  )
}

function Field({
  n,
  label,
  value,
  width,
}: {
  n: number
  label: string
  value: string
  width: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width, paddingRight: 16 }}>
      <div style={{ fontSize: 13, color: MUTED, letterSpacing: 1.5, textTransform: 'uppercase' }}>
        {`${n}. ${label}`}
      </div>
      <div
        style={{
          fontSize: 25,
          fontWeight: 700,
          marginTop: 2,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {value}
      </div>
    </div>
  )
}

export function LicenceImage({ recap, texts }: { recap: SeasonRecap; texts: RecapTexts }) {
  const number = parseInt(recap.user.id.replace(/[^0-9a-f]/gi, '').slice(-8) || '0', 16)
    .toString()
    .padStart(8, '0')
    .slice(-8)
  const accuracy = recap.radar.find((axis) => axis.key === 'accuracy')?.value ?? 0
  const penalty = recap.penaltyPoints
  const suspended = penalty >= 12
  const initial = recap.user.nickname.slice(0, 1).toUpperCase()

  return (
    <div style={page}>
      <div style={card}>
        {/* Шапка */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#0f1220',
              border: `4px solid ${ACCENT}`,
              color: ACCENT,
              fontSize: 24,
              fontWeight: 900,
            }}
          >
            L27
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ fontSize: 38, fontWeight: 900, letterSpacing: 1 }}>
              СУПЕРЛИЦЕНЗИЯ ПРОГНОЗИСТА
            </div>
            <div style={{ fontSize: 15, color: MUTED, letterSpacing: 1.5 }}>
              L27 · ИНСПЕКЦИЯ БЕЗОПАСНОСТИ ПРОГНОЗНОГО ДВИЖЕНИЯ
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div
              style={{
                fontFamily: 'Geist Mono',
                fontSize: 28,
                fontWeight: 700,
                color: RED,
                letterSpacing: 4,
              }}
            >
              {`SL ${number.slice(0, 4)} ${number.slice(4)}`}
            </div>
            <div style={{ fontFamily: 'Geist Mono', fontSize: 14, color: MUTED }}>
              {`серия F1-${recap.season}`}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', height: 2, background: '#c9d1e3', margin: '16px 0 18px' }} />

        {/* Фото и поля */}
        <div style={{ display: 'flex', flex: 1 }}>
          <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 200 }}
          >
            <div
              style={{
                width: 180,
                height: 190,
                borderRadius: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                background: `linear-gradient(160deg, ${recap.user.chartColor} 0%, #10131c 85%)`,
                color: 'rgba(255,255,255,0.92)',
                fontSize: 120,
                fontWeight: 900,
              }}
            >
              {initial}
            </div>
            <div
              style={{
                marginTop: 12,
                padding: '4px 14px',
                border: `2px solid ${INK}`,
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              {recap.rank ? `КЛАСС: P${recap.rank}` : 'КЛАСС: —'}
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 24,
                fontWeight: 900,
                color: '#2a3a8c',
                transform: 'rotate(-5deg)',
              }}
            >
              {recap.user.nickname}
            </div>
          </div>

          <div
            style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingLeft: 28, gap: 14 }}
          >
            <div style={{ display: 'flex' }}>
              <Field n={1} label="Никнейм" value={recap.user.nickname} width="34%" />
              <Field n={2} label="Позывной" value={texts.title} width="66%" />
            </div>
            <div style={{ display: 'flex' }}>
              <Field n={3} label="Сезон" value={String(recap.season)} width="34%" />
              <Field
                n={4}
                label="Место в чемпионате"
                value={recap.rank ? `${recap.rank} из ${recap.playersTotal}` : '—'}
                width="33%"
              />
              <Field
                n={5}
                label="Очки"
                value={`${recap.points} ${plural(recap.points, ['очко', 'очка', 'очков'])}`}
                width="33%"
              />
            </div>
            <div style={{ display: 'flex' }}>
              <Field
                n={6}
                label="Стаж"
                value={`${recap.predictions} из ${recap.racesCompleted} ${plural(recap.racesCompleted, ['гонки', 'гонок', 'гонок'])}`}
                width="34%"
              />
              <Field
                n={7}
                label="Любимый пилот"
                value={recap.favorite ? recap.favorite.driver.name : 'не завёл'}
                width="33%"
              />
              <Field n={8} label="Точность" value={`${accuracy}% подиумов`} width="33%" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', paddingRight: 220 }}>
              <div style={{ fontSize: 13, color: MUTED, letterSpacing: 1.5 }}>
                9. ОСОБЫЕ ПРИМЕТЫ
              </div>
              <div style={{ fontSize: 21, fontWeight: 700, marginTop: 2, lineHeight: 1.25 }}>
                {texts.specialMarks}
              </div>
            </div>
          </div>
        </div>

        {/* Категории и штрихкод */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 28, marginTop: 14 }}>
          <Barcode id={recap.user.id} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, width: 600 }}>
            {recap.categories.map((category) => (
              <div
                key={category.code}
                style={{
                  display: 'flex',
                  padding: '0 12px',
                  height: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                  border: category.earned ? `2px solid ${INK}` : '2px dashed #a3abc0',
                  color: category.earned ? INK : '#a3abc0',
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                {`${category.code}. ${category.label}`}
              </div>
            ))}
          </div>
        </div>

        {/* Штамп со штрафными баллами */}
        <div
          style={{
            position: 'absolute',
            right: 36,
            bottom: 30,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '8px 18px',
            border: `4px solid ${RED}`,
            borderRadius: 16,
            color: RED,
            transform: 'rotate(-7deg)',
            background: 'rgba(255,255,255,0.35)',
          }}
        >
          <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1 }}>{`${penalty} / 12`}</div>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1 }}>ШТРАФНЫХ БАЛЛОВ</div>
          <div style={{ fontSize: 12, letterSpacing: 1 }}>
            {suspended ? 'ЛИЦЕНЗИЯ ПРИОСТАНОВЛЕНА' : `ДО ЛИШЕНИЯ: ${12 - penalty}`}
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
        <div style={{ fontSize: 30, fontWeight: 700, color: ACCENT, letterSpacing: 4 }}>L27</div>
        <div style={{ fontSize: 64, fontWeight: 900 }}>
          {season ? `ИТОГИ СЕЗОНА ${season}` : 'ИТОГИ СЕЗОНА'}
        </div>
        <div style={{ fontSize: 26, color: '#a3abc0' }}>Чемпионат прогнозов Формулы 1</div>
      </div>
    </div>
  )
}
