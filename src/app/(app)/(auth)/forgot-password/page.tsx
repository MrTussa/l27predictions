import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import { ForgotPasswordForm } from '@/components/forms/ForgotPasswordForm'

export default async function ForgotPasswordPage() {
  return (
    <div className="container px-4 md:px-16 py-6">
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
