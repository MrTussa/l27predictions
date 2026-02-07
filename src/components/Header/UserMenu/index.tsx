'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/providers/Auth'
import { User } from 'lucide-react'
import Link from 'next/link'

export const UserMenu: React.FC = () => {
  const { user, logout } = useAuth()

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button
          size={'clear'}
          className="h-8 px-3 py-2 text-xs md:text-base md:h-10 md:px-6 "
          asChild
          variant={'ghost'}
        >
          <Link href="/login">Вход</Link>
        </Button>
        <Button
          size={'clear'}
          className="h-8 px-3 py-2 text-xs md:text-base md:h-10 md:px-6 "
          asChild
        >
          <Link href="/create-account">Регистрация</Link>
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex items-center justify-center gap-2 px-4 h-8 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-accent hover:bg-accent/10 hover:border hover:border-accent transition-colors cursor-pointer ">
          <User className="w-4 h-4" />
          <span className="hidden md:inline">{user.nickname}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-accent font-medium">{user.nickname}</p>
            <p className="text-xs font-extralight text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account" className="cursor-pointer">
            Мой аккаунт
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account#predictions" className="cursor-pointer">
            Мои прогнозы
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={() => logout()}
        >
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
