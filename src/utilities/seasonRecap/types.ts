// Итоги сезона: входные данные для расчёта и готовая сводка по игроку.

export type RecapPick = { position: number; driver: string }

export type RecapPrediction = { user: string; race: string; picks: RecapPick[] }

export type RecapRace = {
  id: string
  name: string
  round: number
  trackSVGPath: string | null
}

export type RecapRaceInput = RecapRace & {
  results: RecapPick[]
  /** Стартовая решётка из OpenF1; пустая, если не импортировали */
  grid: RecapPick[]
  /** Был ли дождь; null — погоду не импортировали */
  rainfall: boolean | null
  /** Оценки гонки игроками (для итогов сезона) */
  votes?: { good: number; normal: number; bad: number }
}

export type RaceRatingValue = 'bad' | 'normal' | 'good'

export type RecapDriver = {
  id: string
  name: string
  shortName: string
  teamName: string | null
  teamColor: string
  photoUrl: string | null
}

export type RecapUser = {
  id: string
  nickname: string
  chartColor: string
  equippedNicknameEffect: string | null
}

export type RecapInput = {
  season: number
  user: RecapUser
  seasonPredictionPoints: number
  /** Все гонки сезона, включая ещё не прошедшие */
  races: RecapRaceInput[]
  /** Прогнозы всех игроков на гонки сезона */
  predictions: RecapPrediction[]
  drivers: Record<string, RecapDriver>
  /** Очки за события всех игроков (как в season-stats) — учитываются в месте */
  bonusPoints?: Record<string, number>
  /** Оценки гонок игроком: id гонки → оценка */
  ratings: Record<string, RaceRatingValue>
}

export type DriverTally = {
  driver: RecapDriver
  picks: number
  podiums: number
  exact: number
}

export type RecapMomentKind = 'zero' | 'missed' | 'drop' | 'worst'

/** Момент для блока «Посмотри на себя» — нейросеть подписывает его по id */
export type RecapMoment = {
  id: string
  kind: RecapMomentKind
  race: RecapRace
  /** Очки за гонку; null — прогноза не было */
  points: number | null
  /** Факт одной строкой — для промпта и запасного текста */
  fact: string
}

export type RadarAxis = { key: string; label: string; value: number }

export type PositionSpec = {
  position: 1 | 2 | 3
  hits: number
  attempts: number
  /** Пилоты, угаданные точно на этой позиции */
  drivers: { driver: RecapDriver; count: number }[]
}

export type LicenceCategory = { code: string; label: string; earned: boolean }

export type SeasonRecap = {
  season: number
  user: RecapUser
  racesTotal: number
  racesCompleted: number
  isSeasonComplete: boolean
  rank: number | null
  playersTotal: number
  points: number
  seasonPredictionPoints: number
  /** Прогнозы на завершённые гонки */
  predictions: number
  /** Пропущенные гонки после первого прогноза */
  missed: number
  perfect: number
  zeroRaces: number
  bestStreak: number
  totalPicks: number
  podiumHits: number
  exactHits: number
  avgPoints: number
  communityAvgPoints: number
  /** Доля выборов, совпавших с самым популярным пилотом на позиции */
  crowdSharePct: number
  topRaces: { race: RecapRace; points: number }[]
  favorite: DriverTally | null
  nemesis: (DriverTally & { misses: number }) | null
  /** Самое редкое точное попадание */
  contrarian: { race: RecapRace; driver: RecapDriver; position: number; sharePct: number } | null
  positions: PositionSpec[]
  peakRank: number | null
  bestClimb: { race: RecapRace; from: number; to: number } | null
  moments: RecapMoment[]
  radar: RadarAxis[]
  categories: LicenceCategory[]
  /** Штрафные баллы суперлицензии: пропуски + гонки без очков, максимум 12 */
  penaltyPoints: number
  /** Средние очки в дождь и в сухую; null — нет гонок одного из типов */
  weather: { wetRaces: number; wetAvg: number; dryAvg: number } | null
  /** Выборы относительно стартовой решётки; null — решётку не импортировали */
  grid: {
    racesWithGrid: number
    avgGridPosition: number
    /** Ставки на пилотов, стартовавших с P6 и дальше */
    comebackPicks: number
    comebackHits: number
    /** Прогнозы, где тройка совпала с первыми тремя на старте */
    qualiCopies: number
  } | null
  /** Гонки с первого прогноза: очки (null — пропуск), среднее по игрокам и место после гонки */
  timeline: { race: RecapRace; points: number | null; avg: number; rank: number }[]
  /** Оценки завершённых гонок рядом с очками за них */
  ratings: { race: RecapRace; rating: RaceRatingValue; points: number | null }[]
  /** Меняется вместе со статистикой — по нему понимаем, что тексты устарели */
  fingerprint: string
}

export const BADGE_ICONS = [
  'trophy',
  'target',
  'flame',
  'crown',
  'ghost',
  'anchor',
  'users',
  'clock',
  'dice',
  'rain',
  'rocket',
  'brain',
  'skull',
  'heart',
  'shield',
  'hourglass',
] as const

export type BadgeIcon = (typeof BADGE_ICONS)[number]

export type RecapBadge = { icon: BadgeIcon; name: string; description: string }

/** Тексты карточек: пишет нейросеть, при её недоступности — шаблоны */
export type RecapTexts = {
  title: string
  tagline: string
  favoriteComment: string
  nemesisComment: string
  badges: RecapBadge[]
  moments: Record<string, { label: string; comment: string }>
  weaknesses: string[]
  conditionsComment: string
  artifact: string
  specialMarks: string
}
