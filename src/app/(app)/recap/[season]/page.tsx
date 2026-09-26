import { isAdmin } from '@/access'
import { Card } from '@/components/ui/card'
import { getServerSideUser } from '@/utilities/getServerSideUser'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import type { CommunityRecap } from '@/utilities/seasonRecap/buildCommunityRecap'
import { getCommunityTexts } from '@/utilities/seasonRecap/getRecapTexts'
import { getCommunityRecap, parseSeason } from '@/utilities/seasonRecap/getSeasonRecap'
import { IconHourglass } from '@tabler/icons-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import {
  GeneratingMarker,
  GeneratingOverlay,
} from '../../user/[id]/recap/[season]/_components/GeneratingOverlay'
import { CommunityView } from './_components/CommunityView'

type Props = {
  params: Promise<{ season: string }>
}

export default async function CommunityRecapPage({ params }: Props) {
  const { season: seasonParam } = await params
  const season = parseSeason(seasonParam)
  if (!season) notFound()

  const [recap, { user: viewer }] = await Promise.all([
    getCommunityRecap(season),
    getServerSideUser(),
  ])
  if (recap.racesTotal === 0) notFound()

  // До финальной гонки общие итоги видят только админы
  const isPreview = !recap.isSeasonComplete
  if (isPreview && !isAdmin(viewer)) {
    return (
      <div className="px-4 py-12 md:px-16">
        <Card variant="gray" corners="cut-corner" className="mx-auto max-w-xl">
          <div className="flex flex-col items-center gap-4 px-6 py-4 text-center">
            <IconHourglass className="size-12 text-accent" />
            <h1 className="text-2xl font-black uppercase tracking-wide">Итоги сезона {season}</h1>
            <p className="text-muted-foreground">
              Номинации сезона откроются после финальной гонки: прошло {recap.racesCompleted} из{' '}
              {recap.racesTotal}.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-450 space-y-6 px-4 py-6 md:px-16">
      {isPreview && (
        <span className="inline-block border border-accent/50 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-accent">
          Предпросмотр для админов · откроется после финала ({recap.racesCompleted}/
          {recap.racesTotal})
        </span>
      )}
      <GeneratingOverlay phrases={PHRASES} />
      <Suspense
        fallback={
          <>
            <GeneratingMarker />
            <CommunityView recap={recap} texts={null} viewerId={viewer?.id ?? null} />
          </>
        }
      >
        <CommunityWithTexts recap={recap} viewerId={viewer?.id ?? null} />
      </Suspense>
    </div>
  )
}

const PHRASES = [
  'Собираем подиум…',
  'Раздаём номинации…',
  'Ищем, кто проспал сезон…',
  'Считаем голоса за гонки…',
  'Нейросеть подбирает выражения…',
]

async function CommunityWithTexts({
  recap,
  viewerId,
}: {
  recap: CommunityRecap
  viewerId: string | null
}) {
  const texts = await getCommunityTexts(recap)
  return <CommunityView recap={recap} texts={texts} viewerId={viewerId} />
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { season } = await params
  const title = `Итоги сезона ${season}`
  const description =
    'Номинации сезона чемпионата прогнозов L27: чемпион, снайпер, верный фанат и самый смелый прогноз'
  return {
    title,
    description,
    openGraph: mergeOpenGraph({ title, description, url: `/recap/${season}` }),
  }
}
