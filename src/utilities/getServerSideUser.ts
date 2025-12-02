import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { User } from '@/payload-types'

export async function getServerSideUser(): Promise<{ user: User | null }> {
  const payload = await getPayload({ config: configPromise })
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  if (!token) {
    return { user: null }
  }

  try {
    const headers = new Headers()
    headers.set('Authorization', `JWT ${token}`)
    const { user } = await payload.auth({ headers })
    return { user: user as User | null }
  } catch {
    return { user: null }
  }
}
