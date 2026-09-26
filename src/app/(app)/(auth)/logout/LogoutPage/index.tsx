'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/providers/Auth'
import Link from 'next/link'
import React, { Fragment, useEffect, useState } from 'react'

export const LogoutPage: React.FC = () => {
  const { logout } = useAuth()
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout()
        setSuccess('Вы вышли из аккаунта')
      } catch (_) {
        setError('Вы уже вышли из аккаунта')
      }
    }

    void performLogout()
  }, [logout])

  return (
    <Fragment>
      {(error || success) && (
        <div className="prose dark:prose-invert">
          <h1>{error || success}</h1>
          <div>
            <Button asChild variant={'default'}>
              <Link href="/login">Войти</Link>
            </Button>
            <Button asChild variant={'outline'}>
              <Link href="/">На главную</Link>
            </Button>
          </div>
        </div>
      )}
    </Fragment>
  )
}
