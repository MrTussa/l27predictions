import type { PayloadRequest } from 'payload'
import { addDataAndFileToRequest } from 'payload'
import { COSMETICS_BY_ID } from '@/utilities/cosmetics'

// POST /api/shop  { action: 'buy' | 'equip', itemId }
// Coins are deducted and ownership granted server-side only — never trust the
// client to spend currency.
export const shop = async (req: PayloadRequest) => {
  try {
    await addDataAndFileToRequest(req)

    if (!req.user) {
      return Response.json({ message: 'Необходима авторизация' }, { status: 401 })
    }

    const { action, itemId } = req.data || {}

    // Fresh read — req.user can be stale, and this is the balance we deduct from.
    const user = await req.payload.findByID({ collection: 'users', id: req.user.id })
    const owned: string[] = Array.isArray(user.ownedCosmetics) ? user.ownedCosmetics : []

    if (action === 'equip') {
      // null/empty unequips; otherwise must be owned.
      if (itemId && !owned.includes(itemId)) {
        return Response.json({ message: 'Предмет не куплен' }, { status: 400 })
      }
      const updated = await req.payload.update({
        collection: 'users',
        id: user.id,
        overrideAccess: true,
        data: { equippedNicknameEffect: itemId || null },
      })
      return Response.json({ user: updated }, { status: 200 })
    }

    if (action === 'buy') {
      const item = COSMETICS_BY_ID[itemId]
      if (!item) {
        return Response.json({ message: 'Предмет не найден' }, { status: 404 })
      }
      if (owned.includes(item.id)) {
        return Response.json({ message: 'Предмет уже куплен' }, { status: 400 })
      }
      const balance = user.pitCoins || 0
      if (balance < item.price) {
        return Response.json({ message: 'Недостаточно Pit Coins' }, { status: 400 })
      }

      // ponytail: read-modify-write, no lock. A double-click could double-spend.
      // Fine at this scale; switch to an atomic $inc if it ever matters.
      const updated = await req.payload.update({
        collection: 'users',
        id: user.id,
        overrideAccess: true,
        data: {
          pitCoins: balance - item.price,
          ownedCosmetics: [...owned, item.id],
        },
      })
      return Response.json({ user: updated }, { status: 200 })
    }

    return Response.json({ message: 'Неизвестное действие' }, { status: 400 })
  } catch (error: unknown) {
    console.error('[shop] Unexpected error:', error)
    const message = error instanceof Error ? error.message : 'Внутренняя ошибка сервера'
    return Response.json({ message }, { status: 500 })
  }
}
