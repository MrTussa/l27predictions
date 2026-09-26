import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container py-28">
      <div className="prose dark:prose-invert max-w-none">
        <h1 style={{ marginBottom: 0 }}>404</h1>
        <p className="mb-4">Такой страницы нет — возможно, она была удалена или ссылка неверная.</p>
      </div>
      <Button asChild variant="default">
        <Link href="/">На главную</Link>
      </Button>
    </div>
  )
}
