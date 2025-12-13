'use client'

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
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 px-4 h-8 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors rounded-md"
        >
          Вход
        </Link>
        <Link
          href="/create-account"
          className="inline-flex items-center justify-center gap-2 px-4 h-8 text-xs font-bold uppercase tracking-wider bg-accent text-black shadow-[0_0_20px_rgba(255,223,44,0.3)] hover:shadow-[0_0_30px_rgba(255,223,44,0.5)] hover:scale-[1.02] border-2 border-accent transition-all duration-200 rounded-md"
        >
          Регистрация
        </Link>
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
