'use client'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/providers/Auth'
import { cn } from '@/utilities/cn'
import { MenuIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface MenuItem {
  label: string
  href: string
  badge?: number
  isLive?: boolean
}

interface Props {
  menu: MenuItem[]
}

export function MobileMenu({ menu }: Props) {
  const { user, logout } = useAuth()

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname, searchParams])

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger className="relative flex h-11 w-11 items-center justify-center rounded-md border text-muted-foreground hover:text-accent transition-colors">
        <MenuIcon className="h-4" />
      </SheetTrigger>

      <SheetContent side="left" className="px-4">
        <SheetHeader className="px-0 pt-4 pb-0">
          <SheetTitle className="text-accent uppercase tracking-wide">F1 Прогнозы</SheetTitle>
          <SheetDescription />
        </SheetHeader>

        <div className="py-4">
          <ul className="flex w-full flex-col gap-2">
            {menu.map((item) => (
              <li key={item.href} className="relative">
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center py-2 text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors',
                    {
                      'text-green-500 hover:text-green-400': !!item.isLive,
                      'text-red-700 animate-pulse hover:animate-none': item.href === '/save-data',
                    },
                  )}
                >
                  {item.label}
                  {item.badge ? (
                    <span className="ml-2 inline-flex h-4 min-w-4 rounded-full bg-accent text-[10px] font-bold text-background items-center justify-center px-0.5">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {user ? (
          <div className="mt-4">
            <h2 className="text-lg mb-4 font-bold uppercase tracking-wide">Мой аккаунт</h2>
            <hr className="my-2 border-muted" />
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href="/account"
                  className="block py-2 text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  Управление аккаунтом
                </Link>
              </li>
              <li className="mt-6">
                <Button variant="destructive" className="w-full" onClick={() => logout()}>
                  Выйти
                </Button>
              </li>
            </ul>
          </div>
        ) : (
          <div>
            <h2 className="text-lg mb-4 font-bold uppercase tracking-wide">Мой аккаунт</h2>
            <div className="flex flex-col gap-2 mt-4">
              <Button asChild className="w-full" variant="outline">
                <Link href="/login">Вход</Link>
              </Button>
              <Button asChild className="w-full">
                <Link href="/create-account">Регистрация</Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
