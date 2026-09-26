import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  parseModelJson,
  requestRecapTexts,
  sanitizeRecapTexts,
} from '@/utilities/seasonRecap/aiTexts'
import { buildSeasonRecap } from '@/utilities/seasonRecap/buildSeasonRecap'
import { buildFallbackTexts } from '@/utilities/seasonRecap/fallbackTexts'
import type { RecapDriver, RecapInput, RecapPrediction } from '@/utilities/seasonRecap/types'
import { plural } from '@/utilities/plural'

const driver = (id: string, name: string): RecapDriver => ({
  id,
  name,
  shortName: id.toUpperCase(),
  teamName: 'Team',
  teamColor: '#FF8000',
  photoUrl: null,
})

const drivers = Object.fromEntries(
  [
    driver('ver', 'Макс Ферстаппен'),
    driver('nor', 'Ландо Норрис'),
    driver('lec', 'Шарль Леклер'),
    driver('pia', 'Оскар Пиастри'),
    driver('ham', 'Льюис Хэмилтон'),
    driver('alb', 'Александр Албон'),
    driver('rus', 'Джордж Расселл'),
  ].map((d) => [d.id, d]),
)

const podium = (...ids: string[]) => ids.map((id, i) => ({ position: i + 1, driver: id }))
const race = (id: string, round: number, results: string[] = []) => ({
  id,
  name: `Гран-при ${id}`,
  round,
  trackSVGPath: null,
  results: podium(...results),
})
const pred = (user: string, raceId: string, ...ids: string[]): RecapPrediction => ({
  user,
  race: raceId,
  picks: podium(...ids),
})

const input = (overrides: Partial<RecapInput>): RecapInput => ({
  season: 2026,
  user: { id: 'me', nickname: 'tester', chartColor: '#FFDF2C', equippedNicknameEffect: null },
  seasonPredictionPoints: 0,
  races: [],
  predictions: [],
  drivers,
  ...overrides,
})

// Сезон в процессе: идеальный подиум, пропуск и гонка без очков
const midSeason = input({
  races: [
    race('r1', 1, ['ver', 'nor', 'lec']),
    race('r2', 2, ['nor', 'pia', 'ver']),
    race('r3', 3, ['lec', 'ham', 'rus']),
    race('r4', 4),
  ],
  predictions: [
    pred('me', 'r1', 'ver', 'nor', 'lec'),
    pred('me', 'r3', 'ver', 'nor', 'pia'),
    pred('me', 'r4', 'ver', 'nor', 'lec'),
    pred('u2', 'r1', 'ver', 'lec', 'nor'),
    pred('u2', 'r2', 'nor', 'pia', 'ver'),
    pred('u2', 'r3', 'lec', 'rus', 'ham'),
    pred('u3', 'r1', 'nor', 'ver', 'pia'),
    pred('u3', 'r2', 'ver', 'nor', 'lec'),
    pred('u3', 'r3', 'ham', 'lec', 'rus'),
    pred('u4', 'r4', 'ver', 'nor', 'lec'),
  ],
})

// Полный сезон из 5 игроков: любимчик, «предатель», точное попадание против толпы, падение в таблице
const fullSeason = input({
  races: [
    race('r1', 1, ['ver', 'nor', 'alb']),
    race('r2', 2, ['nor', 'lec', 'pia']),
    race('r3', 3, ['lec', 'pia', 'nor']),
    race('r4', 4, ['pia', 'lec', 'nor']),
  ],
  predictions: [
    pred('me', 'r1', 'ver', 'ham', 'alb'),
    pred('me', 'r2', 'ver', 'ham', 'lec'),
    pred('me', 'r3', 'ver', 'ham', 'nor'),
    pred('me', 'r4', 'ver', 'nor', 'lec'),
    pred('u2', 'r1', 'nor', 'ver', 'pia'),
    pred('u2', 'r2', 'nor', 'lec', 'pia'),
    pred('u2', 'r3', 'lec', 'pia', 'nor'),
    pred('u2', 'r4', 'pia', 'lec', 'nor'),
    pred('u3', 'r1', 'ver', 'nor', 'lec'),
    pred('u3', 'r2', 'nor', 'lec', 'ver'),
    pred('u3', 'r3', 'lec', 'nor', 'pia'),
    pred('u3', 'r4', 'pia', 'nor', 'lec'),
    pred('u4', 'r1', 'nor', 'ver', 'lec'),
    pred('u4', 'r2', 'nor', 'lec', 'pia'),
    pred('u4', 'r3', 'lec', 'pia', 'nor'),
    pred('u4', 'r4', 'lec', 'pia', 'nor'),
    pred('u5', 'r1', 'ham', 'ver', 'nor'),
    pred('u5', 'r2', 'lec', 'nor', 'pia'),
    pred('u5', 'r3', 'nor', 'lec', 'pia'),
    pred('u5', 'r4', 'nor', 'pia', 'lec'),
  ],
})

