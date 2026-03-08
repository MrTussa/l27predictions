import { UserStats } from '@/components/UserStats'
import { getServerSideUser } from '@/utilities/getServerSideUser'
import { getTimezone } from '@/utilities/getTimezone'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getProfileData, getUserPublicProfile } from '@/utilities/queries'
import { IconBrandTelegram, IconCoins } from '@tabler/icons-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
}

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params

  const [publicUser, profileData, currentAuth, timeZone] = await Promise.all([
    getUserPublicProfile(id),
    getProfileData(id),
    getServerSideUser(),
    getTimezone(),
  ])

  if (!publicUser) {
    notFound()
  }

  const isOwnProfile = currentAuth.user?.id === id

  const telegram = publicUser.telegramUsername?.replaceAll(/@/g, '')

  return (
    <div className="container px-4 md:px-16 py-6">
      <div className="max-w-6xl mx-auto space-y-2">
        <div className="flex justify-between">
          <h1 className="text-4xl font-bold uppercase tracking-tight mb-2">
            {publicUser.nickname}
          </h1>
          <span className="flex items-center text-xl text-accent">
            <IconCoins />
            {publicUser.pitCoins ? publicUser.pitCoins : 0}
          </span>
        </div>

        <div className="flex flex-col w-fit">
          {telegram && (
            <span className="flex items-center gap-2">
              <IconBrandTelegram className="text-muted-foreground" />
              <a className="text-xl text-muted-foreground" href={`https://t.me/${telegram}`}>
                {publicUser.telegramUsername}
              </a>
            </span>
          )}
          {publicUser.name && (
            <span className="text-xl text-muted-foreground">{publicUser.name}</span>
          )}
        </div>
        <UserStats
          user={publicUser}
          data={profileData}
          isOwnProfile={isOwnProfile}
          timeZone={timeZone}
        />
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  try {
    const user = await getUserPublicProfile(id)
    if (!user) {
      return { title: 'Пользователь не найден' }
    }
    return {
      title: `${user.nickname} — Профиль`,
      description: `Статистика прогнозов ${user.nickname} в чемпионате Формулы 1`,
      openGraph: mergeOpenGraph({
        title: `${user.nickname} — Профиль`,
        url: `/user/${id}`,
      }),
    }
  } catch {
    return { title: 'Профиль пользователя' }
  }
}
