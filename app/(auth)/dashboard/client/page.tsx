'use client'

import { useJWTAuthContext } from '@/config/Auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AuthNavbar from '@/components/AuthNavbar'
import ClientInProgressTasks from '@/components/ClientInProgressTasks'
import {
  Briefcase,
  CheckCircle,
  Clock,
  FileText,
  AlertCircle,
  Plus,
  Eye,
  Trash2,
  Users,
  TrendingUp,
  DollarSign,
  Star,
} from 'lucide-react'

export default function ClientDashboardPage() {
  const { user, logout, isLoggedIn, controller } = useJWTAuthContext()
  const router = useRouter()
  const [tasks, setTasks] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<any[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [inProgressTasks, setInProgressTasks] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'myTasks' | 'inProgress' | 'reviews'>('myTasks')

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
      fetchInProgressTasks()
      fetchReviews()
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

  const fetchReviews = async () => {
    if (!user) return

    try {
      setLoadingReviews(true)
      const response = await fetch(`/api/reviews?clientId=${user.id}`)

      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoadingReviews(false)
    }
  }

  const fetchInProgressTasks = async () => {
    if (!user) return
    try {
      const accessToken = getAccessToken()
      const response = await fetch(`/api/tasks?clientId=${user.id}&status=IN_PROGRESS`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        console.log('In-progress tasks fetched:', data.tasks)
        console.log('Number of in-progress tasks:', data.tasks?.length || 0)
        // Log extension requests
        data.tasks?.forEach((task: any, index: number) => {
          console.log(`Task ${index + 1}:`, task.title)
          console.log(`  - Has extension request:`, !!task.timeExtensionRequest)
          if (task.timeExtensionRequest) {
            console.log(`  - Extension status:`, task.timeExtensionRequest.status)
            console.log(`  - Extension message:`, task.timeExtensionRequest.requestMessage)
          }
        })
        setInProgressTasks(data.tasks || [])
      }
    } catch (error) {
      console.error('Error fetching in-progress tasks:', error)
    }
  }

  const handleMarkReceived = async (taskId: string) => {
    const accessToken = getAccessToken()
    const response = await fetch(`/api/tasks/${taskId}/mark-received`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to mark as received')
    }
  }

  const handleMakePayment = async (taskId: string) => {
    const accessToken = getAccessToken()
    const response = await fetch(`/api/tasks/${taskId}/make-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to make payment')
    }
  }

  const handleRespondExtension = async (taskId: string, approved: boolean, message: string) => {
    const accessToken = getAccessToken()
    const response = await fetch(`/api/tasks/${taskId}/respond-extension`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ approved, responseMessage: message }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to respond to extension request')
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
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <AuthNavbar />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>Client Dashboard</h1>
          </div>
          <p style={{ color: '#666', fontSize: '1rem' }}>
            Manage your tasks and hire the best workers
          </p>

          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              marginTop: '1.5rem',
              borderBottom: '2px solid #f0f0f0',
              paddingBottom: '0',
            }}
          >
            <button
              onClick={() => setActiveTab('myTasks')}
              style={{
                padding: '0.875rem 1.75rem',
                background:
                  activeTab === 'myTasks' ? 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)' : 'transparent',
                color: activeTab === 'myTasks' ? 'white' : '#666',
                border: 'none',
                borderBottom: activeTab === 'myTasks' ? '3px solid #063c7a' : '3px solid transparent',
                borderRadius: '8px 8px 0 0',
                fontSize: '0.9375rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                position: 'relative',
                bottom: '-2px',
              }}
              onMouseEnter={e => {
                if (activeTab !== 'myTasks') {
                  e.currentTarget.style.background = '#f8f9fa'
                  e.currentTarget.style.color = '#063c7a'
                }
              }}
              onMouseLeave={e => {
                if (activeTab !== 'myTasks') {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#666'
                }
              }}
            >
              My Tasks ({tasks.filter(t => t.status === 'OPEN').length})
            </button>
            <button
              onClick={() => setActiveTab('inProgress')}
              style={{
                padding: '0.875rem 1.75rem',
                background:
                  activeTab === 'inProgress' ? 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)' : 'transparent',
                color: activeTab === 'inProgress' ? 'white' : '#666',
                border: 'none',
                borderBottom: activeTab === 'inProgress' ? '3px solid #063c7a' : '3px solid transparent',
                borderRadius: '8px 8px 0 0',
                fontSize: '0.9375rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                position: 'relative',
                bottom: '-2px',
              }}
              onMouseEnter={e => {
                if (activeTab !== 'inProgress') {
                  e.currentTarget.style.background = '#f8f9fa'
                  e.currentTarget.style.color = '#063c7a'
                }
              }}
              onMouseLeave={e => {
                if (activeTab !== 'inProgress') {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#666'
                }
              }}
            >
              In Progress ({inProgressTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              style={{
                padding: '0.875rem 1.75rem',
                background:
                  activeTab === 'reviews' ? 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)' : 'transparent',
                color: activeTab === 'reviews' ? 'white' : '#666',
                border: 'none',
                borderBottom: activeTab === 'reviews' ? '3px solid #063c7a' : '3px solid transparent',
                borderRadius: '8px 8px 0 0',
                fontSize: '0.9375rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                position: 'relative',
                bottom: '-2px',
              }}
              onMouseEnter={e => {
                if (activeTab !== 'reviews') {
                  e.currentTarget.style.background = '#f8f9fa'
                  e.currentTarget.style.color = '#063c7a'
                }
              }}
              onMouseLeave={e => {
                if (activeTab !== 'reviews') {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#666'
                }
              }}
            >
              Reviews ({reviews.length})
            </button>
          </div>
        </div>

        {/* Profile Warning */}
        {!user.profileCompleted && (
          <div
            style={{
              background: '#fff4e6',
              border: '1px solid #ffa94d',
              padding: '1.5rem',
              borderRadius: '12px',
              marginBottom: '2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
              <AlertCircle size={24} color="#f76707" strokeWidth={2} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <div>
                <div style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1a1a1a' }}>
                  Complete Your Company Profile
                </div>
                <p style={{ fontSize: '0.9375rem', color: '#666', margin: 0 }}>
                  Add your company information to build trust with workers and get better applications!
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/profile')}
              style={{
                background: '#063c7a',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.9375rem',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#084d99'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#063c7a'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Complete Profile
            </button>
          </div>
        )}

        {/* My Tasks Tab Content */}
        {activeTab === 'myTasks' && (
          <>
            {/* Stats Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
                      background: 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Clock size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1a1a1a' }}>{activeTasks}</div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>Active Tasks</div>
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
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1a1a1a' }}>{completedTasks}</div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>Completed Tasks</div>
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
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Users size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1a1a1a' }}>{totalApplications}</div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>Total Applications</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
                marginBottom: '2.5rem',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1a1a1a' }}>
                Quick Actions
              </h2>
              <div
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}
              >
                <button
                  onClick={() => router.push('/tasks/create')}
                  style={{
                    padding: '1.25rem',
                    background: '#063c7a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 14px rgba(6, 60, 122, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(6, 60, 122, 0.4)'
                    e.currentTarget.style.background = '#084d99'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(6, 60, 122, 0.3)'
                    e.currentTarget.style.background = '#063c7a'
                  }}
                >
                  <Plus size={20} strokeWidth={2} />
                  Post New Task
                </button>
                <button
                  onClick={() => router.push('/profile')}
                  style={{
                    padding: '1.25rem',
                    background: 'white',
                    color: '#063c7a',
                    border: '2px solid #063c7a',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#f0f4f8'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'white'
                  }}
                >
                  <Users size={20} strokeWidth={2} />
                  View Profile
                </button>
              </div>
            </div>

            {/* My Posted Tasks */}
            <div
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FileText size={24} color="#063c7a" strokeWidth={2} />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1a1a1a', margin: 0 }}>
                    My Posted Tasks ({tasks.length})
                  </h2>
                </div>
                <button
                  onClick={() => router.push('/tasks/create')}
                  style={{
                    padding: '0.625rem 1.25rem',
                    background: '#063c7a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#084d99'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#063c7a'
                  }}
                >
                  <Plus size={16} strokeWidth={2} />
                  Post New Task
                </button>
              </div>

              {loading ? (
                <div
                  style={{
                    padding: '3rem',
                    textAlign: 'center',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px dashed #e0e0e0',
                  }}
                >
                  <Clock size={32} color="#999" strokeWidth={2} style={{ margin: '0 auto 1rem' }} />
                  <p style={{ color: '#666', margin: 0 }}>Loading tasks...</p>
                </div>
              ) : tasks.length === 0 ? (
                <div
                  style={{
                    padding: '3rem',
                    textAlign: 'center',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px dashed #e0e0e0',
                  }}
                >
                  <FileText size={48} color="#ccc" strokeWidth={2} style={{ margin: '0 auto 1rem' }} />
                  <p style={{ color: '#666', fontSize: '1rem', marginBottom: '0.5rem' }}>No tasks posted yet</p>
                  <p style={{ color: '#999', fontSize: '0.875rem', margin: 0 }}>Click "Post New Task" to get started</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {tasks.map(task => (
                    <div
                      key={task._id}
                      style={{
                        padding: '1.5rem',
                        background: '#f8f9fa',
                        borderRadius: '10px',
                        border: '1px solid #e0e0e0',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onClick={() => router.push(`/tasks/${task._id}`)}
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
                          alignItems: 'start',
                          marginBottom: '0.75rem',
                          gap: '1rem',
                        }}
                      >
                        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#1a1a1a' }}>
                          {task.title}
                        </h3>
                        <span
                          style={{
                            padding: '0.375rem 0.75rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background:
                              task.status === 'OPEN'
                                ? '#d1fae5'
                                : task.status === 'IN_PROGRESS'
                                ? '#dbeafe'
                                : '#e5e7eb',
                            color:
                              task.status === 'OPEN'
                                ? '#065f46'
                                : task.status === 'IN_PROGRESS'
                                ? '#1e40af'
                                : '#374151',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p style={{ color: '#666', fontSize: '0.9375rem', margin: '0 0 1rem 0', lineHeight: '1.5' }}>
                        {task.description.substring(0, 120)}...
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          gap: '1.5rem',
                          fontSize: '0.875rem',
                          color: '#666',
                          marginBottom: '1rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <DollarSign size={16} color="#063c7a" strokeWidth={2} />
                          <strong>৳{task.budget}</strong>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <FileText size={16} color="#063c7a" strokeWidth={2} />
                          {task.category.replace('_', ' ')}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          📍 {task.location.city}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            router.push(`/tasks/${task._id}`)
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
                          View Details
                        </button>
                        {task.status === 'OPEN' && (
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              fetchApplications(task._id)
                            }}
                            style={{
                              padding: '0.5rem 1rem',
                              background: 'white',
                              color: '#063c7a',
                              border: '1px solid #063c7a',
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
                              e.currentTarget.style.background = '#f0f4f8'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'white'
                            }}
                          >
                            <Users size={14} strokeWidth={2} />
                            View Applications ({task.applicationCount || 0})
                          </button>
                        )}
                      </div>
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
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1rem',
                    }}
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
                      <p style={{ fontSize: '0.95rem' }}>
                        Applications will appear here once workers apply to this task.
                      </p>
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

                          <div
                            style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}
                          >
                            <div
                              style={{
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#6c757d',
                                marginBottom: '0.5rem',
                              }}
                            >
                              📝 Cover Letter:
                            </div>
                            <p style={{ color: '#495057', lineHeight: '1.6', fontSize: '0.95rem' }}>
                              {app.coverLetter}
                            </p>
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
                                <span style={{ fontWeight: '600' }}>⏱️ Estimated Time:</span>{' '}
                                {app.estimatedCompletionTime} hours
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
          </>
        )}

        {/* In Progress Tasks Tab Content */}
        {activeTab === 'inProgress' && (
          <ClientInProgressTasks
            tasks={inProgressTasks}
            onMarkReceived={handleMarkReceived}
            onMakePayment={handleMakePayment}
            onRespondExtension={handleRespondExtension}
            onRefresh={fetchInProgressTasks}
          />
        )}

        {/* Reviews Tab Content */}
        {activeTab === 'reviews' && (
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              marginTop: '2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Star size={24} color="white" strokeWidth={2} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>My Reviews</h2>
                <p style={{ color: '#666', fontSize: '0.875rem', margin: 0 }}>Reviews you've submitted for workers</p>
              </div>
            </div>

            {loadingReviews ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: '#666' }}>Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3rem',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  border: '2px dashed #dee2e6',
                }}
              >
                <Star size={48} color="#ccc" strokeWidth={2} style={{ margin: '0 auto 1rem' }} />
                <p style={{ color: '#666', fontSize: '1rem', marginBottom: '0.5rem' }}>No reviews yet</p>
                <p style={{ color: '#999', fontSize: '0.875rem' }}>
                  Complete tasks and review workers to help the community!
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {reviews.map((review: any) => (
                  <div
                    key={review._id}
                    style={{
                      background: '#f8f9fa',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '1rem',
                        flexWrap: 'wrap',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        {/* Worker Info */}
                        <div style={{ marginBottom: '0.75rem' }}>
                          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Worker</div>
                          <div style={{ fontWeight: '600', color: '#1a1a1a', fontSize: '1rem' }}>
                            {review.workerId?.firstName} {review.workerId?.lastName}
                          </div>
                        </div>

                        {/* Task Info */}
                        {review.taskId && (
                          <div style={{ marginBottom: '0.75rem' }}>
                            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Task</div>
                            <div style={{ fontWeight: '600', color: '#1a1a1a', fontSize: '0.875rem' }}>
                              {review.taskId.title}
                            </div>
                          </div>
                        )}

                        {/* Rating */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              size={20}
                              fill={star <= review.rating ? '#fbbf24' : 'none'}
                              color={star <= review.rating ? '#fbbf24' : '#d1d5db'}
                              strokeWidth={2}
                            />
                          ))}
                          <span style={{ marginLeft: '0.25rem', fontWeight: '600', color: '#1a1a1a' }}>
                            {review.rating}/5
                          </span>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.875rem', color: '#666' }}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <div
                        style={{
                          background: 'white',
                          padding: '1rem',
                          borderRadius: '8px',
                          marginBottom: '1rem',
                          borderLeft: '3px solid #fbbf24',
                        }}
                      >
                        <p style={{ color: '#374151', lineHeight: '1.6', margin: 0 }}>"{review.comment}"</p>
                      </div>
                    )}

                    {/* Detailed Ratings */}
                    {(review.professionalism || review.communication || review.quality || review.timeliness) && (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                          gap: '1rem',
                          marginBottom: '1rem',
                        }}
                      >
                        {review.professionalism && (
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>
                              Professionalism
                            </div>
                            <div style={{ fontWeight: '600', color: '#1a1a1a' }}>{review.professionalism}/5</div>
                          </div>
                        )}
                        {review.communication && (
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>
                              Communication
                            </div>
                            <div style={{ fontWeight: '600', color: '#1a1a1a' }}>{review.communication}/5</div>
                          </div>
                        )}
                        {review.quality && (
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>Quality</div>
                            <div style={{ fontWeight: '600', color: '#1a1a1a' }}>{review.quality}/5</div>
                          </div>
                        )}
                        {review.timeliness && (
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>
                              Timeliness
                            </div>
                            <div style={{ fontWeight: '600', color: '#1a1a1a' }}>{review.timeliness}/5</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Would Hire Again Badge */}
                    {review.wouldHireAgain && (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          background: '#dcfce7',
                          color: '#16a34a',
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                        }}
                      >
                        <CheckCircle size={16} />
                        Would hire again
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
