import type { Metadata } from 'next'

import { ResetPasswordForm } from '@/components/forms/ResetPasswordForm'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

export default async function ResetPasswordPage() {
  return (
    <div className="container px-4 md:px-16 py-6">
      <ResetPasswordForm />
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Установите новый пароль для вашего аккаунта.',
  openGraph: mergeOpenGraph({
    title: 'Сброс пароля',
    url: '/reset-password',
  }),
  title: 'Сброс пароля',
}
