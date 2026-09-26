import type { Metadata } from 'next'

import { RenderParams } from '@/components/RenderParams'
import { getServerSideUser } from '@/utilities/getServerSideUser'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import { CreateAccountForm } from '@/components/forms/CreateAccountForm'
import { redirect } from 'next/navigation'

export default async function CreateAccount() {
  const { user } = await getServerSideUser()

  if (user) {
    redirect(`/account?warning=${encodeURIComponent('Вы уже авторизованы.')}`)
  }

  return (
    <div className="container px-4 md:px-16 py-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Регистрация</h1>
      <p className="text-muted-foreground mb-8">
        Присоединяйтесь к чемпионату L27 по прогнозам Формулы 1
      </p>
      <RenderParams />
      <CreateAccountForm />
      <p className="text-xs text-muted-foreground mt-4">
        Нажимая кнопку «Создать аккаунт», вы соглашаетесь с условиями{' '}
        <a className="text-foreground" href="/privacy_policy_limonov27.pdf">
          политики конфиденциальности
        </a>
        .
      </p>
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
