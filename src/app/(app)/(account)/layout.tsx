import type { ReactNode } from 'react'

import { AccountNav } from '@/components/AccountNav'
import { RenderParams } from '@/components/RenderParams'
import { getServerSideUser } from '@/utilities/getServerSideUser'
import { redirect } from 'next/navigation'

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const { user } = await getServerSideUser()

  if (!user) {
    redirect(`/login?warning=${encodeURIComponent('Войдите, чтобы получить доступ к аккаунту')}`)
  }

  return (
    <div className="container mt-6">
      <div className="max-w-6xl mx-auto">
        <RenderParams />

        <h1 className="text-4xl font-bold uppercase tracking-tight mb-2">
          {user.nickname || user.email}
        </h1>

        <div className="flex flex-col gap-6">
          <nav>
            <AccountNav className="flex w-full flex-row justify-between" />
          </nav>

          <main>{children}</main>
        </div>
      </div>
    </div>
  )
}
