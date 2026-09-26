import { formatDecimal, plural } from '@/utilities/plural'
import type { RecapBadge, RecapMoment, RecapTexts, SeasonRecap } from './types'

// Шаблонные тексты: показываются, пока нет ключа OpenRouter или если нейросеть не ответила

const times = (n: number) => `${n} ${plural(n, ['раз', 'раза', 'раз'])}`
const racesCount = (n: number) => `${n} ${plural(n, ['гонка', 'гонки', 'гонок'])}`
const pointsCount = (n: number) => `${n} ${plural(n, ['очко', 'очка', 'очков'])}`
const share = (part: number, whole: number) => (whole > 0 ? part / whole : 0)

function title(r: SeasonRecap): string {
  if (r.rank === 1) return 'Чемпион мира по прогнозам'
  if (r.perfect >= 3) return 'Снайпер подиумов'
  if (r.rank !== null && r.rank <= 3) return 'Призёр сезона'
  if (share(r.zeroRaces, r.predictions) >= 0.4) return 'Коллекционер нулей'
  if (share(r.missed, r.predictions + r.missed) >= 0.3) return 'Призрак паддока'
  if (r.crowdSharePct >= 70) return 'Голос народа'
  if (r.favorite && share(r.favorite.picks, r.predictions) >= 0.8) return 'Однолюб паддока'
  if (r.crowdSharePct <= 35) return 'Любитель риска'
  return 'Пилот середины пелотона'
}

function tagline(r: SeasonRecap): string {
  if (r.rank === 1) return 'Я не угадываю подиумы — я их назначаю.'
  if (r.zeroRaces > r.predictions / 2) return 'Главное не очки, главное — участие. Наверное.'
  if (r.missed >= 3) return 'Пропускал гонки, чтобы у остальных был шанс.'
  if (r.crowdSharePct >= 70) return 'Если все ставят на одного — значит, и я тоже.'
  return `${pointsCount(r.points)} за сезон — и ни одного сожаления. Почти.`
}

function favoriteComment(r: SeasonRecap): string {
  const favorite = r.favorite
  if (!favorite) return 'Любимчика так и не завёл — доверяешь только себе.'
  const rate = share(favorite.podiums, favorite.picks)
  const verdict =
    rate >= 0.6
      ? 'Верность окупилась с процентами.'
      : rate >= 0.3
        ? 'Отношения сложные, но стабильные.'
        : 'Любовь зла, а подиум ещё злее.'
  return `${favorite.driver.name} был в прогнозе ${times(favorite.picks)}, на подиум заехал ${times(favorite.podiums)}. ${verdict}`
}

function nemesisComment(r: SeasonRecap): string {
  const nemesis = r.nemesis
  if (!nemesis) return 'Предателей не нашлось: пилоты тебя почти не подводили. Подозрительно.'
  return `Ставка на ${nemesis.driver.name} — ${times(nemesis.picks)}, мимо подиума — ${times(nemesis.misses)}. Доверие выдаётся один раз.`
}

function badges(r: SeasonRecap, recapTitle: string): RecapBadge[] {
  const candidates: (RecapBadge | null | false)[] = [
    r.rank !== null &&
      r.rank <= 3 && {
        icon: 'crown',
        name: 'ПОДИУМ СЕЗОНА',
        description: `${r.rank}-е место из ${r.playersTotal}`,
      },
    r.perfect > 0 && {
      icon: 'target',
      name: 'СНАЙПЕР',
      description: `Идеальных подиумов: ${r.perfect}`,
    },
    r.bestStreak >= 5 && {
      icon: 'flame',
      name: 'ЖЕЛЕЗНЫЙ',
      description: `${racesCount(r.bestStreak)} подряд без пропуска`,
    },
    r.contrarian && {
      icon: 'brain',
      name: 'ПРОТИВ ТОЛПЫ',
      description: `${r.contrarian.driver.shortName} P${r.contrarian.position}, когда верили ${r.contrarian.sharePct}%`,
    },
    r.crowdSharePct >= 60 && {
      icon: 'users',
      name: 'ГОЛОС НАРОДА',
      description: 'Прогнозы по заветам большинства',
    },
    !!r.favorite &&
      share(r.favorite.picks, r.predictions) >= 0.6 && {
        icon: 'anchor',
        name: 'ОДНОЛЮБ',
        description: `${r.favorite.driver.shortName} почти в каждом прогнозе`,
      },
    r.zeroRaces >= 3 && {
      icon: 'ghost',
      name: 'НОЛЬ ЭМОЦИЙ',
      description: `${racesCount(r.zeroRaces)} без единого очка`,
    },
    r.missed >= 3 && {
      icon: 'clock',
      name: 'ОПОЗДАВШИЙ',
      description: `${racesCount(r.missed)} без прогноза`,
    },
    r.avgPoints > r.communityAvgPoints && {
      icon: 'rocket',
      name: 'ВЫШЕ СРЕДНЕГО',
      description: `В среднем ${formatDecimal(r.avgPoints)} за гонку`,
    },
  ]
  const fillers: RecapBadge[] = [
    { icon: 'shield', name: 'ВЕТЕРАН', description: `Сезон ${r.season} пройден до финиша` },
    { icon: 'dice', name: 'АЗАРТ', description: 'Каждый прогноз — как последний' },
    { icon: 'heart', name: 'ФАНАТ', description: 'Смотрит гонки ради прогнозов' },
    { icon: 'hourglass', name: 'БЕЗ СПЕШКИ', description: 'Прогнозы по наитию, не по графикам' },
  ]
  // Значок не повторяет прозвище: «Однолюб паддока» + «ОДНОЛЮБ» — перебор
  const lowerTitle = recapTitle.toLowerCase()
  return [...candidates.filter((badge): badge is RecapBadge => !!badge), ...fillers]
    .filter((badge) => !lowerTitle.includes(badge.name.toLowerCase()))
    .slice(0, 4)
}

