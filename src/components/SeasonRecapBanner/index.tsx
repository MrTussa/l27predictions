import { isAdmin } from '@/access'
import { Card } from '@/components/ui/card'
import type { User } from '@/payload-types'
import { cn } from '@/utilities/cn'
import { getUserSeasonStats } from '@/utilities/queries'
import { getRecapSeasonProgress } from '@/utilities/seasonRecap/getSeasonRecap'
import { IconChevronRight, IconSparkles } from '@tabler/icons-react'
import Link from 'next/link'

type Props = {
  userId: string
  viewer: User | null
  /** Показывать админам до финала сезона как предпросмотр */
  previewForAdmins?: boolean
  className?: string
}

/** Ссылка на итоги сезона: для всех — после финальной гонки, для админов — раньше */
export async function SeasonRecapBanner({
  userId,
  viewer,
  previewForAdmins = true,
  className,
}: Props) {
  const progress = await getRecapSeasonProgress()
  if (progress.completed === 0) return null

  const isPreview = !progress.isComplete
  if (isPreview && !(previewForAdmins && isAdmin(viewer))) return null

  const stats = await getUserSeasonStats(userId, progress.season, 0)
  if (!stats?.predictionsCount) return null

  return (
    <Link
      href={`/user/${userId}/recap/${progress.season}`}
      prefetch={false}
      className={cn('group block', className)}
    >
      <Card variant="yellow-glow" corners="cut-corner-sm" className="p-0.5">
        <div className="flex items-center gap-4 px-4 py-3">
          <IconSparkles className="size-7 shrink-0 text-accent" />
          <div className="min-w-0 flex-1">
            <div className="font-black uppercase tracking-wide">
              {viewer?.id === userId ? 'Твои итоги' : 'Итоги'} сезона {progress.season}
              {isPreview && (
                <span className="ml-2 font-mono text-[10px] font-bold text-muted-foreground">
                  предпросмотр
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Прозвище, любимый пилот и суперлицензия — нейросеть уже всё посчитала
            </div>
          </div>
          <IconChevronRight className="size-5 shrink-0 text-accent transition-transform group-hover:translate-x-1" />
        </div>
      </Card>
    </Link>
  )
}
