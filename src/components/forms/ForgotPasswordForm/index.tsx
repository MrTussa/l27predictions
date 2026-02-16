'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { Fragment, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  email: string
}

export const ForgotPasswordForm: React.FC = () => {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<FormData>()

  const onSubmit = useCallback(async (data: FormData) => {
    setLoading(true)

    const response = await fetch('/api/users/forgot-password', {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    if (response.ok) {
      setLoading(false)
      setSuccess(true)
      setError('')
    } else {
      setLoading(false)
      setError(
        'Произошла ошибка при отправке запроса на сброс пароля. Пожалуйста, повторите попытку.',
      )
    }
  }, [])

  return (
    <Fragment>
      {!success && (
        <React.Fragment>
          <h1 className="text-xl mb-4">Забыли пароль</h1>
          <div className="prose dark:prose-invert mb-8">
            <p>Пожалуйства введите почтовый адрес. Вы получите инструкцию по сбросу пароля</p>
          </div>
          <form className="max-w-lg" onSubmit={handleSubmit(onSubmit)}>
            <Message className="mb-8" error={error} />

            <FormItem className="mb-8">
              <Label htmlFor="email" className="mb-2">
                Почта
              </Label>
              <Input
                id="email"
                {...register('email', { required: 'Please provide your email.' })}
                type="email"
              />
              {errors.email && <FormError message={errors.email.message} />}
            </FormItem>

            <Button type="submit" variant={loading ? 'loading' : 'default'}>
              {loading ? 'Отправка' : 'Подтвердить'}
            </Button>
          </form>
        </React.Fragment>
      )}
      {success && (
        <React.Fragment>
          <h1 className="text-xl mb-4">Заявка отправлена</h1>
          <div className="prose dark:prose-invert">
            <p>Скоро на вашу почту придет инструкция по сбросу вашего пароля</p>
          </div>
        </React.Fragment>
      )}
    </Fragment>
  )
}
