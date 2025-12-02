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
import React, { useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  email: string
  password: string
}

export const LoginForm: React.FC = () => {
  const searchParams = useSearchParams()
  const allParams = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const redirect = useRef(searchParams.get('redirect'))
  const { login } = useAuth()
  const router = useRouter()
  const [error, setError] = React.useState<null | string>(null)

  const {
    formState: { errors, isLoading },
    handleSubmit,
    register,
  } = useForm<FormData>()

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        await login(data)
        if (redirect?.current) router.push(redirect.current)
        else router.push('/account')
      } catch (_) {
        setError('Неверный email или пароль. Попробуйте еще раз.')
      }
    },
    [login, router],
  )

  return (
    <form className="max-w-lg" onSubmit={handleSubmit(onSubmit)}>
      <Message className="classes.message" error={error} />
      <div className="flex flex-col gap-8 mb-8">
        <FormItem>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            {...register('email', { required: 'Email обязателен.' })}
          />
          {errors.email && <FormError message={errors.email.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="password">Пароль</Label>
          <Input
            id="password"
            type="password"
            {...register('password', { required: 'Введите пароль.' })}
          />
          {errors.password && <FormError message={errors.password.message} />}
        </FormItem>

        <div className="text-muted-foreground prose prose-a:hover:text-primary dark:prose-invert">
          <p className="text-sm">
            Забыли пароль?{' '}
            <Link href={`/forgot-password${allParams}`}>Восстановить</Link>
          </p>
        </div>
      </div>

      <div className="flex gap-4 flex-col sm:flex-row">
        <Button asChild variant="outline" size="lg" className="flex-1">
          <Link href={`/create-account${allParams}`}>Создать аккаунт</Link>
        </Button>
        <Button className="flex-1" disabled={isLoading} size="lg" type="submit" variant="default">
          {isLoading ? 'Вход...' : 'Войти'}
        </Button>
      </div>
    </form>
  )
}
