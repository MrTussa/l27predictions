import { UserStats } from '@/components/UserStats'
import { getServerSideUser } from '@/utilities/getServerSideUser'
import { getTimezone } from '@/utilities/getTimezone'
import { getProfileData } from '@/utilities/queries'

export async function AccountStats() {
  const [{ user }, timeZone] = await Promise.all([getServerSideUser(), getTimezone()])

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
      timeZone={timeZone}
    />
  )
}
