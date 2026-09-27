/**
 * Генерация текстов «Итогов сезона» нейросетью. Сайт сам OpenRouter не вызывает,
 * а только показывает то, что записал этот скрипт.
 *
 *   npm run recap:generate -- 2026            все игроки сезона 2026
 *   npm run recap:generate -- 2026 top=50     первые 50 из таблицы
 *   npm run recap:generate -- 2026 force      перезаписать и уже готовые тексты
 *
 * Параметры: сезон (по умолчанию текущий год), top=N, force, concurrency=N (по умолчанию 4).
 * Без force игроки, у которых тексты уже совпадают с текущей статистикой, пропускаются.
 * Нужны DATABASE_URI (боевая база), PAYLOAD_SECRET и OPENROUTER_API_KEY в .env.
 */
import { register } from 'node:module'

// Запросы сайта кэшируются через 'use cache': вне Next cacheTag/cacheLife бросают ошибку,
// поэтому next/cache подменяем пустышками. Модули сайта импортируем только после этого.
const NEXT_CACHE_STUB = [
  'export const cacheTag = () => {}',
  'export const cacheLife = () => {}',
  'export const revalidateTag = () => {}',
  'export const revalidatePath = () => {}',
  'export const updateTag = () => {}',
  'export const refresh = () => {}',
  'export const unstable_cache = (fn) => fn',
].join('\n')
const hooks = `
const stub = 'data:text/javascript,' + encodeURIComponent(${JSON.stringify(NEXT_CACHE_STUB)})
export async function resolve(specifier, context, next) {
  if (specifier === 'next/cache' || specifier === 'next/cache.js') return { url: stub, shortCircuit: true }
  return next(specifier, context)
}`
register(`data:text/javascript,${encodeURIComponent(hooks)}`)

type Options = { season: number; top: number | null; force: boolean; concurrency: number }

function parseOptions(argv: string[]): Options {
  const options: Options = {
    season: new Date().getFullYear(),
    top: null,
    force: false,
    concurrency: 4,
  }
  for (const arg of argv.map(String)) {
    const [key, value] = arg.includes('=') ? arg.split('=', 2) : [null, arg]
    const number = Number(value)
    if (key === 'top' && Number.isInteger(number) && number > 0) options.top = number
    else if (key === 'concurrency' && Number.isInteger(number) && number > 0)
      options.concurrency = Math.min(number, 10)
    else if (!key && value === 'force') options.force = true
    else if (!key && /^\d{4}$/.test(value)) options.season = number
    else throw new Error(`Непонятный параметр «${arg}»`)
  }
  return options
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Повторы при сбоях сети, 429 и 5xx: 3 попытки с паузой */
async function withRetries<T>(job: () => Promise<T>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await job()
    } catch (error) {
      if (attempt >= 3) throw error
      await sleep(attempt * 10_000)
    }
  }
}

async function main() {
  const options = parseOptions(process.argv.slice(2))
  if (!process.env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY не задан в .env')

  const { getAllSeasonStats } = await import('../src/utilities/queries')
  const { normalizeID } = await import('../src/utilities/normalizeID')
  const { getCommunityRecap, getSeasonRecap, loadSeasonData } =
    await import('../src/utilities/seasonRecap/getSeasonRecap')
  const { recapModel, requestRecapTexts } = await import('../src/utilities/seasonRecap/aiTexts')
  const { buildFallbackTexts } = await import('../src/utilities/seasonRecap/fallbackTexts')
  const { buildCommunityFallback, requestCommunityTexts } =
    await import('../src/utilities/seasonRecap/communityTexts')
  const texts = await import('../src/utilities/seasonRecap/getRecapTexts')

  const model = recapModel()
  const total = { generated: 0, skipped: 0, failed: 0, input: 0, output: 0, cost: 0 }
  const onUsage = (usage: { inputTokens: number; outputTokens: number; cost: number }) => {
    total.input += usage.inputTokens
    total.output += usage.outputTokens
    total.cost += usage.cost
  }

  const [data, allStats] = await Promise.all([
    loadSeasonData(options.season),
    getAllSeasonStats({ year: options.season, depth: 0 }),
  ])
  if (data.races.length === 0) throw new Error(`В сезоне ${options.season} нет гонок`)

  const completed = data.races.filter((race) => race.results.length > 0).length
  console.log(
    `Сезон ${options.season}: ${completed}/${data.races.length} гонок, модель ${model}` +
      (options.top ? `, топ-${options.top}` : `, все ${allStats.length} игроков`) +
      (options.force ? ', перезапись' : ''),
  )
  if (completed < data.races.length) {
    console.warn(
      '⚠ Сезон не закончен: после новых гонок тексты устареют (сайт покажет их как есть).',
    )
  }

  // Общие итоги сезона: один запрос на всех
  const community = await getCommunityRecap(options.season)
  const storedCommunity = await texts.findCommunityTexts(options.season)
  if (!options.force && storedCommunity?.fingerprint === community.fingerprint) {
    console.log('Номинации сезона: уже готовы')
  } else {
    try {
      const result = await withRetries(() =>
        requestCommunityTexts(community, buildCommunityFallback(community), onUsage),
      )
      await texts.saveCommunityTexts(community, result, model, storedCommunity?.id ?? null)
      console.log('Номинации сезона: готово')
    } catch (error) {
      console.error('Номинации сезона: ошибка —', error instanceof Error ? error.message : error)
    }
  }

  // Порядок как в таблице лидеров
  const rows = options.top ? allStats.slice(0, options.top) : allStats
  const queue = rows.map((row, index) => ({ place: index + 1, userId: normalizeID(row.user) }))
  const width = String(queue.length).length

  const worker = async () => {
    for (let item = queue.shift(); item; item = queue.shift()) {
      const tag = `[${String(item.place).padStart(width)}/${rows.length}]`
      const recap = await getSeasonRecap(item.userId, options.season, { data, allStats })
      if (!recap || recap.predictions === 0) {
        total.skipped++
        console.log(`${tag} ${item.userId}: нет прогнозов, пропуск`)
        continue
      }

      const stored = await texts.findPersonalTexts(recap.user.id, options.season)
      if (!options.force && stored?.fingerprint === recap.fingerprint) {
        total.skipped++
        console.log(`${tag} ${recap.user.nickname}: уже готово`)
        continue
      }

      let cost = 0
      try {
        const result = await withRetries(() =>
          requestRecapTexts(recap, buildFallbackTexts(recap), (usage) => {
            cost += usage.cost
            onUsage(usage)
          }),
        )
        await texts.saveRecapTexts(recap, result, model, stored?.id ?? null)
        total.generated++
        console.log(`${tag} ${recap.user.nickname}: «${result.title}» ($${cost.toFixed(4)})`)
      } catch (error) {
        total.failed++
        console.error(
          `${tag} ${recap.user.nickname}: ошибка —`,
          error instanceof Error ? error.message : error,
        )
      }
    }
  }
  await Promise.all(Array.from({ length: options.concurrency }, worker))

  console.log(
    `\nГотово: ${total.generated} сгенерировано, ${total.skipped} пропущено, ${total.failed} с ошибкой.` +
      `\nТокены: ${total.input} на вход, ${total.output} на выход. Потрачено $${total.cost.toFixed(4)}.`,
  )
  if (total.failed > 0) {
    console.log('Запусти скрипт ещё раз — готовые тексты он пропустит и повторит только ошибки.')
  }
}

try {
  await main()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  // payload run после скрипта сам завершает процесс с кодом 0
  process.exit(1)
}
