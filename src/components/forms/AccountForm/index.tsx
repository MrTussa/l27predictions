'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User } from '@/payload-types'
import { useAuth } from '@/providers/Auth'
import { useRouter } from 'next/navigation'
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type FormData = {
  nickname: string
  email: string
  name: User['name']
  chartColor: string
  telegramUsername?: string
  password: string
  passwordConfirm: string
}

export const AccountForm: React.FC = () => {
  const { setUser, user } = useAuth()
  const [changePassword, setChangePassword] = useState(false)

  const {
    formState: { errors, isLoading, isSubmitting, isDirty },
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
  } = useForm<FormData>()

  const password = useRef({})
  password.current = watch('password', '')
  const chartColor = watch('chartColor', '#FFDF2C')

  const router = useRouter()

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (user) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/${user.id}`, {
          // Make sure to include cookies with fetch
          body: JSON.stringify(data),
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'PATCH',
        })

        if (response.ok) {
          const json = await response.json()
          setUser(json.doc)
          toast.success('Настройки аккаунта обновлены.')
          setChangePassword(false)
          reset({
            nickname: json.doc.nickname,
            name: json.doc.name,
            email: json.doc.email,
            chartColor: json.doc.chartColor,
            telegramUsername: json.doc.telegramUsername,
            password: '',
            passwordConfirm: '',
          })
        } else {
          toast.error('Ошибка при обновлении настроек.')
        }
      }
    },
    [user, setUser, reset],
  )

  useEffect(() => {
    if (user === null) {
      router.push(
        `/login?error=${encodeURIComponent(
          'You must be logged in to view this page.',
        )}&redirect=${encodeURIComponent('/account')}`,
      )
    }

    // Once user is loaded, reset form to have default values
    if (user) {
      reset({
        nickname: user.nickname || '',
        name: user.name,
        email: user.email,
        chartColor: user.chartColor || '#FFDF2C',
        telegramUsername: user.telegramUsername || '',
        password: '',
        passwordConfirm: '',
      })
    }
  }, [user, router, reset, changePassword])

  return (
    <form className="max-w-xl" onSubmit={handleSubmit(onSubmit)}>
      {!changePassword ? (
        <Fragment>
          <div className="prose dark:prose-invert mb-8">
            <p className="">
              {'Измените настройки аккаунта ниже, или '}
              <Button
                className="px-0 text-inherit underline hover:cursor-pointer"
                onClick={() => setChangePassword(!changePassword)}
                type="button"
                variant="link"
              >
                нажмите здесь
              </Button>
              {', чтобы изменить пароль.'}
            </p>
          </div>

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
              <Label htmlFor="name" className="mb-2">
                Полное имя (опционально)
              </Label>
              <Input id="name" {...register('name')} type="text" />
              {errors.name && <FormError message={errors.name.message} />}
            </FormItem>
          </div>
        </Fragment>
      ) : (
        <Fragment>
          <div className="prose dark:prose-invert mb-8">
            <p>
              {'Измените пароль ниже, или '}
              <Button
                className="px-0 text-inherit underline hover:cursor-pointer"
                onClick={() => setChangePassword(!changePassword)}
                type="button"
                variant="link"
              >
                отменить
              </Button>
              .
            </p>
          </div>

          <div className="flex flex-col gap-8 mb-8">
            <FormItem>
              <Label htmlFor="password" className="mb-2">
                Новый пароль
              </Label>
              <Input
                id="password"
                {...register('password', { required: 'Введите новый пароль.' })}
                type="password"
              />
              {errors.password && <FormError message={errors.password.message} />}
            </FormItem>

            <FormItem>
              <Label htmlFor="passwordConfirm" className="mb-2">
                Подтверждение пароля
              </Label>
              <Input
                id="passwordConfirm"
                {...register('passwordConfirm', {
                  required: 'Подтвердите новый пароль.',
                  validate: (value) => value === password.current || 'Пароли не совпадают',
                })}
                type="password"
              />
              {errors.passwordConfirm && <FormError message={errors.passwordConfirm.message} />}
            </FormItem>
          </div>
        </Fragment>
      )}
      <Button disabled={isLoading || isSubmitting || !isDirty} type="submit" variant="default">
        {isLoading || isSubmitting
          ? 'Обновление...'
          : changePassword
            ? 'Изменить пароль'
            : 'Обновить настройки'}
      </Button>
    </form>
  )
}
