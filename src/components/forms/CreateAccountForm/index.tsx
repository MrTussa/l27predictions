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
import React, { useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  nickname: string
  email: string
  password: string
  passwordConfirm: string
  chartColor: string
  telegramUsername?: string
}

export const CreateAccountForm: React.FC = () => {
  const searchParams = useSearchParams()
  const allParams = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const { login } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const {
    formState: { errors },
    handleSubmit,
    register,
    watch,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      chartColor: '#FFDF2C',
    },
  })

  const password = useRef({})
  password.current = watch('password', '')
  const chartColor = watch('chartColor', '#FFDF2C')

  const onSubmit = useCallback(
    async (data: FormData) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users`, {
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      if (!response.ok) {
        const message = response.statusText || 'There was an error creating the account.'
        setError(message)
        return
      }

      const redirect = searchParams.get('redirect')

      const timer = setTimeout(() => {
        setLoading(true)
      }, 1000)

      try {
        await login(data)
        clearTimeout(timer)
        if (redirect) router.push(redirect)
        else router.push(`/account?success=${encodeURIComponent('Account created successfully')}`)
      } catch (_) {
        clearTimeout(timer)
        setError('There was an error with the credentials provided. Please try again.')
      }
    },
    [login, router, searchParams],
  )

  return (
    <form className="max-w-lg py-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="prose dark:prose-invert mb-6">
        <p>
          Создайте аккаунт для участия в чемпионате по прогнозам Формулы 1. После регистрации вы
          сможете делать прогнозы на гонки и соревноваться с другими участниками.
        </p>
      </div>

      <Message error={error} />

      <div className="flex flex-col gap-8 mb-8">
        <FormItem>
          <Label htmlFor="nickname" className="mb-2">
            Никнейм *
          </Label>
          <Input
            id="nickname"
            {...register('nickname', {
              required: 'Никнейм обязателен.',
              minLength: { value: 3, message: 'Минимум 3 символа' },
              maxLength: { value: 20, message: 'Максимум 20 символов' },
              pattern: {
                value: /^[a-zA-Z0-9_а-яА-ЯёЁ]+$/,
                message: 'Только буквы, цифры и подчеркивание',
              },
            })}
            type="text"
            placeholder="Ваш уникальный никнейм"
          />
          {errors.nickname && <FormError message={errors.nickname.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="email" className="mb-2">
            Email *
          </Label>
          <Input
            id="email"
            {...register('email', { required: 'Email обязателен.' })}
            type="email"
            placeholder="your@email.com"
          />
          {errors.email && <FormError message={errors.email.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="chartColor" className="mb-2">
            Цвет для графиков *
          </Label>
          <div className="flex gap-3 items-center">
            <Input
              id="chartColor"
              {...register('chartColor', {
                required: 'Цвет обязателен.',
                pattern: {
                  value: /^#[0-9A-F]{6}$/i,
                  message: 'Неверный формат (используйте #RRGGBB)',
                },
              })}
              type="color"
              className="w-20 h-10 p-1 cursor-pointer"
            />
            <Input
              value={chartColor}
              onChange={(e) => setValue('chartColor', e.target.value)}
              type="text"
              placeholder="#FFDF2C"
              className="flex-1"
              maxLength={7}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Этот цвет будет использоваться для отображения ваших результатов в графиках
          </p>
          {errors.chartColor && <FormError message={errors.chartColor.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="telegramUsername" className="mb-2">
            Telegram Username (опционально)
          </Label>
          <Input
            id="telegramUsername"
            {...register('telegramUsername', {
              pattern: {
                value: /^@?[a-zA-Z0-9_]{5,32}$/,
                message: 'Неверный формат Telegram username',
              },
            })}
            type="text"
            placeholder="@username"
          />
          {errors.telegramUsername && <FormError message={errors.telegramUsername.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="password" className="mb-2">
            Пароль *
          </Label>
          <Input
            id="password"
            {...register('password', { required: 'Пароль обязателен.' })}
            type="password"
          />
          {errors.password && <FormError message={errors.password.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="passwordConfirm" className="mb-2">
            Подтверждение пароля *
          </Label>
          <Input
            id="passwordConfirm"
            {...register('passwordConfirm', {
              required: 'Подтвердите пароль.',
              validate: (value) => value === password.current || 'Пароли не совпадают',
            })}
            type="password"
          />
          {errors.passwordConfirm && <FormError message={errors.passwordConfirm.message} />}
        </FormItem>
      </div>
      <Button disabled={loading} type="submit" variant="default" className="w-full">
        {loading ? 'Создаем аккаунт...' : 'Создать аккаунт'}
      </Button>

      <div className="prose dark:prose-invert mt-8">
        <p>
          {'Уже есть аккаунт? '}
          <Link href={`/login${allParams}`}>Войти</Link>
        </p>
      </div>
    </form>
  )
}
