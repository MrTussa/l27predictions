import type { Metadata } from 'next'

import { RenderParams } from '@/components/RenderParams'

import { LoginForm } from '@/components/forms/LoginForm'
import { getServerSideUser } from '@/utilities/getServerSideUser'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { safeRedirect } from '@/utilities/safeRedirect'
import { redirect } from 'next/navigation'

type Props = { searchParams: Promise<{ redirect?: string }> }

export default async function Login({ searchParams }: Props) {
  const [{ user }, params] = await Promise.all([getServerSideUser(), searchParams])

  if (user) {
    redirect(
      safeRedirect(params.redirect, `/account?warning=${encodeURIComponent('Вы уже авторизованы.')}`),
    )
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
