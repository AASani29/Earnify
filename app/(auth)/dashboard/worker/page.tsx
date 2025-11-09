'use client'

import { useJWTAuthContext } from '@/config/Auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AuthNavbar from '@/components/AuthNavbar'
import WorkerInProgressTasks from '@/components/WorkerInProgressTasks'
import SupportChatbot from '@/components/SupportChatbot'
import {
  Briefcase,
  Search,
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
  AlertCircle,
  Eye,
  FileText,
  DollarSign,
  TrendingUp,
  Star,
  User as UserIcon,
  Calendar,
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
  const [reviews, setReviews] = useState<any[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(true)
  const [inProgressTasks, setInProgressTasks] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'available' | 'inProgress' | 'reviews'>('available')
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    status: 'OPEN',
  })
  const [workerProfile, setWorkerProfile] = useState<any>(null)

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
      fetchInProgressTasks()
      fetchAIRecommendations()
      fetchReviews()
      fetchWorkerProfile()
    }
  }, [user, filters])

  const fetchWorkerProfile = async () => {
    try {
      const token = getAccessToken()
      const response = await fetch('/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setWorkerProfile(data.profile)
      }
    } catch (error) {
      console.error('Error fetching worker profile:', error)
    }
  }

  const calculateProfileCompletion = () => {
    if (!workerProfile) return 0

    const fields = [
      { key: 'bio', weight: 15 },
      { key: 'skills', weight: 25, isArray: true, minLength: 3 },
      { key: 'experience', weight: 15 },
      { key: 'hourlyRate', weight: 10 },
      { key: 'city', weight: 10 },
      { key: 'area', weight: 10 },
      { key: 'availability', weight: 5 },
      { key: 'phoneNumber', weight: 10, source: 'user' },
    ]

    let totalScore = 0

    fields.forEach(field => {
      const value = field.source === 'user' ? (user as any)?.[field.key] : workerProfile[field.key]

      if (field.isArray) {
        if (Array.isArray(value) && value.length >= (field.minLength || 1)) {
          totalScore += field.weight
        }
      } else {
        if (value !== undefined && value !== null && value !== '') {
          totalScore += field.weight
        }
      }
    })

    return Math.min(totalScore, 100)
  }

  const profileCompletion = calculateProfileCompletion()

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

  const fetchReviews = async () => {
    if (!user) return
    try {
      setLoadingReviews(true)
      const response = await fetch(`/api/reviews?workerId=${user.id}`)

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
      const response = await fetch(`/api/tasks?assignedWorkerId=${user.id}&status=IN_PROGRESS`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setInProgressTasks(data.tasks || [])
      }
    } catch (error) {
      console.error('Error fetching in-progress tasks:', error)
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

  const handleDeliverTask = async (taskId: string, message: string) => {
    try {
      const accessToken = getAccessToken()
      console.log('Delivering task:', taskId, 'with message:', message)
      const response = await fetch(`/api/tasks/${taskId}/deliver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ deliveryMessage: message }),
      })

      const data = await response.json()
      console.log('Deliver response:', data)

      if (!response.ok) {
        throw new Error(data.message || 'Failed to deliver task')
      }
    } catch (error) {
      console.error('Error in handleDeliverTask:', error)
      throw error
    }
  }

  const handleRequestExtension = async (taskId: string, message: string, newDeadline: string) => {
    try {
      const accessToken = getAccessToken()
      console.log('Requesting extension for task:', taskId, 'message:', message, 'newDeadline:', newDeadline)
      const response = await fetch(`/api/tasks/${taskId}/request-extension`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ requestMessage: message, newDeadline }),
      })

      const data = await response.json()
      console.log('Extension request response:', data)

      if (!response.ok) {
        throw new Error(data.message || 'Failed to request extension')
      }
    } catch (error) {
      console.error('Error in handleRequestExtension:', error)
      throw error
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
        <div style={{ marginBottom: '2rem' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}
          >
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>Worker Dashboard</h1>

            {/* Profile Complete Badge - Only show when 100% */}
            {workerProfile && profileCompletion === 100 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  borderRadius: '8px',
                  boxShadow: '0 2px 6px rgba(40, 167, 69, 0.2)',
                }}
              >
                <CheckCircle size={18} style={{ color: 'white' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'white' }}>Profile Complete</span>
              </div>
            )}
          </div>
          <p style={{ color: '#666', fontSize: '1rem' }}>
            Welcome back, {user.firstName}! Find and apply for tasks below
          </p>

          {/* Profile Completion Indicator - Only show when less than 100% */}
          {workerProfile && profileCompletion < 100 && (
            <div
              style={{
                marginTop: '1.5rem',
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserIcon size={18} style={{ color: '#063c7a' }} />
                  <span style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1a1a1a' }}>Profile Completion</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: '700', color: '#063c7a' }}>
                    {profileCompletion}%
                  </span>
                  <button
                    onClick={() => router.push('/profile')}
                    style={{
                      padding: '0.375rem 0.875rem',
                      background: 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(6, 60, 122, 0.3)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    Complete Profile
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  background: '#f0f0f0',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: `${profileCompletion}%`,
                    height: '100%',
                    background:
                      profileCompletion >= 80
                        ? 'linear-gradient(90deg, #063c7a 0%, #084d99 100%)'
                        : profileCompletion >= 50
                        ? 'linear-gradient(90deg, #084d99 0%, #0a5fb8 100%)'
                        : 'linear-gradient(90deg, #6c757d 0%, #868e96 100%)',
                    borderRadius: '8px',
                    transition: 'width 0.5s ease-in-out',
                  }}
                />
              </div>

              {/* Helpful Message */}
              <p style={{ fontSize: '0.8125rem', color: '#666', marginTop: '0.75rem', marginBottom: 0 }}>
                {profileCompletion >= 80
                  ? 'Almost there! Complete your profile to maximize your visibility to potential clients.'
                  : profileCompletion >= 50
                  ? 'Good progress! Add more details to stand out and get better task recommendations.'
                  : 'Complete your profile to increase your chances of being hired and get personalized task recommendations.'}
              </p>
            </div>
          )}

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
              onClick={() => setActiveTab('available')}
              style={{
                padding: '0.875rem 1.75rem',
                background:
                  activeTab === 'available' ? 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)' : 'transparent',
                color: activeTab === 'available' ? 'white' : '#666',
                border: 'none',
                borderBottom: activeTab === 'available' ? '3px solid #063c7a' : '3px solid transparent',
                borderRadius: '8px 8px 0 0',
                fontSize: '0.9375rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                position: 'relative',
                bottom: '-2px',
              }}
              onMouseEnter={e => {
                if (activeTab !== 'available') {
                  e.currentTarget.style.background = '#f8f9fa'
                  e.currentTarget.style.color = '#063c7a'
                }
              }}
              onMouseLeave={e => {
                if (activeTab !== 'available') {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#666'
                }
              }}
            >
              Available Tasks
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

        {/* Filters - Only show on Available Tasks tab */}
        {activeTab === 'available' && (
          <div
            style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid #e0e0e0',
              marginBottom: '2rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              {/* Search */}
              <div style={{ flex: '1 1 300px', position: 'relative' }}>
                <Search
                  size={18}
                  color="#999"
                  style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}
                />
                <input
                  type="text"
                  placeholder="Search tasks by title or description..."
                  value={filters.search}
                  onChange={e => setFilters({ ...filters, search: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem 0.875rem 3rem',
                    fontSize: '0.9375rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '10px',
                    outline: 'none',
                    transition: 'all 0.3s',
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
                />
              </div>

              {/* Category Filter */}
              <div style={{ flex: '0 1 200px' }}>
                <select
                  value={filters.category}
                  onChange={e => setFilters({ ...filters, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    fontSize: '0.9375rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '10px',
                    outline: 'none',
                    transition: 'all 0.3s',
                    boxSizing: 'border-box',
                    background: 'white',
                    fontWeight: '500',
                    color: filters.category ? '#063c7a' : '#666',
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

              {/* Status Filter */}
              <div style={{ flex: '0 1 150px' }}>
                <select
                  value={filters.status}
                  onChange={e => setFilters({ ...filters, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    fontSize: '0.9375rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '10px',
                    outline: 'none',
                    transition: 'all 0.3s',
                    boxSizing: 'border-box',
                    background: 'white',
                    fontWeight: '500',
                    color: filters.status ? '#063c7a' : '#666',
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

              {/* Clear Filters Button */}
              {(filters.search || filters.category || filters.status) && (
                <button
                  onClick={() => setFilters({ category: '', search: '', status: 'OPEN' })}
                  style={{
                    padding: '0.875rem 1.25rem',
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#666',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#dc3545'
                    e.currentTarget.style.color = 'white'
                    e.currentTarget.style.borderColor = '#dc3545'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'white'
                    e.currentTarget.style.color = '#666'
                    e.currentTarget.style.borderColor = '#e0e0e0'
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Available Tasks Tab Content */}
        {activeTab === 'available' && (
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
                          <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
                            ৳{task.budget}
                          </span>
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
        )}

        {/* In Progress Tasks Tab Content */}
        {activeTab === 'inProgress' && (
          <WorkerInProgressTasks
            tasks={inProgressTasks}
            onDeliver={handleDeliverTask}
            onRequestExtension={handleRequestExtension}
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
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>Reviews Received</h2>
                <p style={{ color: '#666', fontSize: '0.875rem', margin: 0 }}>
                  Feedback from clients you've worked with
                </p>
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
                <p style={{ color: '#999', fontSize: '0.875rem' }}>Complete tasks to receive reviews from clients!</p>
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
                        {/* Client Info */}
                        <div style={{ marginBottom: '0.75rem' }}>
                          <div
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}
                          >
                            <UserIcon size={16} color="#666" />
                            <span style={{ fontWeight: '600', color: '#1a1a1a', fontSize: '1rem' }}>
                              {review.clientId?.companyName ||
                                `${review.clientId?.firstName} ${review.clientId?.lastName}`}
                            </span>
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

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: '#666',
                          fontSize: '0.875rem',
                        }}
                      >
                        <Calendar size={14} />
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

      {/* Support Chatbot */}
      <SupportChatbot />
    </div>
  )
}
