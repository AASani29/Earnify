'use client'

import { useJWTAuthContext } from '@/config/Auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminDashboardPage() {
  const { user, logout, isLoggedIn } = useJWTAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (isLoggedIn !== null && user && user.role !== 'ADMIN') {
      // Redirect to appropriate dashboard if not an admin
      if (user.role === 'WORKER') {
        router.push('/dashboard/worker')
      } else if (user.role === 'CLIENT') {
        router.push('/dashboard/client')
      }
    }
  }, [user, isLoggedIn, router])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (isLoggedIn === null) {
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

  if (user.role !== 'ADMIN') {
    return null // Will redirect via useEffect
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>Admin Dashboard</h1>
          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Admin Profile</h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div>
              <strong>Name:</strong> {user.firstName} {user.lastName}
            </div>
            <div>
              <strong>Email:</strong> {user.email}
            </div>
            <div>
              <strong>Role:</strong>{' '}
              <span
                style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  background: '#fce4ec',
                  color: '#c2185b',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                }}
              >
                Administrator
              </span>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Platform Statistics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2' }}>0</div>
              <div style={{ color: '#666' }}>Total Users</div>
            </div>
            <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2e7d32' }}>0</div>
              <div style={{ color: '#666' }}>Active Workers</div>
            </div>
            <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f57c00' }}>0</div>
              <div style={{ color: '#666' }}>Active Clients</div>
            </div>
            <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#7b1fa2' }}>0</div>
              <div style={{ color: '#666' }}>Total Tasks</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Management</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px', cursor: 'pointer' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>User Management</h3>
              <p style={{ color: '#666', fontSize: '0.875rem' }}>View, verify, and manage all users</p>
            </div>
            <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px', cursor: 'pointer' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Task Management</h3>
              <p style={{ color: '#666', fontSize: '0.875rem' }}>Monitor and manage all tasks</p>
            </div>
            <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px', cursor: 'pointer' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Verification Requests</h3>
              <p style={{ color: '#666', fontSize: '0.875rem' }}>Review pending verification requests</p>
            </div>
            <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px', cursor: 'pointer' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Dispute Resolution</h3>
              <p style={{ color: '#666', fontSize: '0.875rem' }}>Handle disputes between clients and workers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
