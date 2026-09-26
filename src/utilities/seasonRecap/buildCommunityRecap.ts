import { calculatePoints } from '@/utilities/calculatePoints'
import { plural } from '@/utilities/plural'
import { toRace } from './buildSeasonRecap'
import type {
  RecapDriver,
  RecapPick,
  RecapPrediction,
  RecapRace,
  RecapRaceInput,
  RecapUser,
} from './types'

export type CommunityInput = {
  season: number
  races: RecapRaceInput[]
  predictions: RecapPrediction[]
  drivers: Record<string, RecapDriver>
  players: Record<string, RecapUser>
}

export type Nomination = {
  key: string
  title: string
  description: string
  user: RecapUser
  value: string
}

export type CommunityRecap = {
  season: number
  racesTotal: number
  racesCompleted: number
  isSeasonComplete: boolean
  playersTotal: number
  predictionsTotal: number
  nominations: Nomination[]
  hardestRace: { race: RecapRace; avg: number } | null
  easiestRace: { race: RecapRace; avg: number } | null
  /** Виртуальный игрок, который всегда ставил как большинство */
  crowd: { points: number; rank: number } | null
}

const round1 = (n: number) => Math.round(n * 10) / 10
const times = (n: number, forms: [string, string, string]) => `${n} ${plural(n, forms)}`

/** Самый популярный пилот на каждой позиции; при равенстве — по id, чтобы результат был стабилен */
function crowdPicks(predictions: RecapPrediction[]): RecapPick[] {
  return [1, 2, 3].flatMap((position) => {
    const counts = new Map<string, number>()
    for (const prediction of predictions) {
      const pick = prediction.picks.find((p) => p.position === position)
      if (pick) counts.set(pick.driver, (counts.get(pick.driver) ?? 0) + 1)
    }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]
    return top ? [{ position, driver: top[0] }] : []
  })
}

