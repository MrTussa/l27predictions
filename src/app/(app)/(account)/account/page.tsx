import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { headers as getHeaders } from 'next/headers.js'
import configPromise from '@payload-config'
import { AccountForm } from '@/components/forms/AccountForm'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'

export default async function AccountPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect(
      `/login?warning=${encodeURIComponent('Please login to access your account settings.')}`,
    )
  }

  return (
    <>
      <div className="border p-8 rounded-lg bg-primary-foreground">
        <h1 className="text-3xl font-medium mb-8">Настройки аккаунта</h1>
        <AccountForm />
      </div>

      <div className="border p-8 rounded-lg bg-primary-foreground">
        <h2 className="text-3xl font-medium mb-8">Мои прогнозы</h2>
        <div className="prose dark:prose-invert mb-8">
          <p>Здесь будет отображаться история ваших прогнозов на гонки Формулы 1.</p>
        </div>
      </div>
    </>
  )
}

export const metadata: Metadata = {
  description: 'Create an account or log in to your existing account.',
  openGraph: mergeOpenGraph({
    title: 'Account',
    url: '/account',
  }),
  title: 'Account',
}
