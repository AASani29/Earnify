'use client'

import { useJWTAuthContext } from '@/config/Auth'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import AuthNavbar from '@/components/AuthNavbar'
import ReviewForm from '@/components/ReviewForm'
import { CheckCircle, DollarSign, Calendar, Clock, User, Briefcase, ArrowLeft } from 'lucide-react'

export default function TaskCompletePage() {
  const { user, isLoggedIn, controller } = useJWTAuthContext()
  const router = useRouter()
  const params = useParams()
  const taskId = params.id as string

  const [task, setTask] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  const getAccessToken = () => controller.getAccessToken()

  useEffect(() => {
    if (isLoggedIn === true && user && user.role !== 'CLIENT') {
      router.push('/dashboard/worker')
    }
  }, [user, isLoggedIn, router])

  useEffect(() => {
    if (user && taskId) {
      fetchTask()
    }
  }, [user, taskId])

  const fetchTask = async () => {
    try {
      setLoading(true)
      const accessToken = getAccessToken()
      const response = await fetch(`/api/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch task')
      }

      const data = await response.json()
      setTask(data.task)
    } catch (error) {
      console.error('Error fetching task:', error)
      alert('Failed to load task details')
      router.push('/dashboard/client')
    } finally {
      setLoading(false)
    }
  }

  const handleReviewSubmit = () => {
    setReviewSubmitted(true)
  }

  if (isLoggedIn === null || loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
        <AuthNavbar />
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#666' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !task) {
    return null
  }

  if (task.status !== 'COMPLETED' || task.paymentStatus !== 'PAID') {
    router.push('/dashboard/client')
    return null
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <AuthNavbar />

      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '2rem',
        }}
      >
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard/client')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'white',
            color: '#063c7a',
            border: '2px solid #063c7a',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '2rem',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#063c7a'
            e.currentTarget.style.color = 'white'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'white'
            e.currentTarget.style.color = '#063c7a'
          }}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        {/* Success Header */}
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            marginBottom: '2rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <CheckCircle size={48} color="white" strokeWidth={2} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1a1a1a', marginBottom: '0.5rem' }}>
            Task Completed Successfully!
          </h1>
          <p style={{ fontSize: '1rem', color: '#666' }}>Payment has been processed and the task is now complete.</p>
        </div>

        {/* Task Details */}
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Briefcase size={24} color="white" strokeWidth={2} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>Task Details</h2>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '0.5rem' }}>
              {task.title}
            </h3>
            <p style={{ fontSize: '0.9375rem', color: '#666', lineHeight: '1.6' }}>{task.description}</p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              padding: '1.5rem',
              background: '#f8f9fa',
              borderRadius: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <DollarSign size={18} color="#063c7a" />
                <span style={{ fontSize: '0.875rem', color: '#666' }}>Budget</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#063c7a' }}>৳{task.budget}</div>
            </div>

            {task.deadline && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Calendar size={18} color="#666" />
                  <span style={{ fontSize: '0.875rem', color: '#666' }}>Deadline</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1a1a1a' }}>
                  {new Date(task.deadline).toLocaleDateString()}
                </div>
              </div>
            )}

            {task.completedAt && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Clock size={18} color="#666" />
                  <span style={{ fontSize: '0.875rem', color: '#666' }}>Completed On</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1a1a1a' }}>
                  {new Date(task.completedAt).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Worker Details */}
        {task.assignedWorkerId && (
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              marginBottom: '2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <User size={24} color="white" strokeWidth={2} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>Worker Details</h2>
              </div>
            </div>

            <div
              style={{
                padding: '1.5rem',
                background: '#f8f9fa',
                borderRadius: '12px',
              }}
            >
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#666' }}>Name:</span>
                <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1a1a1a', marginTop: '0.25rem' }}>
                  {task.assignedWorkerId.firstName} {task.assignedWorkerId.lastName}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.875rem', color: '#666' }}>Email:</span>
                <div style={{ fontSize: '1rem', color: '#1a1a1a', marginTop: '0.25rem' }}>
                  {task.assignedWorkerId.email}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Review Section */}
        {!reviewSubmitted ? (
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            }}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a', marginBottom: '1rem' }}>
              Rate Your Experience
            </h2>
            <p style={{ fontSize: '0.9375rem', color: '#666', marginBottom: '1.5rem' }}>
              Please share your feedback about working with {task.assignedWorkerId?.firstName}
            </p>
            <ReviewForm
              taskId={taskId}
              workerId={task.assignedWorkerId?._id}
              workerName={`${task.assignedWorkerId?.firstName} ${task.assignedWorkerId?.lastName}`}
              onSubmitSuccess={handleReviewSubmit}
            />
          </div>
        ) : (
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '3rem 2rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              textAlign: 'center',
            }}
          >
            <CheckCircle size={64} color="#10b981" strokeWidth={2} style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a', marginBottom: '0.5rem' }}>
              Thank You for Your Review!
            </h2>
            <p style={{ fontSize: '1rem', color: '#666', marginBottom: '2rem' }}>
              Your feedback helps us maintain quality on our platform.
            </p>
            <button
              onClick={() => router.push('/dashboard/client')}
              style={{
                padding: '0.75rem 2rem',
                background: 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 60, 122, 0.3)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
