import type { Metadata } from 'next'

import { RenderParams } from '@/components/RenderParams'
import React from 'react'

import { headers as getHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { LoginForm } from '@/components/forms/LoginForm'
import { redirect } from 'next/navigation'

export default async function Login() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (user) {
    redirect(`/account?warning=${encodeURIComponent('You are already logged in.')}`)
  }

  return (
    <div className="container py-16 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Вход</h1>
      <p className="text-muted-foreground mb-8">
        Войдите в свой аккаунт для участия в чемпионате
      </p>
      <RenderParams />
      <LoginForm />
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Войдите в свой аккаунт для участия в чемпионате по прогнозам Формулы 1',
  openGraph: {
    title: 'Вход - L27 F1 Predictions',
    url: '/login',
  },
  title: 'Вход',
}
