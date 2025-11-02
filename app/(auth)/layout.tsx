'use client'

import { JWTAuthProvider, authConfig } from '@/config/Auth'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <JWTAuthProvider config={authConfig}>{children}</JWTAuthProvider>
}

