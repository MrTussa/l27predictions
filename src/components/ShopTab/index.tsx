'use client'

import { Nickname } from '@/components/Nickname'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/providers/Auth'
import { COSMETICS } from '@/utilities/cosmetics'
import { IconCheck, IconCoins } from '@tabler/icons-react'
import { useState } from 'react'
import { toast } from 'sonner'

export const ShopTab: React.FC = () => {
  const { user, setUser } = useAuth()
  const [pending, setPending] = useState<string | null>(null)

  if (!user) return null

  const owned: string[] = Array.isArray(user.ownedCosmetics) ? user.ownedCosmetics : []
  const equipped = user.equippedNicknameEffect
  const balance = user.pitCoins || 0
  const nickname = user.nickname || user.email

  async function act(action: 'buy' | 'equip', itemId: string | null) {
    setPending(itemId ?? '__unequip')
    try {
      const res = await fetch('/api/shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action, itemId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Ошибка')
      setUser(json.user)
      if (action === 'buy') toast.success('Покупка совершена!')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Не удалось выполнить действие')
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {COSMETICS.map((item) => {
        const isOwned = owned.includes(item.id)
        const isEquipped = equipped === item.id
        const canAfford = balance >= item.price
        const busy = pending === item.id || (isEquipped && pending === '__unequip')

        return (
          <Card
            key={item.id}
            variant="default"
            corners="cut-corner-sm"
            className="hover:shadow-[0_0_15px_rgba(255,223,44,0.12)]"
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <Nickname
                effect={item.id}
                className="min-w-0 truncate text-xl font-black tracking-tight"
              >
                {nickname}
              </Nickname>

              <div className="flex shrink-0 items-center gap-3">
                {isEquipped ? (
                  <>
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-black">
                      <IconCheck className="h-3.5 w-3.5" />
                      Активно
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busy}
                      onClick={() => act('equip', null)}
                    >
                      {busy ? '...' : 'Снять'}
                    </Button>
                  </>
                ) : isOwned ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => act('equip', item.id)}
                  >
                    {busy ? '...' : 'Надеть'}
                  </Button>
                ) : (
                  <>
                    <span className="flex items-center gap-1 font-mono text-sm text-muted-foreground tabular-nums">
                      <IconCoins className="h-4 w-4 text-accent" />
                      {item.price}
                    </span>
                    <Button
                      variant={canAfford ? 'outline' : 'secondary'}
                      size="sm"
                      disabled={!canAfford || busy}
                      onClick={() => act('buy', item.id)}
                    >
                      {busy ? '...' : canAfford ? 'Купить' : 'Мало'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
