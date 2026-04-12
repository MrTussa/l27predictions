import type { Metadata } from 'next'

import { RenderParams } from '@/components/RenderParams'

import { LoginForm } from '@/components/forms/LoginForm'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

export default async function Login() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (user) {
    redirect(`/account?warning=${encodeURIComponent('Вы уже авторизованны.')}`)
  }

  return (
    <div className="container px-4 md:px-16 py-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Вход</h1>
      <p className="text-muted-foreground mb-8">Войдите в свой аккаунт для участия в чемпионате</p>
      <RenderParams />
      <LoginForm />
      <p className="text-xs text-muted-foreground mt-4">
        Нажимая кнопку «Войти», вы соглашаетесь с условиями{' '}
        <a className="text-foreground" href="/privacy_policy_limonov27.pdf">
          политики конфиденциальности
        </a>
        .
      </p>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'Вход',
  description: 'Войдите в свой аккаунт для участия в чемпионате по прогнозам Формулы 1',
  openGraph: mergeOpenGraph({ title: 'Вход', url: '/login' }),
}
