import { AuthProvider } from '@/providers/Auth'
import React from 'react'

import { SonnerProvider } from '@/providers/Sonner'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <AuthProvider>
      <SonnerProvider />
      {children}
    </AuthProvider>
  )
}
