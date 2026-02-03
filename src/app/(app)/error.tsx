'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function Error({ reset }: { reset: () => void }) {
  return (
    <Card className="mx-auto my-4 flex max-w-xl flex-col">
      <CardHeader className="text-xl font-bold text-center pt-4">О нет!</CardHeader>
      <CardContent className="flex items-center flex-col pb-4">
        <p className="my-2">Возникла проблема. Пожалуйста попытайтесь снова.</p>
        <Button variant={'default'} onClick={() => reset()} type="button">
          попробовать снова
        </Button>
      </CardContent>
    </Card>
  )
}
