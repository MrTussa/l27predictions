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
  { label: 'Трансляция', href: '/broadcast' },
  { label: 'СОХРАНИТЬ ДАННЫЕ!', href: '/save-data' },
]

interface HeaderProps {
  isLive?: boolean
  unvotedEventsCount?: number
}

export function Header({ isLive, unvotedEventsCount }: HeaderProps) {
  const pathname = usePathname()

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    badge: item.href === '/events' && unvotedEventsCount ? unvotedEventsCount : undefined,
    isLive: item.href === '/broadcast' ? isLive : undefined,
  }))

  return (
    <div className="relative z-20 border-b bg-background">
      <nav className="flex items-center justify-between container">
        <div className="block flex-none md:hidden">
          <Suspense fallback={null}>
            <MobileMenu menu={navItems} />
          </Suspense>
        </div>
        <div className="flex w-full items-center justify-between">
          <div className="flex w-full gap-6 items-center">
            <Link className="flex w-full items-center justify-center pt-4 pb-4 md:w-auto" href="/">
              <LogoIcon />
            </Link>
            <ul className=" hidden gap-4 text-sm md:flex md:items-center">
              {navItems.map((item) => (
                <li key={item.href} className="relative">
                  <Link
                    href={item.href}
                    className={cn(
                      'relative p-0 pt-2 pb-6 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors navLink',
                      {
                        active: pathname.startsWith(item.href),
                        'text-accent': pathname.startsWith(item.href),
                        'text-green-500 animate-pulse hover:animate-none hover:text-green-400':
                          !!item.isLive && !pathname.startsWith(item.href),
                        'text-red-700 animate-pulse hover:animate-none': item.href === '/save-data',
                      },
                    )}
                  >
                    {item.label}
                  </Link>
                  {item.badge ? (
                    <span className="absolute -top-1 -right-2 h-3 min-w-3 rounded-full bg-accent text-[10px] font-bold text-background outline-background outline-1 flex items-center justify-center px-0.5">
                      {item.badge}
                    </span>
                  ) : null}
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
