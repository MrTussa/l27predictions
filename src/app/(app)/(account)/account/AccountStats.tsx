import { UserStats } from '@/components/UserStats'
import { getServerSideUser } from '@/utilities/getServerSideUser'
import { getProfileData } from '@/utilities/queries'

export async function AccountStats() {
  const { user } = await getServerSideUser()

  if (!user) {
    return <div>Не авторизован</div>
  }

  const data = await getProfileData(user.id)

  return (
    <UserStats
      user={{
        id: user.id,
        nickname: user.nickname,
        chartColor: user.chartColor,
        telegramUsername: user.telegramUsername ?? null,
      }}
      data={data}
      isOwnProfile={true}
    />
  )
}
