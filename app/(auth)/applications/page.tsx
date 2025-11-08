'use client'

import { useJWTAuthContext } from '@/config/Auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AuthNavbar from '@/components/AuthNavbar'
import { FileText, Clock, CheckCircle, XCircle, Loader2, Inbox, Eye, DollarSign } from 'lucide-react'

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
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Loader2
            size={48}
            color="#063c7a"
            strokeWidth={2}
            style={{ margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }}
          />
          <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1a1a1a' }}>Loading...</p>
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
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <AuthNavbar />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <FileText size={32} color="#063c7a" strokeWidth={2} />
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>My Applications</h1>
          </div>
          <p style={{ color: '#666', fontSize: '1rem', marginLeft: '2.75rem' }}>
            Track all your job applications and their status
          </p>
        </div>

        {/* Stats Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem',
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '1.75rem',
              borderRadius: '12px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Clock size={24} color="white" strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1a1a1a' }}>{stats.pending}</div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>Pending</div>
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'white',
              padding: '1.75rem',
              borderRadius: '12px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle size={24} color="white" strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1a1a1a' }}>{stats.accepted}</div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>Accepted</div>
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'white',
              padding: '1.75rem',
              borderRadius: '12px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <XCircle size={24} color="white" strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1a1a1a' }}>{stats.rejected}</div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>Rejected</div>
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'white',
              padding: '1.75rem',
              borderRadius: '12px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileText size={24} color="white" strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1a1a1a' }}>{stats.total}</div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
            marginBottom: '2.5rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                style={{
                  padding: '0.625rem 1.25rem',
                  border: filter === status ? 'none' : '1px solid #e0e0e0',
                  background: filter === status ? '#063c7a' : 'white',
                  color: filter === status ? 'white' : '#666',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  if (filter !== status) {
                    e.currentTarget.style.background = '#f0f4f8'
                    e.currentTarget.style.borderColor = '#063c7a'
                  } else {
                    e.currentTarget.style.background = '#084d99'
                  }
                }}
                onMouseLeave={e => {
                  if (filter !== status) {
                    e.currentTarget.style.background = 'white'
                    e.currentTarget.style.borderColor = '#e0e0e0'
                  } else {
                    e.currentTarget.style.background = '#063c7a'
                  }
                }}
              >
                {status === 'ALL'
                  ? 'All'
                  : status === 'PENDING'
                  ? 'Pending'
                  : status === 'ACCEPTED'
                  ? 'Accepted'
                  : 'Rejected'}
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        <div
          style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1a1a1a' }}>
            {filter === 'ALL' ? 'All Applications' : `${filter} Applications`} ({applications.length})
          </h2>

          {loading ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px dashed #e0e0e0',
              }}
            >
              <Loader2
                size={48}
                color="#999"
                strokeWidth={2}
                style={{ margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }}
              />
              <p style={{ color: '#666', margin: 0 }}>Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px dashed #e0e0e0',
              }}
            >
              <Inbox size={48} color="#ccc" strokeWidth={2} style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: '#666', fontSize: '1rem', marginBottom: '0.5rem' }}>No applications found</p>
              <p style={{ color: '#999', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                {filter === 'ALL'
                  ? "You haven't applied to any tasks yet."
                  : `You don't have any ${filter.toLowerCase()} applications.`}
              </p>
              <button
                onClick={() => router.push('/dashboard/worker')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#063c7a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#084d99'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#063c7a'
                }}
              >
                Browse Available Tasks
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {applications.map(app => (
                <div
                  key={app._id}
                  style={{
                    padding: '1.5rem',
                    background: '#f8f9fa',
                    borderRadius: '10px',
                    border: '1px solid #e0e0e0',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                  onClick={() => router.push(`/tasks/${app.taskId._id}`)}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#063c7a'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e0e0e0'
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
                      <h3
                        style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1a1a1a' }}
                      >
                        {app.taskId.title}
                      </h3>
                      <div
                        style={{
                          display: 'flex',
                          gap: '1.5rem',
                          flexWrap: 'wrap',
                          fontSize: '0.875rem',
                          color: '#666',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <DollarSign size={14} color="#10b981" strokeWidth={2} />৳{app.taskId.budget}
                        </div>
                        <span>📂 {app.taskId.category.replace('_', ' ')}</span>
                        <span>📍 {app.taskId.location.city}</span>
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background:
                          app.status === 'PENDING' ? '#fff4e6' : app.status === 'ACCEPTED' ? '#d1fae5' : '#fee2e2',
                        color: app.status === 'PENDING' ? '#f76707' : app.status === 'ACCEPTED' ? '#065f46' : '#dc2626',
                      }}
                    >
                      {app.status === 'PENDING' ? 'Pending' : app.status === 'ACCEPTED' ? '✅ Accepted' : '❌ Rejected'}
                    </span>
                  </div>

                  <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#666', marginBottom: '0.5rem' }}>
                      Your Cover Letter:
                    </div>
                    <p style={{ color: '#1a1a1a', lineHeight: '1.6', fontSize: '0.875rem', margin: 0 }}>
                      {app.coverLetter.length > 200 ? app.coverLetter.substring(0, 200) + '...' : app.coverLetter}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '2rem',
                      flexWrap: 'wrap',
                      fontSize: '0.875rem',
                      color: '#666',
                      marginBottom: '1rem',
                    }}
                  >
                    {app.proposedBudget && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <DollarSign size={14} color="#10b981" strokeWidth={2} />
                        <span style={{ fontWeight: '600', color: '#1a1a1a' }}>Your Bid:</span> ৳{app.proposedBudget}
                      </div>
                    )}
                    {app.estimatedCompletionTime && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Clock size={14} color="#063c7a" strokeWidth={2} />
                        <span style={{ fontWeight: '600', color: '#1a1a1a' }}>Est. Time:</span>{' '}
                        {app.estimatedCompletionTime}h
                      </div>
                    )}
                    <div>
                      <span style={{ fontWeight: '600', color: '#1a1a1a' }}>Applied:</span>{' '}
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <button
                    onClick={e => {
                      e.stopPropagation()
                      router.push(`/tasks/${app.taskId._id}`)
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#063c7a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#084d99'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#063c7a'
                    }}
                  >
                    <Eye size={14} strokeWidth={2} />
                    View Task Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
