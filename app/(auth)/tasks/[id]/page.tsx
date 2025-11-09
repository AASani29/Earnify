'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useJWTAuthContext } from '@/config/Auth'
import AuthNavbar from '@/components/AuthNavbar'
import ReviewForm from '@/components/ReviewForm'
import {
  FileText,
  DollarSign,
  MapPin,
  Calendar,
  Clock,
  User,
  Users,
  Briefcase,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Send,
  Wrench,
  Sparkles,
  Star,
  MapPinIcon,
} from 'lucide-react'

export default function TaskDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { user, controller, isLoggedIn } = useJWTAuthContext()
  const [task, setTask] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    proposedBudget: '',
    estimatedCompletionTime: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([])
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [existingReview, setExistingReview] = useState<any>(null)
  const [loadingReview, setLoadingReview] = useState(false)

  // Get access token from controller
  const getAccessToken = () => controller.getAccessToken()

  useEffect(() => {
    fetchTask()
  }, [params.id])

  useEffect(() => {
    if (task && user && user.role === 'CLIENT' && task.clientId._id === user.id) {
      fetchAIRecommendations()
      if (task.status === 'COMPLETED' && task.assignedWorkerId) {
        checkExistingReview()
      }
    }
  }, [task, user])

  const fetchTask = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tasks/${params.id}`)

      if (!response.ok) {
        throw new Error('Failed to fetch task')
      }

      const data = await response.json()
      setTask(data.task)
    } catch (err: any) {
      console.error('Error fetching task:', err)
      setError('Failed to fetch task')
    } finally {
      setLoading(false)
    }
  }

  const fetchAIRecommendations = async () => {
    try {
      setLoadingRecommendations(true)
      const accessToken = getAccessToken()
      const response = await fetch(`/api/ai/recommend-workers?taskId=${params.id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAiRecommendations(data.recommendations || [])
      }
    } catch (error) {
      console.error('Error fetching AI recommendations:', error)
    } finally {
      setLoadingRecommendations(false)
    }
  }

  const checkExistingReview = async () => {
    try {
      setLoadingReview(true)
      const response = await fetch(`/api/reviews?taskId=${params.id}`)

      if (response.ok) {
        const data = await response.json()
        if (data.reviews && data.reviews.length > 0) {
          setExistingReview(data.reviews[0])
        }
      }
    } catch (error) {
      console.error('Error checking existing review:', error)
    } finally {
      setLoadingReview(false)
    }
  }

  const handleReviewSubmitSuccess = () => {
    setShowReviewForm(false)
    checkExistingReview()
    fetchTask() // Refresh task data
  }

  const handleApplicationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setApplicationData({
      ...applicationData,
      [e.target.name]: e.target.value,
    })
  }

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const data = {
        coverLetter: applicationData.coverLetter,
        proposedBudget: applicationData.proposedBudget ? parseFloat(applicationData.proposedBudget) : undefined,
        estimatedCompletionTime: applicationData.estimatedCompletionTime
          ? parseFloat(applicationData.estimatedCompletionTime)
          : undefined,
      }

      const accessToken = getAccessToken()
      const response = await fetch(`/api/tasks/${params.id}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit application')
      }

      alert('Application submitted successfully!')
      setShowApplicationForm(false)
      router.push('/dashboard/worker')
    } catch (err: any) {
      console.error('Error submitting application:', err)
      setError(err.message || 'Failed to submit application')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#ffffff' }}>
        <AuthNavbar />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 80px)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <Loader2
              size={64}
              color="#063c7a"
              strokeWidth={2}
              style={{ margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }}
            />
            <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1a1a1a' }}>Loading task details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !task) {
    return (
      <div style={{ minHeight: '100vh', background: '#ffffff' }}>
        <AuthNavbar />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 80px)',
            padding: '1rem',
          }}
        >
          <div
            style={{
              maxWidth: '500px',
              textAlign: 'center',
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid #e0e0e0',
            }}
          >
            <AlertCircle size={64} color="#dc2626" strokeWidth={2} style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: '#dc2626', marginBottom: '1.5rem', fontSize: '1rem' }}>{error}</p>
            <button
              onClick={() => router.back()}
              style={{
                width: '100%',
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
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!task) return null

  const isWorker = user?.role === 'WORKER'
  const isClient = user?.role === 'CLIENT'
  const isOwner = task.clientId._id === user?.id

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <AuthNavbar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'white',
            color: '#666',
            border: '1px solid #e0e0e0',
            padding: '0.625rem 1.25rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.875rem',
            marginBottom: '2rem',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#f0f4f8'
            e.currentTarget.style.borderColor = '#063c7a'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'white'
            e.currentTarget.style.borderColor = '#e0e0e0'
          }}
        >
          <ArrowLeft size={16} strokeWidth={2} />
          Back
        </button>

        {/* Task Header */}
        <div
          style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div style={{ flex: 1, minWidth: '300px' }}>
              <h1
                style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#1a1a1a',
                  marginBottom: '1rem',
                  lineHeight: '1.2',
                }}
              >
                {task.title}
              </h1>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#666',
                  fontSize: '0.9375rem',
                  marginBottom: '0.5rem',
                }}
              >
                <User size={16} color="#063c7a" strokeWidth={2} />
                <span>
                  Posted by{' '}
                  <strong style={{ color: '#1a1a1a' }}>
                    {task.clientId.firstName} {task.clientId.lastName}
                  </strong>
                </span>
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
                <Calendar size={16} color="#063c7a" strokeWidth={2} />
                <span>Posted on {new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-end' }}>
              <span
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  background:
                    task.status === 'OPEN'
                      ? '#d1fae5'
                      : task.status === 'IN_PROGRESS'
                      ? '#dbeafe'
                      : task.status === 'COMPLETED'
                      ? '#e5e7eb'
                      : '#fee2e2',
                  color:
                    task.status === 'OPEN'
                      ? '#065f46'
                      : task.status === 'IN_PROGRESS'
                      ? '#1e40af'
                      : task.status === 'COMPLETED'
                      ? '#374151'
                      : '#991b1b',
                }}
              >
                {task.status.replace('_', ' ')}
              </span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>Budget</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1a1a1a' }}>
                  ৳{task.budget.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#999' }}>BDT</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
            marginBottom: '2rem',
          }}
        >
          {/* Key Info Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                padding: '1.5rem',
                background: '#f8f9fa',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Briefcase size={18} color="#063c7a" strokeWidth={2} />
                <div style={{ fontSize: '0.875rem', color: '#666', fontWeight: '600' }}>Category</div>
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1a1a1a' }}>
                {task.category.replace('_', ' ')}
              </div>
            </div>
            <div
              style={{
                padding: '1.5rem',
                background: '#f8f9fa',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Clock size={18} color="#063c7a" strokeWidth={2} />
                <div style={{ fontSize: '0.875rem', color: '#666', fontWeight: '600' }}>Duration</div>
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1a1a1a' }}>
                {task.estimatedDuration ? `${task.estimatedDuration} hours` : 'Flexible'}
              </div>
            </div>
            <div
              style={{
                padding: '1.5rem',
                background: '#f8f9fa',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Calendar size={18} color="#063c7a" strokeWidth={2} />
                <div style={{ fontSize: '0.875rem', color: '#666', fontWeight: '600' }}>Deadline</div>
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1a1a1a' }}>
                {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Flexible'}
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '2rem' }}>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#1a1a1a',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <FileText size={20} color="#063c7a" strokeWidth={2} />
              Task Description
            </h2>
            <div
              style={{
                background: '#f8f9fa',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
              }}
            >
              <p
                style={{
                  color: '#495057',
                  lineHeight: '1.8',
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.9375rem',
                  margin: 0,
                }}
              >
                {task.description}
              </p>
            </div>
          </div>

          {/* Location */}
          <div style={{ marginBottom: '2rem' }}>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#1a1a1a',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <MapPin size={20} color="#063c7a" strokeWidth={2} />
              Location
            </h2>
            <div
              style={{
                background: '#f8f9fa',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  fontSize: '0.9375rem',
                  color: '#495057',
                }}
              >
                <MapPin size={16} color="#666" strokeWidth={2} style={{ marginTop: '0.125rem', flexShrink: 0 }} />
                <span>{task.location.address}</span>
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#666' }}
              >
                <span style={{ fontWeight: '600' }}>
                  {task.location.city}, {task.location.district}
                </span>
              </div>
            </div>
          </div>

          {/* Skills Required */}
          {task.skillsRequired && task.skillsRequired.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  color: '#1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Wrench size={20} color="#063c7a" strokeWidth={2} />
                Skills Required
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {task.skillsRequired.map((skill: string, index: number) => (
                  <span
                    key={index}
                    style={{
                      padding: '0.625rem 1rem',
                      background: '#f0f4f8',
                      color: '#063c7a',
                      border: '1px solid #d0dce8',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error" style={{ marginBottom: '1.5rem' }}>
              {error}
            </div>
          )}

          {/* Actions */}
          {isWorker && task.status === 'OPEN' && !showApplicationForm && (
            <button
              onClick={() => setShowApplicationForm(true)}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(6, 60, 122, 0.3)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(6, 60, 122, 0.4)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(6, 60, 122, 0.3)'
              }}
            >
              <Send size={20} strokeWidth={2} />
              Apply for this Task
            </button>
          )}

          {isClient && isOwner && (
            <button
              onClick={() => router.push(`/dashboard/client?taskId=${task._id}`)}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(6, 60, 122, 0.3)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(6, 60, 122, 0.4)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(6, 60, 122, 0.3)'
              }}
            >
              <Users size={20} strokeWidth={2} />
              Manage Applications
            </button>
          )}

          {/* AI Recommended Workers */}
          {isClient && isOwner && aiRecommendations.length > 0 && (
            <div
              style={{
                marginTop: '2rem',
                padding: '2rem',
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)',
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
                    AI Recommended Workers
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: '#666', margin: '0.25rem 0 0 0' }}>
                    Top matches based on skills, location, and ratings
                  </p>
                </div>
              </div>

              {loadingRecommendations ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <Loader2 size={32} color="#063c7a" strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }} />
                  <p style={{ color: '#666', marginTop: '1rem' }}>Finding the best workers for you...</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {aiRecommendations.slice(0, 5).map((rec: any) => (
                    <div
                      key={rec.worker.userId}
                      style={{
                        background: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        border: '1px solid #e0e0e0',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        transition: 'all 0.2s',
                      }}
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
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '1rem',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}
                          >
                            <User size={20} color="#063c7a" strokeWidth={2} />
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1a1a1a', margin: 0 }}>
                              {rec.worker.firstName} {rec.worker.lastName}
                            </h3>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            {rec.worker.rating.average > 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Star size={16} color="#f59e0b" fill="#f59e0b" strokeWidth={2} />
                                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1a1a1a' }}>
                                  {rec.worker.rating.average.toFixed(1)}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: '#666' }}>
                                  ({rec.worker.rating.count} reviews)
                                </span>
                              </div>
                            )}
                            {rec.worker.completedTasks > 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <CheckCircle size={16} color="#10b981" strokeWidth={2} />
                                <span style={{ fontSize: '0.875rem', color: '#666' }}>
                                  {rec.worker.completedTasks} tasks completed
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div
                          style={{
                            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                          }}
                        >
                          <Sparkles size={14} strokeWidth={2} />
                          {rec.matchScore}% Match
                        </div>
                      </div>

                      {rec.worker.bio && (
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
                          {rec.worker.bio}
                        </p>
                      )}

                      {rec.worker.skills && rec.worker.skills.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#666', marginBottom: '0.5rem' }}>
                            Skills:
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {rec.worker.skills.slice(0, 5).map((skill: string, idx: number) => (
                              <span
                                key={idx}
                                style={{
                                  background: '#f3f4f6',
                                  color: '#374151',
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: '500',
                                }}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        {rec.worker.hourlyRate && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <DollarSign size={16} color="#063c7a" strokeWidth={2} />
                            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1a1a1a' }}>
                              ৳{rec.worker.hourlyRate}/hr
                            </span>
                          </div>
                        )}
                        {rec.worker.location?.city && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPinIcon size={16} color="#666" strokeWidth={2} />
                            <span style={{ fontSize: '0.875rem', color: '#666' }}>
                              {rec.worker.location.city}
                              {rec.worker.location.area && `, ${rec.worker.location.area}`}
                            </span>
                          </div>
                        )}
                      </div>

                      {rec.matchReasons && rec.matchReasons.length > 0 && (
                        <div style={{ paddingTop: '1rem', borderTop: '1px solid #e0e0e0' }}>
                          <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#666', marginBottom: '0.5rem' }}>
                            Why this worker is a great match:
                          </p>
                          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.75rem', color: '#666' }}>
                            {rec.matchReasons.slice(0, 3).map((reason: string, idx: number) => (
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

          {/* Review Section - For Clients on Completed Tasks */}
          {isClient && isOwner && task.status === 'COMPLETED' && task.assignedWorkerId && (
            <div style={{ marginTop: '2rem' }}>
              {loadingReview ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <Loader2 size={32} color="#063c7a" strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }} />
                  <p style={{ color: '#666', marginTop: '1rem' }}>Loading review...</p>
                </div>
              ) : existingReview ? (
                <div
                  style={{
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                    padding: '2rem',
                    borderRadius: '12px',
                    border: '1px solid #86efac',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <CheckCircle size={24} color="#16a34a" strokeWidth={2} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1a1a1a', margin: 0 }}>
                      Review Submitted
                    </h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        size={24}
                        fill={star <= existingReview.rating ? '#fbbf24' : 'none'}
                        color={star <= existingReview.rating ? '#fbbf24' : '#d1d5db'}
                        strokeWidth={2}
                      />
                    ))}
                    <span style={{ marginLeft: '0.5rem', fontSize: '1.125rem', fontWeight: '600', color: '#1a1a1a' }}>
                      {existingReview.rating}/5
                    </span>
                  </div>
                  {existingReview.comment && (
                    <p style={{ color: '#374151', lineHeight: '1.6', marginBottom: '1rem' }}>
                      "{existingReview.comment}"
                    </p>
                  )}
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Reviewed on {new Date(existingReview.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ) : showReviewForm ? (
                <ReviewForm
                  taskId={task._id}
                  workerId={task.assignedWorkerId._id}
                  workerName={`${task.assignedWorkerId.firstName} ${task.assignedWorkerId.lastName}`}
                  onSubmitSuccess={handleReviewSubmitSuccess}
                  onCancel={() => setShowReviewForm(false)}
                />
              ) : (
                <div
                  style={{
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    padding: '2rem',
                    borderRadius: '12px',
                    border: '1px solid #fcd34d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1.5rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <Star size={24} color="#f59e0b" fill="#f59e0b" strokeWidth={2} />
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1a1a1a', margin: 0 }}>
                        Review {task.assignedWorkerId.firstName}
                      </h3>
                    </div>
                    <p style={{ color: '#78350f', margin: 0 }}>
                      This task is completed. Share your experience to help other clients!
                    </p>
                  </div>
                  <button
                    onClick={() => setShowReviewForm(true)}
                    style={{
                      background: '#063c7a',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#084d99'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#063c7a'
                    }}
                  >
                    Write Review
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Application Form */}
          {showApplicationForm && (
            <div
              style={{
                marginTop: '2rem',
                padding: '2rem',
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
              }}
            >
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '1.5rem',
                  color: '#1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Send size={20} color="#063c7a" strokeWidth={2} />
                Submit Your Application
              </h2>
              <form onSubmit={handleApply}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Cover Letter *
                  </label>
                  <textarea
                    name="coverLetter"
                    required
                    rows={6}
                    value={applicationData.coverLetter}
                    onChange={handleApplicationChange}
                    className="form-textarea"
                    placeholder="Explain why you're the best fit for this task... Highlight your relevant experience and skills."
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                  <small style={{ color: '#6c757d', fontSize: '0.875rem' }}>
                    Make a great first impression! Explain your qualifications and approach.
                  </small>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label
                      className="form-label"
                      style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}
                    >
                      Your Proposed Budget (৳ BDT)
                    </label>
                    <input
                      type="number"
                      name="proposedBudget"
                      min="0"
                      step="0.01"
                      value={applicationData.proposedBudget}
                      onChange={handleApplicationChange}
                      className="form-input"
                      placeholder={`Original: ৳${task.budget}`}
                      style={{ width: '100%' }}
                    />
                    <small style={{ color: '#6c757d', fontSize: '0.875rem' }}>
                      Optional: Propose your budget (leave blank to accept original)
                    </small>
                  </div>

                  <div>
                    <label
                      className="form-label"
                      style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}
                    >
                      Estimated Time (hours)
                    </label>
                    <input
                      type="number"
                      name="estimatedCompletionTime"
                      min="0"
                      step="0.5"
                      value={applicationData.estimatedCompletionTime}
                      onChange={handleApplicationChange}
                      className="form-input"
                      placeholder="e.g., 2.5"
                      style={{ width: '100%' }}
                    />
                    <small style={{ color: '#6c757d', fontSize: '0.875rem' }}>
                      How long will it take you to complete?
                    </small>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      flex: 1,
                      padding: '1rem',
                      background: submitting ? '#9ca3af' : 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={20} strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }} />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={20} strokeWidth={2} />
                        Submit Application
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowApplicationForm(false)}
                    style={{
                      padding: '1rem 2rem',
                      background: 'white',
                      color: '#666',
                      border: '1px solid #e0e0e0',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#f8f9fa'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'white'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