/** Общие итоги сезона: номинации игроков, самые сложные гонки и «народный игрок» */
export function buildCommunityRecap(input: CommunityInput): CommunityRecap {
  const races = [...input.races].sort((a, b) => a.round - b.round)
  const completed = races.filter((race) => race.results.length > 0)
  const known = (id: string) => !!input.players[id]

  type Player = {
    points: number
    predictions: number
    perfect: number
    zeros: number
    missed: number
    streak: number
    bestStreak: number
    started: boolean
    drivers: Map<string, number>
  }
  const players = new Map<string, Player>()
  const player = (id: string) => {
    let entry = players.get(id)
    if (!entry) {
      entry = {
        points: 0,
        predictions: 0,
        perfect: 0,
        zeros: 0,
        missed: 0,
        streak: 0,
        bestStreak: 0,
        started: false,
        drivers: new Map(),
      }
      players.set(id, entry)
    }
    return entry
  }
  for (const prediction of input.predictions) if (known(prediction.user)) player(prediction.user)

  const raceAverages: { race: RecapRaceInput; avg: number }[] = []
  let boldest: { user: string; race: RecapRaceInput; pick: RecapPick; share: number } | null = null
  let crowdPoints = 0
  let predictionsTotal = 0

  for (const race of completed) {
    const racePredictions = input.predictions.filter(
      (prediction) => prediction.race === race.id && known(prediction.user),
    )
    const predicted = new Set(racePredictions.map((prediction) => prediction.user))
    let raceTotal = 0

    for (const prediction of racePredictions) {
      const points = calculatePoints(prediction.picks, race.results)
      const entry = player(prediction.user)
      raceTotal += points
      entry.points += points
      entry.predictions++
      entry.started = true
      if (points === 15) entry.perfect++
      if (points === 0) entry.zeros++
      for (const pick of prediction.picks) {
        entry.drivers.set(pick.driver, (entry.drivers.get(pick.driver) ?? 0) + 1)
        const exact = race.results.some(
          (r) => r.driver === pick.driver && r.position === pick.position,
        )
        if (!exact || racePredictions.length < 4) continue
        const same = racePredictions.filter((other) =>
          other.picks.some((p) => p.position === pick.position && p.driver === pick.driver),
        ).length
        const share = same / racePredictions.length
        if (!boldest || share < boldest.share) {
          boldest = { user: prediction.user, race, pick, share }
        }
      }
    }

    for (const [id, entry] of players) {
      if (predicted.has(id)) {
        entry.streak++
        entry.bestStreak = Math.max(entry.bestStreak, entry.streak)
      } else {
        entry.streak = 0
        if (entry.started) entry.missed++
      }
    }

    predictionsTotal += racePredictions.length
    if (racePredictions.length > 0) {
      raceAverages.push({ race, avg: raceTotal / racePredictions.length })
      crowdPoints += calculatePoints(crowdPicks(racePredictions), race.results)
    }
  }

  // Номинант — лучший по метрике; при равенстве — по нику, чтобы порядок был стабилен
  const best = (metric: (entry: Player) => number, min = 1) =>
    [...players.entries()]
      .map(([id, entry]) => ({ id, entry, value: metric(entry) }))
      .filter((row) => row.value >= min)
      .sort(
        (a, b) =>
          b.value - a.value ||
          input.players[a.id].nickname.localeCompare(input.players[b.id].nickname),
      )[0] ?? null

  const nominations: Nomination[] = []
  const nominate = (
    key: string,
    title: string,
    description: string,
    row: { id: string } | null,
    value: (id: string) => string,
  ) => {
    if (row)
      nominations.push({
        key,
        title,
        description,
        user: input.players[row.id],
        value: value(row.id),
      })
  }

  const champion = best((entry) => entry.points, 0)
  nominate('champion', 'Чемпион сезона', 'Больше всех очков', champion, (id) =>
    times(players.get(id)!.points, ['очко', 'очка', 'очков']),
  )
  nominate(
    'sniper',
    'Снайпер',
    'Больше всех идеальных подиумов',
    best((e) => e.perfect),
    (id) => times(players.get(id)!.perfect, ['идеальный', 'идеальных', 'идеальных']),
  )
  nominate(
    'ironman',
    'Железный',
    'Самая длинная серия без пропусков',
    best((e) => e.bestStreak, 2),
    (id) => `${times(players.get(id)!.bestStreak, ['гонка', 'гонки', 'гонок'])} подряд`,
  )

  const loyalty = (entry: Player) =>
    entry.predictions >= 3 ? Math.max(0, ...entry.drivers.values()) / entry.predictions : 0
  const fan = best(loyalty, 0.01)
  nominate('fan', 'Верный фанат', 'Один пилот почти в каждом прогнозе', fan, (id) => {
    const entry = players.get(id)!
    const [driverId] = [...entry.drivers.entries()].sort((a, b) => b[1] - a[1])[0]
    return `${input.drivers[driverId]?.shortName ?? '???'} в ${Math.round(loyalty(entry) * 100)}% прогнозов`
  })

  nominate(
    'zeros',
    'Коллекционер нулей',
    'Больше всех гонок без очков',
    best((e) => e.zeros),
    (id) => times(players.get(id)!.zeros, ['ноль', 'нуля', 'нулей']),
  )
  nominate(
    'ghost',
    'Призрак паддока',
    'Больше всех пропущенных гонок',
    best((e) => e.missed),
    (id) => times(players.get(id)!.missed, ['пропуск', 'пропуска', 'пропусков']),
  )

  const bold = boldest as {
    user: string
    race: RecapRaceInput
    pick: RecapPick
    share: number
  } | null
  if (bold && bold.share <= 0.25) {
    nominations.push({
      key: 'bold',
      title: 'Смелый прогноз',
      description: 'Точное попадание, в которое почти никто не верил',
      user: input.players[bold.user],
      value: `${input.drivers[bold.pick.driver]?.shortName ?? '???'} P${bold.pick.position}, ${bold.race.name} — верили ${Math.round(bold.share * 100)}%`,
    })
  }

  const sortedRaces = [...raceAverages].sort((a, b) => a.avg - b.avg)
  const hardest = sortedRaces[0]
  const easiest = sortedRaces[sortedRaces.length - 1]
  const totals = [...players.values()].map((entry) => entry.points)

  return {
    season: input.season,
    racesTotal: races.length,
    racesCompleted: completed.length,
    isSeasonComplete: races.length > 0 && completed.length === races.length,
    playersTotal: players.size,
    predictionsTotal,
    nominations,
    hardestRace: hardest ? { race: toRace(hardest.race), avg: round1(hardest.avg) } : null,
    easiestRace:
      easiest && easiest !== hardest
        ? { race: toRace(easiest.race), avg: round1(easiest.avg) }
        : null,
    crowd:
      raceAverages.length > 0
        ? { points: crowdPoints, rank: 1 + totals.filter((total) => total > crowdPoints).length }
        : null,
  }
}
