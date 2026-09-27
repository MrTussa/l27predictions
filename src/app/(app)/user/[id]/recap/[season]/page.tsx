import { isAdmin } from '@/access'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getServerSideUser } from '@/utilities/getServerSideUser'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { plural } from '@/utilities/plural'
import { getUserPublicProfile } from '@/utilities/queries'
import { getSavedRecapTexts } from '@/utilities/seasonRecap/getRecapTexts'
import { getSeasonRecap, parseSeason } from '@/utilities/seasonRecap/getSeasonRecap'
import type { SeasonRecap } from '@/utilities/seasonRecap/types'
import {
  IconBrandTelegram,
  IconChevronLeft,
  IconDownload,
  IconFlag,
  IconHourglass,
  IconMoodEmpty,
} from '@tabler/icons-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { RecapDashboard } from './_components/RecapDashboard'

type Props = {
  params: Promise<{ id: string; season: string }>
}

export default async function SeasonRecapPage({ params }: Props) {
  const { id, season: seasonParam } = await params
  const season = parseSeason(seasonParam)
  if (!season) notFound()

  const [recap, { user: viewer }] = await Promise.all([
    getSeasonRecap(id, season),
    getServerSideUser(),
  ])
  if (!recap || recap.racesTotal === 0) notFound()

  // До финальной гонки итоги видят только админы — для проверки
  const isPreview = !recap.isSeasonComplete
  if (isPreview && !isAdmin(viewer)) return <RecapLocked recap={recap} />
  if (recap.predictions === 0) return <RecapEmpty recap={recap} />

  // Тексты пишет скрипт заранее; без них итоги не показываем вовсе
  const texts = await getSavedRecapTexts(recap)
  if (!texts) return <RecapWarmup recap={recap} isOwner={viewer?.id === recap.user.id} />

  return (
    <div className="mx-auto max-w-450 space-y-6 px-4 py-6 md:px-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/user/${recap.user.id}`}
          className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-accent"
        >
          <IconChevronLeft className="size-4" />
          Профиль
        </Link>
        <Link
          href={`/recap/${recap.season}`}
          prefetch={false}
          className="font-mono text-xs uppercase tracking-widest text-accent transition-colors hover:text-foreground"
        >
          Номинации сезона →
        </Link>
        {isPreview && (
          <span className="border border-accent/50 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-accent">
            Предпросмотр для админов · откроется после финала ({recap.racesCompleted}/
            {recap.racesTotal})
          </span>
        )}
      </div>

      <RecapDashboard recap={recap} texts={texts} licence={<Licence recap={recap} />} />
    </div>
  )
}

function Licence({ recap }: { recap: SeasonRecap }) {
  const path = `/user/${recap.user.id}/recap/${recap.season}`
  // Версия в адресе сбрасывает кэш браузера, когда меняется статистика
  const imageUrl = `${path}/licence?v=${encodeURIComponent(recap.fingerprint)}`
  const pageUrl = `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}${path}`
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(`Мои итоги сезона ${recap.season} в L27`)}`

  return (
    <div className="grid items-center gap-6 border border-white/10 bg-[#15151E] p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* PNG уже собран сервером под нужный размер — next/image его только пережмёт */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={`Суперлицензия прогнозиста ${recap.user.nickname}`}
        width={1200}
        height={630}
        loading="lazy"
        className="h-auto w-full"
      />
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Карточка для чата. Она же появится в превью, если отправить ссылку на эту страницу в
          Telegram.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <Button asChild>
            <a href={imageUrl} download={`l27-superlicense-${recap.season}.png`}>
              <IconDownload />
              Скачать PNG
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={shareUrl} target="_blank" rel="noopener noreferrer">
              <IconBrandTelegram />
              Поделиться
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}

function RecapNotice({
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
          {children}
        </div>
      </Card>
    </div>
  )
}

function RecapLocked({ recap }: { recap: SeasonRecap }) {
  const left = recap.racesTotal - recap.racesCompleted
  const progress = Math.round((recap.racesCompleted / recap.racesTotal) * 100)

  return (
    <RecapNotice
      icon={<IconHourglass className="size-12 text-accent" />}
      title={`Итоги сезона ${recap.season}`}
    >
      <p className="text-muted-foreground">
        Откроются после финальной гонки. Нейросеть уже точит шутки про прогнозы{' '}
        <b className="text-foreground">{recap.user.nickname}</b>.
      </p>
      <div className="w-full space-y-2">
        <div className="h-2 w-full bg-muted">
          <div className="h-full bg-accent" style={{ width: `${progress}%` }} />
        </div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Прошло {recap.racesCompleted} из {recap.racesTotal} · осталось {left}{' '}
          {plural(left, ['гонка', 'гонки', 'гонок'])}
        </div>
      </div>
      <Button asChild variant="outline">
        <Link href="/predictions">К прогнозам</Link>
      </Button>
    </RecapNotice>
  )
}

function RecapWarmup({ recap, isOwner }: { recap: SeasonRecap; isOwner: boolean }) {
  return (
    <RecapNotice
      icon={<IconFlag className="size-12 text-accent" />}
      title={
        isOwner
          ? 'Твои итоги на разогревочном круге'
          : `Итоги ${recap.user.nickname} на разогревочном круге`
      }
    >
      <p className="text-muted-foreground">Приходи позже.</p>
      <Button asChild variant="outline">
        <Link href={`/recap/${recap.season}`}>Номинации сезона</Link>
      </Button>
    </RecapNotice>
  )
}

function RecapEmpty({ recap }: { recap: SeasonRecap }) {
  return (
    <RecapNotice
      icon={<IconMoodEmpty className="size-12 text-muted-foreground" />}
      title={`Итоги сезона ${recap.season}`}
    >
      <p className="text-muted-foreground">
        У <b className="text-foreground">{recap.user.nickname}</b> нет ни одного прогноза на
        завершённые гонки этого сезона — итоги подводить не из чего.
      </p>
      <Button asChild variant="outline">
        <Link href={`/user/${recap.user.id}`}>В профиль</Link>
      </Button>
    </RecapNotice>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, season: seasonParam } = await params
  const season = parseSeason(seasonParam)
  const user = season ? await getUserPublicProfile(id) : null
  if (!season || !user) return { title: 'Итоги сезона' }

  const path = `/user/${id}/recap/${season}`
  const title = `Итоги сезона ${season} — ${user.nickname}`
  const description = `Прозвище от нейросети, любимый пилот, главный предатель и суперлицензия ${user.nickname} в чемпионате прогнозов L27`
  return {
    title,
    description,
    openGraph: mergeOpenGraph({
      title,
      description,
      url: path,
      images: [
        { url: `${path}/licence`, width: 1200, height: 630, alt: `Суперлицензия ${user.nickname}` },
      ],
    }),
  }
}
