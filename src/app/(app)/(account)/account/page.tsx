import { AccountForm } from '@/components/forms/AccountForm'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AccountStats } from './AccountStats'

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const params = await searchParams
  const activeTab = params.tab || 'stats'

  return (
    <div>
      {activeTab === 'stats' && (
        <Suspense fallback={<TabSkeleton />}>
          <AccountStats />
        </Suspense>
      )}

      {activeTab === 'settings' && (
        <Suspense fallback={<TabSkeleton />}>
          <AccountForm />
        </Suspense>
      )}
    </div>
  )
}

function TabSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-muted animate-pulse rounded" />
      <div className="h-64 bg-muted animate-pulse rounded" />
      <div className="h-32 bg-muted animate-pulse rounded" />
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Управление аккаунтом и статистика',
  openGraph: mergeOpenGraph({
    title: 'Личный кабинет',
    url: '/account',
  }),
  title: 'Личный кабинет',
}

export const dynamic = 'force-dynamic'
