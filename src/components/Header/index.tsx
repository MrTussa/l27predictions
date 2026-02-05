'use client'
import Link from 'next/link'
import { Suspense } from 'react'
import './index.css'

import { MobileMenu } from './MobileMenu'
import { UserMenu } from './UserMenu'

import { LogoIcon } from '@/components/icons/logo'
import { cn } from '@/utilities/cn'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { label: 'Прогнозы', href: '/predictions' },
  { label: 'События', href: '/events' },
  { label: 'Таблица лидеров', href: '/leaderboard' },
]

export function Header() {
  const pathname = usePathname()

  return (
    <div className="relative z-20 border-b bg-background">
      <nav className="flex items-center justify-between container">
        <div className="block flex-none md:hidden">
          <Suspense fallback={null}>
            <MobileMenu menu={NAV_ITEMS} />
          </Suspense>
        </div>
        <div className="flex w-full items-center justify-between">
          <div className="flex w-full gap-6 items-center">
            <Link className="flex w-full items-center justify-center pt-4 pb-4 md:w-auto" href="/">
              <LogoIcon className="w-6 h-auto" />
            </Link>
            <ul className=" hidden gap-4 text-sm md:flex md:items-center">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'relative p-0 pt-2 pb-6 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors navLink',
                      {
                        active: pathname.startsWith(item.href),
                        'text-accent': pathname.startsWith(item.href),
                      },
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end md:w-1/3 gap-4 py-4">
            <Suspense fallback={null}>
              <UserMenu />
            </Suspense>
          </div>
        </div>
      </nav>
    </div>
  )
}
