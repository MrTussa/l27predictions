import { UserStats } from '@/components/UserStats'
import { getServerSideUser } from '@/utilities/getServerSideUser'
import { getTimezone } from '@/utilities/getTimezone'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getProfileData, getUserPublicProfile } from '@/utilities/queries'
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

  return (
    <div className="container px-4 md:px-16 py-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-6">{publicUser.nickname}</h1>
        <UserStats user={publicUser} data={profileData} isOwnProfile={isOwnProfile} timeZone={timeZone} />
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
