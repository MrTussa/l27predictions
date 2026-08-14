import type { Access, FieldAccess } from 'payload'

import type { User } from '@/payload-types'

export const isAdmin = (user?: User | null): boolean => !!user?.roles?.includes('admin')

export const publicAccess: Access = () => true

export const adminOnly: Access = ({ req: { user } }) => isAdmin(user)

export const adminOnlyFieldAccess: FieldAccess = ({ req: { user } }) => isAdmin(user)

/** Свой документ или админ. Сравнивает ID документа с ID пользователя. */
export const adminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  return isAdmin(user) || { id: { equals: user.id } }
}

/** Документ, принадлежащий пользователю (поле `user`), или админ. */
export const adminOrOwner: Access = ({ req: { user } }) => {
  if (!user) return false
  return isAdmin(user) || { user: { equals: user.id } }
}