describe('buildSeasonRecap', () => {
  it('считает очки и место так же, как таблица лидеров', () => {
    const recap = buildSeasonRecap(midSeason)

    expect(recap.points).toBe(15)
    expect(recap.rank).toBe(2)
    expect(recap.playersTotal).toBe(4)
    expect(recap.racesTotal).toBe(4)
    expect(recap.racesCompleted).toBe(3)
    expect(recap.isSeasonComplete).toBe(false)
    expect(recap.avgPoints).toBe(7.5)
    expect(recap.communityAvgPoints).toBe(6.1)
  })

  it('разбирает прогнозы: пропуски, нули, попадания и серии', () => {
    const recap = buildSeasonRecap(midSeason)

    expect(recap.predictions).toBe(2)
    expect(recap.missed).toBe(1)
    expect(recap.perfect).toBe(1)
    expect(recap.zeroRaces).toBe(1)
    expect(recap.bestStreak).toBe(1)
    expect(recap.totalPicks).toBe(6)
    expect(recap.podiumHits).toBe(3)
    expect(recap.exactHits).toBe(3)
    expect(recap.peakRank).toBe(1)
    expect(recap.topRaces).toEqual([{ race: expect.objectContaining({ id: 'r1' }), points: 15 }])
    expect(recap.positions.map((p) => [p.position, p.hits, p.attempts])).toEqual([
      [1, 1, 2],
      [2, 1, 2],
      [3, 1, 2],
    ])
    expect(recap.penaltyPoints).toBe(2)
    expect(recap.fingerprint).toBe('v1:3:15:2:2:0')
  })

  it('собирает моменты для «Посмотри на себя» с фактами', () => {
    const recap = buildSeasonRecap(midSeason)

    expect(recap.moments.map((m) => m.id)).toEqual(['zero-r3', 'missed-r2'])
    expect(recap.moments[0].fact).toBe(
      'Гран-при r3: 0 очков. Прогноз: VER, NOR, PIA. Подиум: LEC, HAM, RUS. Игроки в среднем набрали 3,3.',
    )
    expect(recap.moments[1].points).toBeNull()
  })

  it('выбирает любимчика, «предателя» и точное попадание против толпы', () => {
    const recap = buildSeasonRecap(fullSeason)

    expect(recap.favorite).toMatchObject({ driver: { id: 'ver' }, picks: 4, podiums: 1, exact: 1 })
    expect(recap.nemesis).toMatchObject({ driver: { id: 'ham' }, picks: 3, misses: 3 })
    expect(recap.contrarian).toMatchObject({
      race: { id: 'r1' },
      driver: { id: 'alb' },
      position: 3,
      sharePct: 20,
    })
    expect(recap.crowdSharePct).toBe(33)
  })

  it('фиксирует падение в таблице и добивает моменты худшей гонкой', () => {
    const recap = buildSeasonRecap(fullSeason)

    expect(recap.rank).toBe(5)
    expect(recap.isSeasonComplete).toBe(true)
    expect(recap.bestStreak).toBe(4)
    expect(recap.moments.map((m) => m.id)).toEqual(['drop-r2', 'worst-r4'])
    expect(recap.moments[0].fact).toContain('с 1-го на 4-е место')
    expect(recap.categories.filter((c) => c.earned).map((c) => c.code)).toEqual([
      'A',
      'C',
      'E',
      'F',
      'H',
    ])
  })

  it('игрок без прогнозов не получает места и моментов', () => {
    const recap = buildSeasonRecap({ ...midSeason, user: { ...midSeason.user, id: 'ghost' } })

    expect(recap.rank).toBeNull()
    expect(recap.predictions).toBe(0)
    expect(recap.favorite).toBeNull()
    expect(recap.moments).toEqual([])
  })
})

