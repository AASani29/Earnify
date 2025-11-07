'use client'

import { useJWTAuthContext } from '@/config/Auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'DELIVERY', label: '🚚 Delivery' },
  { value: 'CLEANING', label: '🧹 Cleaning' },
  { value: 'TECH_SUPPORT', label: '💻 Tech Support' },
  { value: 'HANDYMAN', label: '🔧 Handyman' },
  { value: 'TUTORING', label: '📚 Tutoring' },
  { value: 'PHOTOGRAPHY', label: '📷 Photography' },
  { value: 'WRITING', label: '✍️ Writing' },
  { value: 'DESIGN', label: '🎨 Design' },
  { value: 'OTHER', label: '📦 Other' },
]

export default function WorkerDashboardPage() {
  const { user, logout, isLoggedIn, controller } = useJWTAuthContext()
  const router = useRouter()
  const [tasks, setTasks] = useState<any[]>([])
  const [myApplications, setMyApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    status: 'OPEN',
  })

  const getAccessToken = () => controller.getAccessToken()

  useEffect(() => {
    if (isLoggedIn === true && user && user.role !== 'WORKER') {
      // Redirect to appropriate dashboard if not a worker
      if (user.role === 'CLIENT') {
        router.push('/dashboard/client')
      } else if (user.role === 'ADMIN') {
        router.push('/dashboard/admin')
      }
    }
  }, [user, isLoggedIn, router])

  useEffect(() => {
    if (user && user.role === 'WORKER') {
      fetchTasks()
      fetchMyApplications()
    }
  }, [user, filters])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.category) params.append('category', filters.category)
      if (filters.search) params.append('search', filters.search)
      if (filters.status) params.append('status', filters.status)

      const response = await fetch(`/api/tasks?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks || [])
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyApplications = async () => {
    if (!user) return
    try {
      const accessToken = getAccessToken()
      const response = await fetch(`/api/applications?workerId=${user.id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setMyApplications(data.applications || [])
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    }
  }

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

  if (user.role !== 'WORKER') {
    return null // Will redirect via useEffect
  }

  const stats = {
    activeApplications: myApplications.filter(app => app.status === 'PENDING').length,
    acceptedTasks: myApplications.filter(app => app.status === 'ACCEPTED').length,
    totalApplications: myApplications.length,
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
                Dashboard
              </button>
              <button
                onClick={() => router.push('/applications')}
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

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1rem 2rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>👷 Worker Dashboard</h1>
          <p style={{ color: '#6c757d' }}>Welcome back, {user.firstName}! Find and apply for tasks below.</p>
        </div>

        {/* Profile Warning */}
        {!user.profileCompleted && (
          <div
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              marginBottom: '2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              boxShadow: '0 4px 15px rgba(245, 87, 108, 0.3)',
            }}
          >
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                ⚠️ Complete Your Profile
              </div>
              <p style={{ opacity: 0.95, fontSize: '0.95rem' }}>
                Add your skills, experience, and portfolio to increase your chances of getting hired by 80%!
              </p>
            </div>
            <button
              onClick={() => router.push('/profile')}
              style={{
                background: 'white',
                color: '#f5576c',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Complete Profile →
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <div
            className="card"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}
          >
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {stats.activeApplications}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Pending Applications</div>
          </div>
          <div
            className="card"
            style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}
          >
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{stats.acceptedTasks}</div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Accepted Tasks</div>
          </div>
          <div
            className="card"
            style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}
          >
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {stats.totalApplications}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Total Applications</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>🔍 Find Available Tasks</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
            }}
          >
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Search</label>
              <input
                type="text"
                className="input"
                placeholder="Search tasks..."
                value={filters.search}
                onChange={e => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Category</label>
              <select
                className="input"
                value={filters.category}
                onChange={e => setFilters({ ...filters, category: e.target.value })}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Status</label>
              <select
                className="input"
                value={filters.status}
                onChange={e => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Available Tasks */}
        <div className="card">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            📋 Available Tasks ({tasks.length})
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
              <p>Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>No tasks found</p>
              <p style={{ color: '#adb5bd', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Try adjusting your filters or check back later
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {tasks.map(task => (
                <div
                  key={task._id}
                  style={{
                    border: '2px solid #e9ecef',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#667eea'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e9ecef'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  onClick={() => router.push(`/tasks/${task._id}`)}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: '1rem',
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{task.title}</h3>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: '#e7f3ff',
                            color: '#0066cc',
                            borderRadius: '20px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                          }}
                        >
                          {task.category}
                        </span>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: task.status === 'OPEN' ? '#d4edda' : '#fff3cd',
                            color: task.status === 'OPEN' ? '#155724' : '#856404',
                            borderRadius: '20px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                          }}
                        >
                          {task.status}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>৳{task.budget}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>BDT</div>
                    </div>
                  </div>

                  <p style={{ color: '#495057', marginBottom: '1rem', lineHeight: '1.6' }}>
                    {task.description.length > 150 ? task.description.substring(0, 150) + '...' : task.description}
                  </p>

                  <div
                    style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.9rem', color: '#6c757d' }}
                  >
                    <div>
                      📍 {task.location?.city}, {task.location?.district}
                    </div>
                    {task.estimatedDuration && <div>⏱️ {task.estimatedDuration}h</div>}
                    {task.deadline && <div>📅 {new Date(task.deadline).toLocaleDateString()}</div>}
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
