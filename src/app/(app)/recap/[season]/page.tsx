import { isAdmin } from '@/access'
import { Card } from '@/components/ui/card'
import { getServerSideUser } from '@/utilities/getServerSideUser'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getSavedCommunityTexts } from '@/utilities/seasonRecap/getRecapTexts'
import { getCommunityRecap, parseSeason } from '@/utilities/seasonRecap/getSeasonRecap'
import { IconFlag, IconHourglass } from '@tabler/icons-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
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
      <Notice
        icon={<IconHourglass className="size-12 text-accent" />}
        title={`Итоги сезона ${season}`}
      >
        Номинации сезона откроются после финальной гонки: прошло {recap.racesCompleted} из{' '}
        {recap.racesTotal}.
      </Notice>
    )
  }

  // Тексты пишет скрипт заранее; без них итоги не показываем вовсе
  const texts = await getSavedCommunityTexts(recap)
  if (!texts) {
    return (
      <Notice
        icon={<IconFlag className="size-12 text-accent" />}
        title="Итоги сезона на разогревочном круге"
      >
        Приходи позже.
      </Notice>
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
      <CommunityView recap={recap} texts={texts} viewerId={viewer?.id ?? null} />
    </div>
  )
}

function Notice({
  icon,
  title,
  children,
}: {
  icon: ReactNode
  title: string
  children: ReactNode
}) {
  return (
    <div className="px-4 py-12 md:px-16">
      <Card variant="gray" corners="cut-corner" className="mx-auto max-w-xl">
        <div className="flex flex-col items-center gap-4 px-6 py-4 text-center">
          {icon}
          <h1 className="text-2xl font-black uppercase tracking-wide">{title}</h1>
          <p className="text-muted-foreground">{children}</p>
        </div>
      </Card>
    </div>
  )
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
