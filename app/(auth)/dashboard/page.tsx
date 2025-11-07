'use client'

import { useJWTAuthContext } from '@/config/Auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, isLoggedIn } = useJWTAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (isLoggedIn === true && user) {
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
    } else if (isLoggedIn === false) {
      router.push('/login')
    }
  }, [user, isLoggedIn, router])

  return (
    <div className="container">
      <div className="card">
        <p>Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}
