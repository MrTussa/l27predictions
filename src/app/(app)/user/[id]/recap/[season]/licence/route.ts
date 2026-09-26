import { isAdmin } from '@/access'
import { getServerSideUser } from '@/utilities/getServerSideUser'
import { getSavedRecapTexts } from '@/utilities/seasonRecap/getRecapTexts'
import { getSeasonRecap, parseSeason } from '@/utilities/seasonRecap/getSeasonRecap'
import { renderLicenceImage } from '../_components/LicenceImage'

type Context = {
  params: Promise<{ id: string; season: string }>
}

// Картинка-суперлицензия: превью ссылки в Telegram и кнопка «Скачать PNG».
// Доступ как у страницы: до финальной гонки — только админам.
// Тексты берём только сохранённые — ждать нейросеть ради превью нельзя.
export async function GET(_request: Request, { params }: Context) {
  const { id, season: seasonParam } = await params
  const season = parseSeason(seasonParam)
  const recap = season ? await getSeasonRecap(id, season) : null
  const isPublic = !!recap?.isSeasonComplete
  const canView =
    !!recap && recap.predictions > 0 && (isPublic || isAdmin((await getServerSideUser()).user))

  return renderLicenceImage(
    canView ? { recap, texts: await getSavedRecapTexts(recap) } : null,
    season,
    isPublic ? 'public, max-age=300' : 'private, no-store',
  )
}