const ZERO_LINES = [
  { label: 'СХОД НА ПЕРВОМ КРУГЕ', comment: 'Ноль очков. Даже сейфти-кар угадал бы лучше.' },
  { label: 'ШТРАФНОЙ КРУГ', comment: 'Три пилота в прогнозе — и ни одного на подиуме.' },
  { label: 'ТИШИНА В ЭФИРЕ', comment: 'Ноль очков. Инженер попросил больше не выходить на связь.' },
]

function momentText(moment: RecapMoment, index: number) {
  switch (moment.kind) {
    case 'zero':
      return ZERO_LINES[index % ZERO_LINES.length]
    case 'missed':
      return { label: 'НЕЯВКА НА СТАРТ', comment: 'Прогноза нет — и оправданий в протоколе тоже.' }
    case 'drop':
      return { label: 'ТЕРЯЕТ ПОЗИЦИИ', comment: 'Одна гонка — и таблица уже смотрит свысока.' }
    case 'worst':
      return {
        label: 'ХУДШИЙ УИКЕНД',
        comment: `Всего ${pointsCount(moment.points ?? 0)} — дальше только вверх.`,
      }
  }
}

function weaknesses(r: SeasonRecap): string[] {
  const zeroRace = r.moments.find((moment) => moment.kind === 'zero')?.race.name
  const pool = [
    zeroRace && zeroRace.length <= 24 ? zeroRace : null,
    r.nemesis ? `Вера в ${r.nemesis.driver.shortName}` : null,
    r.crowdSharePct >= 60 ? 'Народный прогноз' : null,
    r.missed >= 2 ? 'Дедлайны' : null,
    share(r.exactHits, r.totalPicks) < 0.2 ? 'Точные позиции' : null,
  ]
  const fillers = ['Стартовая решётка', 'Дождевая резина', 'Интуиция']
  return [...pool.filter((item): item is string => !!item), ...fillers].slice(0, 3)
}

function artifact(r: SeasonRecap): string {
  if (r.missed >= 3) return 'Будильник, который не звонит в день гонки'
  if (r.zeroRaces >= 3) return 'Калькулятор, который умеет считать только до нуля'
  if (r.perfect > 0) return 'Хрустальный шар с трещиной после идеального подиума'
  if (r.favorite) return `Кепка ${r.favorite.driver.shortName} с автографом, который никто не видел`
  return 'Прогноз, отправленный за минуту до дедлайна'
}

function specialMarks(r: SeasonRecap): string {
  return [
    r.favorite
      ? `верит в ${r.favorite.driver.shortName} до клетчатого флага`
      : 'ни в кого не верит',
    r.crowdSharePct >= 55 ? 'сверяется с народным прогнозом' : 'толпу не слушает',
  ].join('; ')
}

export function buildFallbackTexts(recap: SeasonRecap): RecapTexts {
  const counters: Record<string, number> = {}
  const moments = Object.fromEntries(
    recap.moments.map((moment) => {
      const index = counters[moment.kind] ?? 0
      counters[moment.kind] = index + 1
      return [moment.id, momentText(moment, index)]
    }),
  )

  const recapTitle = title(recap)
  return {
    title: recapTitle,
    tagline: tagline(recap),
    favoriteComment: favoriteComment(recap),
    nemesisComment: nemesisComment(recap),
    badges: badges(recap, recapTitle),
    moments,
    weaknesses: weaknesses(recap),
    artifact: artifact(recap),
    specialMarks: specialMarks(recap),
  }
}
