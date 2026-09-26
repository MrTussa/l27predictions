import { revalidateTag } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

export type CacheTag =
  | 'races'
  | 'drivers'
  | 'teams'
  | 'events'
  | 'season-stats'
  | 'predictions'
  | 'broadcast'

function expire(tags: CacheTag[]) {
  for (const tag of tags) {
    try {
      revalidateTag(tag, { expire: 0 })
    } catch {
      // Вне Next-запроса (payload CLI, скрипты)
    }
  }
}

export const revalidateOnChange =
  (...tags: CacheTag[]): CollectionAfterChangeHook =>
  ({ doc }) => {
    expire(tags)
    return doc
  }

export const revalidateOnDelete =
  (...tags: CacheTag[]): CollectionAfterDeleteHook =>
  ({ doc }) => {
    expire(tags)
    return doc
  }

export const revalidateGlobalOnChange =
  (...tags: CacheTag[]): GlobalAfterChangeHook =>
  ({ doc }) => {
    expire(tags)
    return doc
  }
