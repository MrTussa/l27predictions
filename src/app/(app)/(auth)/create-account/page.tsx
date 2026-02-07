import type { Metadata } from 'next'

import { RenderParams } from '@/components/RenderParams'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'

import { CreateAccountForm } from '@/components/forms/CreateAccountForm'
import { redirect } from 'next/navigation'

export default async function CreateAccount() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (user) {
    redirect(`/account?warning=${encodeURIComponent('You are already logged in.')}`)
  }

  return (
    <div className="container px-4 md:px-16 py-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Регистрация</h1>
      <p className="text-muted-foreground mb-8">
        Присоединяйтесь к чемпионату L27 по прогнозам Формулы 1
      </p>
      <RenderParams />
      <CreateAccountForm />
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Создайте аккаунт для участия в чемпионате по прогнозам Формулы 1',
  openGraph: mergeOpenGraph({
    title: 'Регистрация - L27 F1 Predictions',
    url: '/create-account',
  }),
  title: 'Регистрация',
}
