import type { Access } from 'payload'

import { checkRole } from '@/access/utilities'

/**
 * Grants access if the user is an admin or owns the document.
 * (default: 'user') instead of comparing document ID to user ID.
 */
export const adminOrOwner =
  (userField = 'user'): Access =>
  ({ req: { user } }) => {
    if (!user) return false
    if (checkRole(['admin'], user)) return true
    return { [userField]: { equals: user.id } }
  }
