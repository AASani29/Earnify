'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useJWTAuthContext } from '@/config/Auth'

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
          <p style={{ fontSize: '1.25rem', fontWeight: '600' }}>Loading task details...</p>
        </div>
      </div>
    )
  }

  if (error && !task) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <div className="card" style={{ maxWidth: '500px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
          <p className="error" style={{ marginBottom: '1.5rem' }}>
            {error}
          </p>
          <button onClick={() => router.back()} className="btn btn-primary" style={{ width: '100%' }}>
            ← Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!task) return null

  const isWorker = user?.role === 'WORKER'
  const isClient = user?.role === 'CLIENT'
  const isOwner = task.clientId._id === user?.id

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Hero Section with Gradient */}
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '3rem 1rem 4rem',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <button
            onClick={() => router.back()}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              marginBottom: '2rem',
              backdropFilter: 'blur(10px)',
            }}
          >
            ← Back
          </button>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ flex: 1, minWidth: '300px' }}>
              <h1
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: 'white',
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
                  gap: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontSize: '1.1rem',
                }}
              >
                <span>👤</span>
                <span>
                  Posted by{' '}
                  <strong>
                    {task.clientId.firstName} {task.clientId.lastName}
                  </strong>
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.95rem',
                  marginTop: '0.5rem',
                }}
              >
                <span>📅</span>
                <span>Posted on {new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-end' }}>
              <span
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '25px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  background:
                    task.status === 'OPEN'
                      ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                      : task.status === 'IN_PROGRESS'
                      ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                      : task.status === 'COMPLETED'
                      ? 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
                      : 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                }}
              >
                {task.status.replace('_', ' ')}
              </span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '0.25rem' }}>
                  Budget
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>
                  ৳{task.budget.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)' }}>BDT</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{ maxWidth: '1200px', margin: '-2rem auto 0', padding: '0 1rem 3rem', position: 'relative', zIndex: 1 }}
      >
        <div className="card" style={{ marginBottom: '2rem' }}>
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
