import type { User } from '@/payload-types'
import { AuthProvider } from '@/providers/Auth'
import React from 'react'

import { SonnerProvider } from '@/providers/Sonner'

export const Providers: React.FC<{
  children: React.ReactNode
  initialUser?: User | null
}> = ({ children, initialUser }) => {
  return (
    <AuthProvider initialUser={initialUser}>
      <SonnerProvider />
      {children}
    </AuthProvider>
  )
}