describe('тексты итогов', () => {
  const recap = buildSeasonRecap(midSeason)
  const fallback = buildFallbackTexts(recap)

  it('шаблоны заполняют все поля', () => {
    expect(fallback.badges).toHaveLength(4)
    expect(fallback.weaknesses).toHaveLength(3)
    expect(Object.keys(fallback.moments)).toEqual(['zero-r3', 'missed-r2'])
    expect(fallback.favoriteComment).toContain('Ландо Норрис')
  })

  it('чистит ответ модели и добирает недостающее из шаблонов', () => {
    const texts = sanitizeRecapTexts(
      {
        title: '«Заложник Норриса»',
        tagline: '  **Я   верю** в чудо  ',
        badges: [{ icon: 'unknown', name: 'снайпер', description: 'Идеальный подиум' }],
        moments: [
          { id: 'zero-r3', label: 'сход', comment: 'Ноль — тоже число.' },
          { id: 'чужой', label: 'X', comment: 'Y' },
        ],
        weaknesses: ['Монако', '', 42],
        artifact: 'а'.repeat(200),
      },
      recap,
      fallback,
    )

    expect(texts.title).toBe('Заложник Норриса')
    expect(texts.tagline).toBe('Я верю в чудо')
    expect(texts.badges[0]).toEqual({
      icon: 'trophy',
      name: 'СНАЙПЕР',
      description: 'Идеальный подиум',
    })
    expect(texts.badges).toHaveLength(4)
    expect(texts.moments['zero-r3']).toEqual({ label: 'СХОД', comment: 'Ноль — тоже число.' })
    expect(texts.moments['missed-r2']).toEqual(fallback.moments['missed-r2'])
    expect(texts.moments).not.toHaveProperty('чужой')
    expect(texts.weaknesses).toEqual(['Монако', ...fallback.weaknesses.slice(0, 2)])
    expect(texts.artifact).toHaveLength(90)
    expect(texts.nemesisComment).toBe(fallback.nemesisComment)
  })

  it('ответ без заголовка считается неудачным', () => {
    expect(() => sanitizeRecapTexts({ tagline: 'x' }, recap, fallback)).toThrow()
    expect(() => sanitizeRecapTexts(null, recap, fallback)).toThrow()
  })

  it('достаёт JSON из ответа в markdown-обёртке', () => {
    expect(parseModelJson('```json\n{"title":"A"}\n```')).toEqual({ title: 'A' })
    expect(parseModelJson('Вот ответ: {"title":"B"} — готово')).toEqual({ title: 'B' })
    expect(() => parseModelJson('не json')).toThrow()
  })
})

describe('requestRecapTexts', () => {
  const recap = buildSeasonRecap(midSeason)
  const fallback = buildFallbackTexts(recap)
  const reply = (body: unknown, status = 200) =>
    vi.fn(
      async (_url: string, _init: RequestInit) => new Response(JSON.stringify(body), { status }),
    )

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('отправляет факты в OpenRouter со строгой схемой и разбирает ответ', async () => {
    vi.stubEnv('OPENROUTER_API_KEY', 'test-key')
    vi.stubEnv('OPENROUTER_MODEL', 'google/gemini-test')
    const fetchMock = reply({
      choices: [{ message: { content: '{"title":"Заложник Норриса","tagline":"Верю в любовь"}' } }],
    })
    vi.stubGlobal('fetch', fetchMock)

    const texts = await requestRecapTexts(recap, fallback)
    const [url, init] = fetchMock.mock.calls[0]
    const body = JSON.parse(String(init.body))

    expect(url).toBe('https://openrouter.ai/api/v1/chat/completions')
    expect(init.headers).toMatchObject({ Authorization: 'Bearer test-key' })
    expect(body.model).toBe('google/gemini-test')
    expect(body.response_format.json_schema.strict).toBe(true)
    expect(body.messages[1].content).toContain('"id": "zero-r3"')
    expect(texts.title).toBe('Заложник Норриса')
    expect(texts.badges).toEqual(fallback.badges)
  })

  it('без ключа не ходит в сеть, ошибку OpenRouter пробрасывает', async () => {
    const fetchMock = reply({ error: 'no credits' }, 402)
    vi.stubGlobal('fetch', fetchMock)

    vi.stubEnv('OPENROUTER_API_KEY', '')
    await expect(requestRecapTexts(recap, fallback)).rejects.toThrow('OPENROUTER_API_KEY')
    expect(fetchMock).not.toHaveBeenCalled()

    vi.stubEnv('OPENROUTER_API_KEY', 'test-key')
    await expect(requestRecapTexts(recap, fallback)).rejects.toThrow('402')
  })
})

describe('plural', () => {
  it('склоняет по числу', () => {
    expect([1, 2, 5, 11, 21, 22, 25, 111].map((n) => plural(n, ['очко', 'очка', 'очков']))).toEqual(
      ['очко', 'очка', 'очков', 'очков', 'очко', 'очка', 'очков', 'очков'],
    )
  })
})
