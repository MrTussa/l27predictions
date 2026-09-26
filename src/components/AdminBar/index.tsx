'use client'

import { useAuth } from '@/providers/Auth'
import dynamic from 'next/dynamic'
import React from 'react'

const PayloadAdminBar = dynamic(() =>
  import('@payloadcms/admin-bar').then((m) => m.PayloadAdminBar),
)

const Title: React.FC = () => <span>Админка</span>

export const AdminBar: React.FC = () => {
  const { user } = useAuth()

  if (!user?.roles?.includes('admin')) return null

  return (
    <div className="z-9999 fixed bottom-0 w-full py-2 px-10 bg-black text-white">
      <div className="container">
        <PayloadAdminBar
          className="py-2  text-white"
          classNames={{
            controls: 'font-medium text-white',
            logo: 'text-white',
            user: 'text-white',
          }}
          cmsURL={process.env.NEXT_PUBLIC_SERVER_URL}
          logo={<Title />}
          style={{
            backgroundColor: 'transparent',
            padding: 0,
            position: 'relative',
            zIndex: 'unset',
          }}
        />
      </div>
    </div>
  )
}
