import { calculatePoints } from '@/utilities/calculatePoints'
import { formatDecimal, plural } from '@/utilities/plural'
import type {
  DriverTally,
  PositionSpec,
  RecapDriver,
  RecapInput,
  RecapMoment,
  RecapMomentKind,
  RecapPick,
  RecapRace,
  RecapRaceInput,
  SeasonRecap,
} from './types'

/** Поднять при изменении расчётов или промпта — тексты перегенерируются */
export const RECAP_VERSION = 3

const MAX_MOMENTS = 5
/** Точное попадание считается «против толпы», если так поставили не больше 25% игроков */
const CONTRARIAN_MAX_SHARE = 0.25
const CONTRARIAN_MIN_PREDICTIONS = 4

const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0)
const round1 = (n: number) => Math.round(n * 10) / 10

export const toRace = ({ id, name, round, trackSVGPath }: RecapRaceInput): RecapRace => ({
  id,
  name,
  round,
  trackSVGPath,
})

type PlayedRace = { race: RecapRaceInput; picks: RecapPick[] | null; points: number | null }

/**
 * Собирает итоги сезона игрока. Очки считаются тем же calculatePoints, что и таблица лидеров,
 * поэтому место и сумма совпадают с лидербордом.
 */
export function buildSeasonRecap(input: RecapInput): SeasonRecap {
  const me = input.user.id
  const driverName = (id: string) => input.drivers[id]?.shortName ?? '???'
  const listDrivers = (picks: RecapPick[]) =>
    [...picks]
      .sort((a, b) => a.position - b.position)
      .map((pick) => driverName(pick.driver))
      .join(', ')

  const races = [...input.races].sort((a, b) => a.round - b.round)
  const completed = races.filter((race) => race.results.length > 0)

  const predictionsByRace = new Map<string, RecapInput['predictions']>()
  for (const prediction of input.predictions) {
    const list = predictionsByRace.get(prediction.race) ?? []
    list.push(prediction)
    predictionsByRace.set(prediction.race, list)
  }

  // Игроки — все, у кого есть прогноз в сезоне (как в season-stats)
  const cumulative = new Map<string, number>(input.predictions.map((p) => [p.user, 0]))
  const slotCounts = new Map<string, Map<string, number>>()
  const raceAverage = new Map<string, number>()
  const myRaces: PlayedRace[] = []
  const rankHistory: { race: RecapRaceInput; rank: number }[] = []
  let communityPoints = 0
  let communityPredictions = 0

  for (const race of completed) {
    const racePredictions = predictionsByRace.get(race.id) ?? []
    let raceTotal = 0
    let mine: PlayedRace | null = null

    for (const prediction of racePredictions) {
      const points = calculatePoints(prediction.picks, race.results)
      raceTotal += points
      cumulative.set(prediction.user, (cumulative.get(prediction.user) ?? 0) + points)
      if (prediction.user === me) mine = { race, picks: prediction.picks, points }

      for (const pick of prediction.picks) {
        const key = `${race.id}:${pick.position}`
        const slot = slotCounts.get(key) ?? new Map<string, number>()
        slot.set(pick.driver, (slot.get(pick.driver) ?? 0) + 1)
        slotCounts.set(key, slot)
      }
    }

    communityPoints += raceTotal
    communityPredictions += racePredictions.length
    raceAverage.set(race.id, racePredictions.length ? raceTotal / racePredictions.length : 0)

    // История начинается с первого прогноза игрока: до этого пропуски не считаем
    if (mine || myRaces.length > 0) {
      myRaces.push(mine ?? { race, picks: null, points: null })
      const myTotal = cumulative.get(me) ?? 0
      let ahead = 0
      for (const total of cumulative.values()) if (total > myTotal) ahead++
      rankHistory.push({ race, rank: ahead + 1 })
    }
  }

  const points = cumulative.get(me) ?? 0
  // Место — как в таблице лидеров: очки за гонки плюс очки за события
  const bonus = (id: string) => input.bonusPoints?.[id] ?? 0
  const myTotal = points + bonus(me)
  const rank = cumulative.has(me)
    ? 1 + [...cumulative.entries()].filter(([id, total]) => total + bonus(id) > myTotal).length
    : null

  const played = myRaces.filter(
    (entry): entry is PlayedRace & { picks: RecapPick[]; points: number } => entry.picks !== null,
  )
  const predictions = played.length
  const missed = myRaces.length - predictions
  const zeroRaces = played.filter((entry) => entry.points === 0).length
  const perfect = played.filter((entry) => entry.points === 15).length

  let bestStreak = 0
  let streak = 0
  for (const entry of myRaces) {
    streak = entry.picks ? streak + 1 : 0
    bestStreak = Math.max(bestStreak, streak)
  }

  // Разбор каждого выбранного пилота
  const tallies = new Map<string, { picks: number; podiums: number; exact: number }>()
  const positionStats = [1, 2, 3].map((position) => ({
    position: position as 1 | 2 | 3,
    hits: 0,
    attempts: 0,
    drivers: new Map<string, number>(),
  }))
  let totalPicks = 0
  let podiumHits = 0
  let exactHits = 0
  let crowdPicks = 0
  let rarest: { race: RecapRaceInput; driver: string; position: number; share: number } | null =
    null

  for (const { race, picks } of played) {
    const actual = new Map(race.results.map((result) => [result.driver, result.position]))
    const raceSize = predictionsByRace.get(race.id)?.length ?? 0

    for (const pick of picks) {
      totalPicks++
      const tally = tallies.get(pick.driver) ?? { picks: 0, podiums: 0, exact: 0 }
      tally.picks++
      tallies.set(pick.driver, tally)

      const spec = positionStats[pick.position - 1]
      if (spec) spec.attempts++

      // «Как у всех» — самый популярный выбор на позиции, если его сделали хотя бы двое
      const slot = slotCounts.get(`${race.id}:${pick.position}`)
      const slotCount = slot?.get(pick.driver) ?? 0
      if (slot && slotCount >= 2 && slotCount === Math.max(...slot.values())) crowdPicks++

      const actualPosition = actual.get(pick.driver)
      if (actualPosition === undefined) continue
      tally.podiums++
      podiumHits++
      if (actualPosition !== pick.position) continue

      tally.exact++
      exactHits++
      if (spec) {
        spec.hits++
        spec.drivers.set(pick.driver, (spec.drivers.get(pick.driver) ?? 0) + 1)
      }
      const share = raceSize > 0 ? slotCount / raceSize : 1
      if (raceSize >= CONTRARIAN_MIN_PREDICTIONS && (!rarest || share < rarest.share)) {
        rarest = { race, driver: pick.driver, position: pick.position, share }
      }
    }
  }

  const known = [...tallies.entries()]
    .filter(([id]) => input.drivers[id])
    .map(([id, tally]) => ({ driver: input.drivers[id] as RecapDriver, ...tally }))

  const favorite: DriverTally | null =
    [...known].sort(
      (a, b) =>
        b.picks - a.picks ||
        b.podiums - a.podiums ||
        b.exact - a.exact ||
        a.driver.name.localeCompare(b.driver.name),
    )[0] ?? null

  const nemesis =
    known
      .filter((tally) => tally.driver.id !== favorite?.driver.id)
      .map((tally) => ({ ...tally, misses: tally.picks - tally.podiums }))
      .filter((tally) => tally.misses >= 2)
      .sort((a, b) => b.misses - a.misses || b.picks - a.picks)[0] ?? null

  const contrarian =
    rarest && rarest.share <= CONTRARIAN_MAX_SHARE && input.drivers[rarest.driver]
      ? {
          race: toRace(rarest.race),
          driver: input.drivers[rarest.driver] as RecapDriver,
          position: rarest.position,
          sharePct: pct(rarest.share, 1),
        }
      : null

  const positions: PositionSpec[] = positionStats.map((spec) => ({
    position: spec.position,
    hits: spec.hits,
    attempts: spec.attempts,
    drivers: [...spec.drivers.entries()]
      .filter(([id]) => input.drivers[id])
      .map(([id, count]) => ({ driver: input.drivers[id] as RecapDriver, count }))
      .sort((a, b) => b.count - a.count),
  }))

  // Движение по таблице
  let peakRank: number | null = null
  let bestClimb: SeasonRecap['bestClimb'] = null
  let worstDrop: SeasonRecap['bestClimb'] = null
  for (let i = 0; i < rankHistory.length; i++) {
    const { race, rank: to } = rankHistory[i]
    peakRank = peakRank === null ? to : Math.min(peakRank, to)
    if (i === 0) continue
    const from = rankHistory[i - 1].rank
    if (from > to && (!bestClimb || from - to > bestClimb.from - bestClimb.to)) {
      bestClimb = { race: toRace(race), from, to }
    }
    if (from < to && (!worstDrop || to - from > worstDrop.to - worstDrop.from)) {
      worstDrop = { race: toRace(race), from, to }
    }
  }

  // «Посмотри на себя»: нули и пропуски там, где остальные набрали больше всего
  const average = (race: RecapRace) => formatDecimal(round1(raceAverage.get(race.id) ?? 0))
  const byEmbarrassment = (a: PlayedRace, b: PlayedRace) =>
    (raceAverage.get(b.race.id) ?? 0) - (raceAverage.get(a.race.id) ?? 0) ||
    b.race.round - a.race.round
  const moment = (
    kind: RecapMomentKind,
    race: RecapRaceInput,
    points: number | null,
    fact: string,
  ): RecapMoment => ({ id: `${kind}-${race.id}`, kind, race: toRace(race), points, fact })

  const zeroMoments = played
    .filter((entry) => entry.points === 0)
    .sort(byEmbarrassment)
    .map(({ race, picks }) =>
      moment(
        'zero',
        race,
        0,
        `${race.name}: 0 очков. Прогноз: ${listDrivers(picks)}. Подиум: ${listDrivers(race.results)}. Игроки в среднем набрали ${average(race)}.`,
      ),
    )
  const missedMoments = myRaces
    .filter((entry) => !entry.picks)
    .sort(byEmbarrassment)
    .map(({ race }) =>
      moment(
        'missed',
        race,
        null,
        `${race.name}: прогноз не сделан, а игроки в среднем набрали ${average(race)}.`,
      ),
    )
  const moments = [...zeroMoments.slice(0, 3), ...missedMoments.slice(0, 2)]
  const drop: SeasonRecap['bestClimb'] = worstDrop
  const dropRace = drop ? completed.find((race) => race.id === drop.race.id) : undefined
  if (
    drop &&
    dropRace &&
    drop.to - drop.from >= 3 &&
    !moments.some((m) => m.race.id === dropRace.id)
  ) {
    moments.push(
      moment(
        'drop',
        dropRace,
        played.find((entry) => entry.race.id === dropRace.id)?.points ?? null,
        `${dropRace.name}: после гонки откат с ${drop.from}-го на ${drop.to}-е место в таблице.`,
      ),
    )
  }
  moments.push(...zeroMoments.slice(3), ...missedMoments.slice(2))
  if (moments.length < 2) {
    const worst = played
      .filter((entry) => entry.points > 0)
      .sort((a, b) => a.points - b.points || b.race.round - a.race.round)
      .filter((entry) => !moments.some((m) => m.race.id === entry.race.id))
      .slice(0, 2 - moments.length)
    for (const { race, points: racePoints } of worst) {
      moments.push(
        moment(
          'worst',
          race,
          racePoints,
          `${race.name}: всего ${racePoints} ${plural(racePoints, ['очко', 'очка', 'очков'])} — худшая гонка сезона.`,
        ),
      )
    }
  }

  const topRaces = played
    .filter((entry) => entry.points > 0)
    .sort((a, b) => b.points - a.points || a.race.round - b.race.round)
    .slice(0, 5)
    .map((entry) => ({ race: toRace(entry.race), points: entry.points }))

  const crowdSharePct = pct(crowdPicks, totalPicks)

  // Дождь против сухой гонки
  const wet = played.filter((entry) => entry.race.rainfall === true)
  const dry = played.filter((entry) => entry.race.rainfall === false)
  const averagePoints = (list: typeof played) =>
    round1(list.reduce((sum, entry) => sum + entry.points, 0) / list.length)
  const weather =
    wet.length > 0 && dry.length > 0
      ? { wetRaces: wet.length, wetAvg: averagePoints(wet), dryAvg: averagePoints(dry) }
      : null

  // Выборы относительно стартовой решётки
  let racesWithGrid = 0
  let gridSum = 0
  let gridCount = 0
  let comebackPicks = 0
  let comebackHits = 0
  let qualiCopies = 0
  for (const { race, picks } of played) {
    if (race.grid.length === 0) continue
    racesWithGrid++
    const gridPosition = new Map(race.grid.map((slot) => [slot.driver, slot.position]))
    const onPodium = new Set(race.results.map((result) => result.driver))
    const frontRow = new Set(race.grid.filter((slot) => slot.position <= 3).map((s) => s.driver))
    if (picks.every((pick) => frontRow.has(pick.driver))) qualiCopies++
    for (const pick of picks) {
      const position = gridPosition.get(pick.driver)
      if (position === undefined) continue
      gridSum += position
      gridCount++
      if (position >= 6) {
        comebackPicks++
        if (onPodium.has(pick.driver)) comebackHits++
      }
    }
  }
  const grid =
    racesWithGrid > 0
      ? {
          racesWithGrid,
          avgGridPosition: gridCount > 0 ? round1(gridSum / gridCount) : 0,
          comebackPicks,
          comebackHits,
          qualiCopies,
        }
      : null

  const pointsByRace = new Map(played.map((entry) => [entry.race.id, entry.points]))
  const ratings = completed
    .filter((race) => input.ratings[race.id])
    .map((race) => ({
      race: toRace(race),
      rating: input.ratings[race.id],
      points: pointsByRace.get(race.id) ?? null,
    }))

  return {
    season: input.season,
    user: input.user,
    racesTotal: races.length,
    racesCompleted: completed.length,
    isSeasonComplete: races.length > 0 && completed.length === races.length,
    rank,
    playersTotal: cumulative.size,
    points,
    seasonPredictionPoints: input.seasonPredictionPoints,
    predictions,
    missed,
    perfect,
    zeroRaces,
    bestStreak,
    totalPicks,
    podiumHits,
    exactHits,
    avgPoints: predictions > 0 ? round1(points / predictions) : 0,
    communityAvgPoints:
      communityPredictions > 0 ? round1(communityPoints / communityPredictions) : 0,
    crowdSharePct,
    topRaces,
    favorite,
    nemesis,
    contrarian,
    positions,
    peakRank,
    bestClimb,
    moments: moments.slice(0, MAX_MOMENTS),
    radar: [
      { key: 'accuracy', label: 'Точность', value: pct(podiumHits, totalPicks) },
      { key: 'sniper', label: 'Снайперство', value: pct(exactHits, totalPicks) },
      { key: 'boldness', label: 'Смелость', value: totalPicks > 0 ? 100 - crowdSharePct : 0 },
      { key: 'stability', label: 'Стабильность', value: pct(predictions - zeroRaces, predictions) },
      { key: 'activity', label: 'Активность', value: pct(predictions, myRaces.length) },
      { key: 'loyalty', label: 'Верность', value: favorite ? pct(favorite.picks, predictions) : 0 },
    ],
    categories: [
      { code: 'A', label: 'Победители', earned: positions[0].hits > 0 },
      { code: 'B', label: 'Серебро', earned: positions[1].hits > 0 },
      { code: 'C', label: 'Бронза', earned: positions[2].hits > 0 },
      { code: 'D', label: 'Идеальный подиум', earned: perfect > 0 },
      { code: 'E', label: 'Без пропусков', earned: predictions > 0 && missed === 0 },
      { code: 'F', label: 'Против толпы', earned: contrarian !== null },
      { code: 'G', label: 'Серия 5+', earned: bestStreak >= 5 },
      { code: 'H', label: 'Топ-10', earned: rank !== null && rank <= 10 },
    ],
    penaltyPoints: Math.min(12, missed + zeroRaces),
    weather,
    grid,
    ratings,
    timeline: myRaces.map((entry, i) => ({
      race: toRace(entry.race),
      points: entry.points,
      avg: round1(raceAverage.get(entry.race.id) ?? 0),
      rank: rankHistory[i].rank,
    })),
    fingerprint: [
      `v${RECAP_VERSION}`,
      completed.length,
      points,
      predictions,
      rank ?? '-',
      input.seasonPredictionPoints,
    ].join(':'),
  }
}
