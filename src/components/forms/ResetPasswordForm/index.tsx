'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { Fragment, useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  password: string
  confirmPassword: string
}

export const ResetPasswordForm: React.FC = () => {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { resetPassword } = useAuth()

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<FormData>()

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
    }
  }, [searchParams])

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (!token) return

      try {
        await resetPassword({
          password: data.password,
          passwordConfirm: data.confirmPassword,
          token,
        })
        setSuccess(true)
        setError('')
        setTimeout(() => router.push('/'), 1500)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Произошла ошибка при сбросе пароля. Возможно, ссылка устарела.',
        )
      }
    },
    [token, resetPassword, router],
  )

  if (!token) {
    return (
      <Fragment>
        <h1 className="text-xl mb-4">Ошибка</h1>
        <Message className="mb-8" error="Невалидная ссылка для восстановления пароля" />
        <Link href="/forgot-password">
          <Button variant="outline">Запросить новую ссылку</Button>
        </Link>
      </Fragment>
    )
  }

  if (success) {
    return (
      <Fragment>
        <h1 className="text-xl mb-4">Пароль изменен</h1>
        <Message className="mb-4" success="Пароль успешно изменен. Перенаправляем..." />
      </Fragment>
    )
  }

  return (
    <Fragment>
      <h1 className="text-xl mb-4">Установить новый пароль</h1>
      <div className="prose dark:prose-invert mb-8">
        <p>Создайте надежный пароль для вашего аккаунта</p>
      </div>

      <form className="max-w-lg" onSubmit={handleSubmit(onSubmit)}>
        <Message className="mb-8" error={error} />

        <FormItem className="mb-4">
          <Label htmlFor="password">Новый пароль</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register('password', {
              required: 'Пароль обязателен',
              minLength: { value: 6, message: 'Минимум 6 символов' },
              pattern: { value: /(?=.*[a-z])/, message: 'Минимум одна строчная буква' },
            })}
          />
          {errors.password && <FormError message={errors.password.message} />}
        </FormItem>

        <FormItem className="mb-8">
          <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword', {
              required: 'Подтвердите пароль',
              validate: (value, formValues) =>
                value === formValues.password || 'Пароли не совпадают',
            })}
          />
          {errors.confirmPassword && <FormError message={errors.confirmPassword.message} />}
        </FormItem>

        <Button type="submit" variant="default" disabled={isSubmitting}>
          {isSubmitting ? 'Установка пароля...' : 'Установить пароль'}
        </Button>
      </form>
    </Fragment>
  )
}
