'use client'

import { useJWTAuthContext } from '@/config/Auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, isLoading } = useJWTAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect to role-specific dashboard
      switch (user.role) {
        case 'WORKER':
          router.push('/dashboard/worker')
          break
        case 'CLIENT':
          router.push('/dashboard/client')
          break
        case 'ADMIN':
          router.push('/dashboard/admin')
          break
        default:
          router.push('/login')
      }
    } else if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  return (
    <div className="container">
      <div className="card">
        <p>Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}
