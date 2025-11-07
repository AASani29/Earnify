'use client'

import { useJWTAuthContext } from '@/config/Auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function MyApplicationsPage() {
  const { user, isLoggedIn, controller, logout } = useJWTAuthContext()
  const router = useRouter()
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('ALL')

  const getAccessToken = () => controller.getAccessToken()

  // Handle authentication redirect
  useEffect(() => {
    if (isLoggedIn === false || (isLoggedIn === true && user?.role !== 'WORKER')) {
      router.push('/login')
    }
  }, [user, isLoggedIn, router])

  // Fetch applications when user is loaded
  useEffect(() => {
    if (isLoggedIn === true && user && user.role === 'WORKER') {
      fetchApplications()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filter, isLoggedIn])

  const fetchApplications = async () => {
    if (!user) return
    try {
      setLoading(true)
      const accessToken = getAccessToken()
      const params = new URLSearchParams()
      if (filter !== 'ALL') params.append('status', filter)

      const response = await fetch(`/api/applications?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (isLoggedIn === null) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ fontSize: '1.25rem', fontWeight: '600' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'WORKER') {
    return null
  }

  const stats = {
    pending: applications.filter(app => app.status === 'PENDING').length,
    accepted: applications.filter(app => app.status === 'ACCEPTED').length,
    rejected: applications.filter(app => app.status === 'REJECTED').length,
    total: applications.length,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Top Navigation Bar */}
      <div style={{ background: 'white', borderBottom: '2px solid #e9ecef', marginBottom: '2rem' }}>
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '1rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>💼 Earnify</h2>
            <nav style={{ display: 'flex', gap: '1.5rem' }}>
              <button
                onClick={() => router.push('/dashboard/worker')}
                style={{
                  color: '#6c757d',
                  fontWeight: '500',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                  transition: 'color 0.2s',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#667eea')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6c757d')}
              >
                Dashboard
              </button>
              <button
                style={{
                  color: '#667eea',
                  fontWeight: '600',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                  borderBottom: '2px solid #667eea',
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'default',
                }}
              >
                📋 My Applications
              </button>
              <button
                onClick={() => router.push('/profile')}
                style={{
                  color: '#6c757d',
                  fontWeight: '500',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                  transition: 'color 0.2s',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#667eea')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6c757d')}
              >
                👤 My Profile
              </button>
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                {user.firstName} {user.lastName}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>Worker</div>
            </div>
            <button onClick={handleLogout} className="btn btn-danger">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1rem 3rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>📋 My Applications</h1>
          <p style={{ color: '#6c757d' }}>Track all your job applications and their status</p>
        </div>

        {/* Stats Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <div
            className="card"
            style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}
          >
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{stats.pending}</div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>⏳ Pending</div>
          </div>
          <div
            className="card"
            style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white' }}
          >
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{stats.accepted}</div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>✅ Accepted</div>
          </div>
          <div
            className="card"
            style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)', color: 'white' }}
          >
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{stats.rejected}</div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>❌ Rejected</div>
          </div>
          <div
            className="card"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}
          >
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{stats.total}</div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>📊 Total</div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>🔍 Filter Applications</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: filter === status ? 'none' : '2px solid #e9ecef',
                  background: filter === status ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                  color: filter === status ? 'white' : '#495057',
                  borderRadius: '25px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  if (filter !== status) {
                    e.currentTarget.style.background = '#f8f9fa'
                  }
                }}
                onMouseLeave={e => {
                  if (filter !== status) {
                    e.currentTarget.style.background = 'white'
                  }
                }}
              >
                {status === 'ALL'
                  ? '📋 All'
                  : status === 'PENDING'
                  ? '⏳ Pending'
                  : status === 'ACCEPTED'
                  ? '✅ Accepted'
                  : '❌ Rejected'}
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        <div className="card">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            {filter === 'ALL' ? 'All Applications' : `${filter} Applications`} ({applications.length})
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
              <p>Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No applications found</p>
              <p style={{ fontSize: '0.95rem' }}>
                {filter === 'ALL'
                  ? "You haven't applied to any tasks yet."
                  : `You don't have any ${filter.toLowerCase()} applications.`}
              </p>
              <button
                onClick={() => router.push('/dashboard/worker')}
                className="btn btn-primary"
                style={{ marginTop: '1.5rem' }}
              >
                Browse Available Tasks
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {applications.map(app => (
                <div
                  key={app._id}
                  style={{
                    padding: '1.5rem',
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    border: '2px solid #e9ecef',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                  onClick={() => router.push(`/tasks/${app.taskId._id}`)}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#667eea'
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.2)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e9ecef'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '1rem',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#495057' }}>
                        {app.taskId.title}
                      </h3>
                      <div
                        style={{
                          display: 'flex',
                          gap: '1.5rem',
                          flexWrap: 'wrap',
                          fontSize: '0.9rem',
                          color: '#6c757d',
                        }}
                      >
                        <span>💰 ৳{app.taskId.budget}</span>
                        <span>📂 {app.taskId.category.replace('_', ' ')}</span>
                        <span>📍 {app.taskId.location.city}</span>
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        background:
                          app.status === 'PENDING'
                            ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                            : app.status === 'ACCEPTED'
                            ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                            : 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                        color: 'white',
                      }}
                    >
                      {app.status === 'PENDING'
                        ? '⏳ Pending'
                        : app.status === 'ACCEPTED'
                        ? '✅ Accepted'
                        : '❌ Rejected'}
                    </span>
                  </div>

                  <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6c757d', marginBottom: '0.5rem' }}>
                      Your Cover Letter:
                    </div>
                    <p style={{ color: '#495057', lineHeight: '1.6', fontSize: '0.95rem' }}>
                      {app.coverLetter.length > 200 ? app.coverLetter.substring(0, 200) + '...' : app.coverLetter}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.9rem', color: '#6c757d' }}>
                    {app.proposedBudget && (
                      <div>
                        <span style={{ fontWeight: '600' }}>Your Bid:</span> ৳{app.proposedBudget}
                      </div>
                    )}
                    {app.estimatedCompletionTime && (
                      <div>
                        <span style={{ fontWeight: '600' }}>Est. Time:</span> {app.estimatedCompletionTime}h
                      </div>
                    )}
                    <div>
                      <span style={{ fontWeight: '600' }}>Applied:</span> {new Date(app.appliedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
