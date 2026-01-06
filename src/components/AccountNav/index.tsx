'use client'

import { Button } from '@/components/ui/button'
import clsx from 'clsx'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

type Props = {
  className?: string
}

export const AccountNav: React.FC<Props> = ({ className }) => {
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'stats'

  return (
    <div className={clsx(className)}>
      <ul className="flex flex-row gap-2">
        <li>
          <Button asChild variant="link">
            <Link
              href="/account?tab=stats"
              className={clsx('text-muted-foreground hover:text-accent hover:no-underline', {
                'text-primary': activeTab === 'stats',
              })}
            >
              Статистика
            </Link>
          </Button>
        </li>

        <li>
          <Button asChild variant="link">
            <Link
              href="/account?tab=settings"
              className={clsx('text-muted-foreground hover:text-accent hover:no-underline', {
                'text-primary': activeTab === 'settings',
              })}
            >
              Настройки
            </Link>
          </Button>
        </li>
      </ul>

      <Button
        asChild
        variant="link"
        className={clsx('text-muted-foreground hover:text-red-500 hover:no-underline')}
      >
        <Link href="/logout">Выйти</Link>
      </Button>
    </div>
  )
}
