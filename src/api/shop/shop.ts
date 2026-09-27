import type { PayloadRequest } from 'payload'
import { addDataAndFileToRequest } from 'payload'
import type { MongooseAdapter } from '@payloadcms/db-mongodb'
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
      if ((user.pitCoins || 0) < item.price) {
        return Response.json({ message: 'Недостаточно Pit Coins' }, { status: 400 })
      }

      // Списание одним атомарным запросом: сработает, только если монет хватает и предмета
      // ещё нет, поэтому двойной клик не купит дважды на одни и те же монеты
      const users = (req.payload.db as unknown as MongooseAdapter).collections.users
      const result = await users.updateOne(
        { _id: user.id, pitCoins: { $gte: item.price }, ownedCosmetics: { $ne: item.id } },
        [
          {
            $set: {
              pitCoins: { $subtract: ['$pitCoins', item.price] },
              ownedCosmetics: {
                $concatArrays: [{ $ifNull: ['$ownedCosmetics', []] }, [item.id]],
              },
            },
          },
        ],
      )
      if (result.modifiedCount === 0) {
        return Response.json(
          { message: 'Покупка не прошла: не хватает Pit Coins или предмет уже куплен' },
          { status: 409 },
        )
      }

      const updated = await req.payload.findByID({
        collection: 'users',
        id: user.id,
        overrideAccess: true,
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
