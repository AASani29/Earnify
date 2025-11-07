'use client'

import { useJWTAuthContext } from '@/config/Auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ClientDashboardPage() {
  const { user, logout, isLoggedIn, controller } = useJWTAuthContext()
  const router = useRouter()
  const [tasks, setTasks] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Get access token from controller
  const getAccessToken = () => controller.getAccessToken()

  useEffect(() => {
    if (isLoggedIn === true && user && user.role !== 'CLIENT') {
      // Redirect to appropriate dashboard if not a client
      if (user.role === 'WORKER') {
        router.push('/dashboard/worker')
      } else if (user.role === 'ADMIN') {
        router.push('/dashboard/admin')
      }
    }
  }, [user, isLoggedIn, router])

  useEffect(() => {
    if (user && user.role === 'CLIENT') {
      fetchTasks()
    }
  }, [user])

  const fetchTasks = async () => {
    if (!user) return

    try {
      setLoading(true)
      const accessToken = getAccessToken()
      const response = await fetch(`/api/tasks?clientId=${user.id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch tasks')
      }

      const data = await response.json()
      setTasks(data.tasks || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async (taskId: string) => {
    try {
      const accessToken = getAccessToken()
      const response = await fetch(`/api/tasks/${taskId}/applications`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch applications')
      }

      const data = await response.json()
      setApplications(data.applications || [])
      setSelectedTask(taskId)
    } catch (error) {
      console.error('Error fetching applications:', error)
    }
  }

  const handleAcceptApplication = async (applicationId: string) => {
    try {
      const accessToken = getAccessToken()
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: 'ACCEPTED' }),
      })

      if (!response.ok) {
        throw new Error('Failed to accept application')
      }

      alert('Application accepted!')
      await fetchTasks()
      if (selectedTask) {
        await fetchApplications(selectedTask)
      }
    } catch (error: any) {
      console.error('Error accepting application:', error)
      alert('Failed to accept application')
    }
  }

  const handleRejectApplication = async (applicationId: string) => {
    try {
      const accessToken = getAccessToken()
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: 'REJECTED' }),
      })

      if (!response.ok) {
        throw new Error('Failed to reject application')
      }

      alert('Application rejected')
      if (selectedTask) {
        await fetchApplications(selectedTask)
      }
    } catch (error: any) {
      console.error('Error rejecting application:', error)
      alert('Failed to reject application')
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

  if (user.role !== 'CLIENT') {
    return null // Will redirect via useEffect
  }

  const activeTasks = tasks.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length
  const totalApplications = tasks.reduce((sum, task) => sum + (task.applicationCount || 0), 0)

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
              <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>Client</div>
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
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>🏢 Client Dashboard</h1>
          <p style={{ color: '#6c757d' }}>Manage your tasks and hire the best workers</p>
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
                ⚠️ Complete Your Company Profile
              </div>
              <p style={{ opacity: 0.95, fontSize: '0.95rem' }}>
                Add your company information to build trust with workers and get better applications!
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
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{activeTasks}</div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Active Tasks</div>
          </div>
          <div
            className="card"
            style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}
          >
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{completedTasks}</div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Completed Tasks</div>
          </div>
          <div
            className="card"
            style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}
          >
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{totalApplications}</div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Total Applications</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>⚡ Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <button
              onClick={() => router.push('/tasks/create')}
              style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'transform 0.2s',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              ➕ Post New Task
            </button>
            <button
              onClick={() => router.push('/profile')}
              style={{
                padding: '1.5rem',
                background: 'white',
                color: '#667eea',
                border: '2px solid #667eea',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#667eea'
                e.currentTarget.style.color = 'white'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'white'
                e.currentTarget.style.color = '#667eea'
              }}
            >
              👤 View Profile
            </button>
          </div>
        </div>

        {/* My Posted Tasks */}
        <div className="card">
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>📋 My Posted Tasks ({tasks.length})</span>
            <button
              onClick={() => router.push('/tasks/create')}
              className="btn btn-primary"
              style={{ fontSize: '0.875rem' }}
            >
              + Post New Task
            </button>
          </h2>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#f5f5f5', borderRadius: '8px' }}>
              <p style={{ color: '#666' }}>Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#f5f5f5', borderRadius: '8px' }}>
              <p style={{ color: '#666' }}>You haven't posted any tasks yet.</p>
              <p style={{ color: '#999', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Click "Post New Task" to get started.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {tasks.map(task => (
                <div
                  key={task._id}
                  style={{
                    padding: '1rem',
                    background: '#f5f5f5',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                  onClick={() => router.push(`/tasks/${task._id}`)}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <h3 style={{ margin: 0 }}>{task.title}</h3>
                    <span
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        background:
                          task.status === 'OPEN' ? '#e8f5e9' : task.status === 'IN_PROGRESS' ? '#e3f2fd' : '#f5f5f5',
                        color: task.status === 'OPEN' ? '#2e7d32' : task.status === 'IN_PROGRESS' ? '#1976d2' : '#666',
                      }}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p style={{ color: '#666', fontSize: '0.875rem', margin: '0.5rem 0' }}>
                    {task.description.substring(0, 100)}...
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#666' }}>
                    <span>
                      <strong>Budget:</strong> ৳{task.budget}
                    </span>
                    <span>
                      <strong>Category:</strong> {task.category.replace('_', ' ')}
                    </span>
                    <span>
                      <strong>Location:</strong> {task.location.city}
                    </span>
                  </div>
                  {task.status === 'OPEN' && (
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        fetchApplications(task._id)
                      }}
                      className="btn btn-primary"
                      style={{ marginTop: '0.5rem', fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
                    >
                      View Applications
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Applications Modal */}
        {selectedTask && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '8px',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '80vh',
                overflow: 'auto',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}
              >
                <h2>Applications</h2>
                <button
                  onClick={() => setSelectedTask(null)}
                  style={{ fontSize: '1.5rem', border: 'none', background: 'none', cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>

              {applications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                  <p style={{ fontSize: '1.1rem' }}>No applications yet</p>
                  <p style={{ fontSize: '0.95rem' }}>Applications will appear here once workers apply to this task.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {applications.map(app => (
                    <div
                      key={app._id}
                      style={{
                        padding: '1.5rem',
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        borderRadius: '12px',
                        border: '2px solid #e9ecef',
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
                        <div>
                          <h3
                            style={{
                              fontSize: '1.25rem',
                              fontWeight: 'bold',
                              marginBottom: '0.25rem',
                              color: '#495057',
                            }}
                          >
                            👤 {app.workerId.firstName} {app.workerId.lastName}
                          </h3>
                          <p style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                            📧 {app.workerId.email}
                            {app.workerId.phoneNumber && ` • 📱 ${app.workerId.phoneNumber}`}
                          </p>
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
                        <div
                          style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6c757d', marginBottom: '0.5rem' }}
                        >
                          📝 Cover Letter:
                        </div>
                        <p style={{ color: '#495057', lineHeight: '1.6', fontSize: '0.95rem' }}>{app.coverLetter}</p>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          gap: '2rem',
                          flexWrap: 'wrap',
                          fontSize: '0.9rem',
                          color: '#6c757d',
                          marginBottom: '1rem',
                        }}
                      >
                        {app.proposedBudget && (
                          <div>
                            <span style={{ fontWeight: '600' }}>💰 Proposed Budget:</span> ৳{app.proposedBudget}
                          </div>
                        )}
                        {app.estimatedCompletionTime && (
                          <div>
                            <span style={{ fontWeight: '600' }}>⏱️ Estimated Time:</span> {app.estimatedCompletionTime}{' '}
                            hours
                          </div>
                        )}
                        <div>
                          <span style={{ fontWeight: '600' }}>📅 Applied:</span>{' '}
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </div>
                      </div>

                      {app.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                          <button
                            onClick={() => handleAcceptApplication(app._id)}
                            style={{
                              flex: 1,
                              padding: '0.75rem',
                              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'transform 0.2s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                          >
                            ✅ Accept Application
                          </button>
                          <button
                            onClick={() => handleRejectApplication(app._id)}
                            style={{
                              flex: 1,
                              padding: '0.75rem',
                              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'transform 0.2s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                          >
                            ❌ Reject Application
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
