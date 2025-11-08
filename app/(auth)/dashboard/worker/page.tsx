'use client'

import { useJWTAuthContext } from '@/config/Auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AuthNavbar from '@/components/AuthNavbar'
import {
  Briefcase,
  Search,
  Filter,
  Truck,
  Sparkles,
  Laptop,
  Wrench,
  BookOpen,
  Camera,
  PenTool,
  Palette,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  FileText,
  DollarSign,
  TrendingUp,
} from 'lucide-react'

const categories = [
  { value: '', label: 'All Categories', icon: null },
  { value: 'DELIVERY', label: 'Delivery', icon: Truck },
  { value: 'CLEANING', label: 'Cleaning', icon: Sparkles },
  { value: 'TECH_SUPPORT', label: 'Tech Support', icon: Laptop },
  { value: 'HANDYMAN', label: 'Handyman', icon: Wrench },
  { value: 'TUTORING', label: 'Tutoring', icon: BookOpen },
  { value: 'PHOTOGRAPHY', label: 'Photography', icon: Camera },
  { value: 'WRITING', label: 'Writing', icon: PenTool },
  { value: 'DESIGN', label: 'Design', icon: Palette },
  { value: 'OTHER', label: 'Other', icon: Package },
]

export default function WorkerDashboardPage() {
  const { user, logout, isLoggedIn, controller } = useJWTAuthContext()
  const router = useRouter()
  const [tasks, setTasks] = useState<any[]>([])
  const [myApplications, setMyApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([])
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(true)
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
      fetchAIRecommendations()
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

  const fetchAIRecommendations = async () => {
    if (!user) return
    try {
      setLoadingRecommendations(true)
      const accessToken = getAccessToken()
      const response = await fetch('/api/ai/recommend-tasks', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setAiRecommendations(data.recommendations || [])
      } else {
        const errorData = await response.json()
        console.log('AI recommendations error:', errorData)
        // Don't show recommendations section if profile not found
        if (response.status === 404) {
          setAiRecommendations([])
        }
      }
    } catch (error) {
      console.error('Error fetching AI recommendations:', error)
    } finally {
      setLoadingRecommendations(false)
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
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <AuthNavbar />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Briefcase size={32} color="#063c7a" strokeWidth={2} />
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>Worker Dashboard</h1>
          </div>
          <p style={{ color: '#666', fontSize: '1rem', marginLeft: '2.75rem' }}>
            Welcome back, {user.firstName}! Find and apply for tasks below
          </p>
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
                  Complete Your Profile
                </div>
                <p style={{ fontSize: '0.9375rem', color: '#666', margin: 0 }}>
                  Add your skills, experience, and portfolio to increase your chances of getting hired!
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
            onClick={() => router.push('/applications')}
            style={{
              background: 'white',
              padding: '1.75rem',
              borderRadius: '12px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#f59e0b'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.2)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#e0e0e0'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
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
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1a1a1a' }}>{stats.activeApplications}</div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>Pending Applications</div>
              </div>
            </div>
          </div>

          <div
            onClick={() => router.push('/applications')}
            style={{
              background: 'white',
              padding: '1.75rem',
              borderRadius: '12px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#10b981'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#e0e0e0'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
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
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1a1a1a' }}>{stats.acceptedTasks}</div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>Accepted Tasks</div>
              </div>
            </div>
          </div>

          <div
            onClick={() => router.push('/applications')}
            style={{
              background: 'white',
              padding: '1.75rem',
              borderRadius: '12px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#063c7a'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 60, 122, 0.2)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#e0e0e0'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
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
                <TrendingUp size={24} color="white" strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1a1a1a' }}>{stats.totalApplications}</div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>Total Applications</div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations Section */}
        {showRecommendations && aiRecommendations.length > 0 && (
          <div
            style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid #bae6fd',
              marginBottom: '2.5rem',
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sparkles size={20} color="white" strokeWidth={2} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1a1a1a', margin: 0 }}>
                    AI Recommended Tasks for You
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: '#666', margin: '0.25rem 0 0 0' }}>
                    Based on your skills, location, and ratings
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRecommendations(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  padding: '0.5rem',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {loadingRecommendations ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: '#666' }}>Loading AI recommendations...</p>
              </div>
            ) : (
              <div
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}
              >
                {aiRecommendations.slice(0, 3).map((rec: any) => (
                  <div
                    key={rec.task._id}
                    style={{
                      background: 'white',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      border: '1px solid #e0e0e0',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                    }}
                    onClick={() => router.push(`/tasks/${rec.task._id}`)}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 60, 122, 0.15)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '1rem',
                      }}
                    >
                      <span
                        style={{
                          background: '#d1fae5',
                          color: '#065f46',
                          padding: '0.375rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                        }}
                      >
                        {rec.task.category}
                      </span>
                      <div
                        style={{
                          background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                          color: 'white',
                          padding: '0.375rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <Sparkles size={12} strokeWidth={2} />
                        {rec.matchScore}% Match
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '0.75rem' }}>
                      {rec.task.title}
                    </h3>

                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: '#666',
                        marginBottom: '1rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {rec.task.description}
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <DollarSign size={16} color="#063c7a" strokeWidth={2} />
                        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1a1a1a' }}>
                          ৳{rec.task.budget}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={16} color="#666" strokeWidth={2} />
                        <span style={{ fontSize: '0.875rem', color: '#666' }}>
                          {rec.task.estimatedDuration ? `${rec.task.estimatedDuration}h` : 'Not specified'}
                        </span>
                      </div>
                    </div>

                    {rec.matchReasons && rec.matchReasons.length > 0 && (
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e0e0e0' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#666', marginBottom: '0.5rem' }}>
                          Why this matches:
                        </p>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.75rem', color: '#666' }}>
                          {rec.matchReasons.slice(0, 2).map((reason: string, idx: number) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div
          style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
            marginBottom: '2.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Filter size={24} color="#063c7a" strokeWidth={2} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1a1a1a', margin: 0 }}>
              Find Available Tasks
            </h2>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  color: '#1a1a1a',
                }}
              >
                Search
              </label>
              <div style={{ position: 'relative' }}>
                <Search
                  size={18}
                  color="#999"
                  style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={filters.search}
                  onChange={e => setFilters({ ...filters, search: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 3rem',
                    fontSize: '0.9375rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = '#063c7a'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 60, 122, 0.1)'
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = '#e0e0e0'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  color: '#1a1a1a',
                }}
              >
                Category
              </label>
              <select
                value={filters.category}
                onChange={e => setFilters({ ...filters, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '0.9375rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                  background: 'white',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#063c7a'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 60, 122, 0.1)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = '#e0e0e0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  color: '#1a1a1a',
                }}
              >
                Status
              </label>
              <select
                value={filters.status}
                onChange={e => setFilters({ ...filters, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '0.9375rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                  background: 'white',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#063c7a'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 60, 122, 0.1)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = '#e0e0e0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
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
        <div
          style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <FileText size={24} color="#063c7a" strokeWidth={2} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1a1a1a', margin: 0 }}>
              Available Tasks ({tasks.length})
            </h2>
          </div>

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
              <Clock size={48} color="#999" strokeWidth={2} style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: '#666', margin: 0 }}>Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px dashed #e0e0e0',
              }}
            >
              <FileText size={48} color="#ccc" strokeWidth={2} style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: '#666', fontSize: '1rem', marginBottom: '0.5rem' }}>No tasks found</p>
              <p style={{ color: '#999', fontSize: '0.875rem', margin: 0 }}>
                Try adjusting your filters or check back later
              </p>
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
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1a1a1a' }}
                      >
                        {task.title}
                      </h3>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            padding: '0.375rem 0.75rem',
                            background: '#e3f2fd',
                            color: '#063c7a',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                          }}
                        >
                          {task.category.replace('_', ' ')}
                        </span>
                        <span
                          style={{
                            padding: '0.375rem 0.75rem',
                            background: task.status === 'OPEN' ? '#d1fae5' : '#fff3cd',
                            color: task.status === 'OPEN' ? '#065f46' : '#92400e',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                          }}
                        >
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', justifyContent: 'flex-end' }}
                      >
                        <DollarSign size={20} color="#10b981" strokeWidth={2} />
                        <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>৳{task.budget}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>BDT</div>
                    </div>
                  </div>

                  <p style={{ color: '#666', marginBottom: '1rem', lineHeight: '1.5', fontSize: '0.9375rem' }}>
                    {task.description.length > 150 ? task.description.substring(0, 150) + '...' : task.description}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      gap: '1.5rem',
                      flexWrap: 'wrap',
                      fontSize: '0.875rem',
                      color: '#666',
                      marginBottom: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      📍 {task.location?.city}, {task.location?.district}
                    </div>
                    {task.estimatedDuration && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Clock size={14} color="#063c7a" strokeWidth={2} />
                        {task.estimatedDuration}h
                      </div>
                    )}
                    {task.deadline && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        📅 {new Date(task.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>

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
                    View Details & Apply
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
