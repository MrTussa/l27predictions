import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import { ForgotPasswordForm } from '@/components/forms/ForgotPasswordForm'

export default async function ForgotPasswordPage() {
  return (
    <div className="container py-16">
      <ForgotPasswordForm />
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Введите почту для сброса пароля.',
  openGraph: mergeOpenGraph({
    title: 'Забыли пароль',
    url: '/forgot-password',
  }),
  title: 'Забыли пароль',
}
