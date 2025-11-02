'use client'

import { useJWTAuthContext } from '@/config/Auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function WorkerDashboardPage() {
  const { user, logout, isLoading } = useJWTAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user && user.role !== 'WORKER') {
      // Redirect to appropriate dashboard if not a worker
      if (user.role === 'CLIENT') {
        router.push('/dashboard/client')
      } else if (user.role === 'ADMIN') {
        router.push('/dashboard/admin')
      }
    }
  }, [user, isLoading, router])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="container">
        <div className="card">Loading...</div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  if (user.role !== 'WORKER') {
    return null // Will redirect via useEffect
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>Worker Dashboard</h1>
          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
        </div>

        {!user.profileCompleted && (
          <div className="error" style={{ marginBottom: '1.5rem' }}>
            ⚠️ Please complete your profile to start receiving task offers.{' '}
            <a href="/profile/setup" style={{ color: '#fff', textDecoration: 'underline' }}>
              Complete Profile
            </a>
          </div>
        )}

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Profile</h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div>
              <strong>Name:</strong> {user.firstName} {user.lastName}
            </div>
            <div>
              <strong>Email:</strong> {user.email}
            </div>
            {user.phoneNumber && (
              <div>
                <strong>Phone:</strong> {user.phoneNumber}
              </div>
            )}
            <div>
              <strong>Role:</strong>{' '}
              <span
                style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  background: '#e8f5e9',
                  color: '#2e7d32',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                }}
              >
                Service Provider
              </span>
            </div>
            <div>
              <strong>Profile Status:</strong>{' '}
              <span style={{ color: user.profileCompleted ? '#2e7d32' : '#d32f2f' }}>
                {user.profileCompleted ? '✓ Completed' : '✗ Incomplete'}
              </span>
            </div>
            <div>
              <strong>Verification Status:</strong>{' '}
              <span style={{ color: user.isVerified ? '#2e7d32' : '#f57c00' }}>
                {user.isVerified ? '✓ Verified' : '⏳ Pending'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Quick Stats</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2' }}>0</div>
              <div style={{ color: '#666' }}>Active Tasks</div>
            </div>
            <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2e7d32' }}>0</div>
              <div style={{ color: '#666' }}>Completed Tasks</div>
            </div>
            <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f57c00' }}>0.0</div>
              <div style={{ color: '#666' }}>Rating</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Available Tasks</h2>
          <div style={{ padding: '2rem', textAlign: 'center', background: '#f5f5f5', borderRadius: '8px' }}>
            <p style={{ color: '#666' }}>No tasks available at the moment.</p>
            <p style={{ color: '#999', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Complete your profile to start receiving task recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

