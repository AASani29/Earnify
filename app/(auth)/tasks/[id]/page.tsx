'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useJWTAuthContext } from '@/config/Auth'
import AuthNavbar from '@/components/AuthNavbar'
import {
  FileText,
  DollarSign,
  MapPin,
  Calendar,
  Clock,
  User,
  Briefcase,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Send,
  Wrench,
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

  // Get access token from controller
  const getAccessToken = () => controller.getAccessToken()

  useEffect(() => {
    fetchTask()
  }, [params.id])

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
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: '12px',
                color: 'white',
              }}
            >
              <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>📂 Category</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{task.category.replace('_', ' ')}</div>
            </div>
            <div
              style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                borderRadius: '12px',
                color: 'white',
              }}
            >
              <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>⏱️ Duration</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                {task.estimatedDuration ? `${task.estimatedDuration} hours` : 'Flexible'}
              </div>
            </div>
            <div
              style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                borderRadius: '12px',
                color: 'white',
              }}
            >
              <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>📅 Deadline</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Flexible'}
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '2rem' }}>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                color: '#495057',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>📝</span> Task Description
            </h2>
            <div
              style={{
                background: '#f8f9fa',
                padding: '1.5rem',
                borderRadius: '12px',
                borderLeft: '4px solid #667eea',
              }}
            >
              <p style={{ color: '#495057', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontSize: '1.05rem' }}>
                {task.description}
              </p>
            </div>
          </div>

          {/* Location */}
          <div style={{ marginBottom: '2rem' }}>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                color: '#495057',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>📍</span> Location
            </h2>
            <div
              style={{
                background: '#f8f9fa',
                padding: '1.5rem',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.05rem', color: '#495057' }}
              >
                <span style={{ fontSize: '1.25rem' }}>🏠</span>
                <span>{task.location.address}</span>
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.05rem', color: '#6c757d' }}
              >
                <span style={{ fontSize: '1.25rem' }}>🌆</span>
                <span>
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
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  color: '#495057',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>🛠️</span> Skills Required
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {task.skillsRequired.map((skill: string, index: number) => (
                  <span
                    key={index}
                    style={{
                      padding: '0.75rem 1.25rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      borderRadius: '25px',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
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
                padding: '1.25rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.25rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 25px rgba(102, 126, 234, 0.5)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.4)'
              }}
            >
              🚀 Apply for this Task
            </button>
          )}

          {isClient && isOwner && (
            <button
              onClick={() => router.push(`/dashboard/client?taskId=${task._id}`)}
              style={{
                width: '100%',
                padding: '1.25rem',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.25rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(79, 172, 254, 0.4)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 25px rgba(79, 172, 254, 0.5)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(79, 172, 254, 0.4)'
              }}
            >
              📋 Manage Applications
            </button>
          )}

          {/* Application Form */}
          {showApplicationForm && (
            <div
              style={{
                marginTop: '2rem',
                padding: '2rem',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                borderRadius: '16px',
                border: '2px solid #667eea',
              }}
            >
              <h2
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 'bold',
                  marginBottom: '1.5rem',
                  color: '#495057',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>✍️</span> Submit Your Application
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
                    className="btn-submit"
                    style={{
                      flex: 1,
                      padding: '1rem',
                      fontSize: '1.1rem',
                      opacity: submitting ? 0.6 : 1,
                      cursor: submitting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {submitting ? '⏳ Submitting...' : '🚀 Submit Application'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowApplicationForm(false)}
                    className="btn-cancel"
                    style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
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
