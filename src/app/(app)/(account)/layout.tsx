import type { ReactNode } from 'react'

import { AccountNav } from '@/components/AccountNav'
import { RenderParams } from '@/components/RenderParams'
import { getServerSideUser } from '@/utilities/getServerSideUser'
import { IconBrandTelegram } from '@tabler/icons-react'
import { redirect } from 'next/navigation'

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const { user } = await getServerSideUser()

  if (!user) {
    redirect(`/login?warning=${encodeURIComponent('Войдите, чтобы получить доступ к аккаунту')}`)
  }

  const telegram = user.telegramUsername?.replaceAll(/@/g, '')

  return (
    <div className="container px-4 md:px-16 py-6 sm">
      <div className="max-w-6xl mx-auto">
        <RenderParams />

        <h1 className="text-4xl font-bold uppercase tracking-tight mb-2">
          {user.nickname || user.email}
        </h1>

        <div className="flex flex-col w-fit mb-2">
          {telegram && (
            <span className="flex items-center gap-2">
              <IconBrandTelegram className="text-muted-foreground" />
              <a className="text-xl text-muted-foreground" href={`https://t.me/${telegram}`}>
                {user.telegramUsername}
              </a>
            </span>
          )}
          {user.name && <span className="text-xl text-muted-foreground">{user.name}</span>}
        </div>

        <div className="flex flex-col gap-6">
          <nav>
            <AccountNav className="flex w-full flex-row justify-between overflow-y-auto custom-scrollbar" />
          </nav>

          <main>{children}</main>
        </div>
      </div>
    </div>
  )
}
