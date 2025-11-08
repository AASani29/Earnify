'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, CheckCircle, XCircle, AlertCircle, DollarSign, Calendar, User } from 'lucide-react'

interface Task {
  _id: string
  title: string
  description: string
  budget: number
  deadline?: string
  deliveryStatus?: string
  deliveredAt?: string
  paymentStatus?: string
  assignedWorkerId?: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  timeExtensionRequest?: {
    status: string
    requestMessage: string
    requestedAt: string
    newDeadline?: string
    responseMessage?: string
  }
}

interface Props {
  tasks: Task[]
  onMarkReceived: (taskId: string) => Promise<void>
  onMakePayment: (taskId: string) => Promise<void>
  onRespondExtension: (taskId: string, approved: boolean, message: string) => Promise<void>
  onRefresh: () => void
}

export default function ClientInProgressTasks({
  tasks,
  onMarkReceived,
  onMakePayment,
  onRespondExtension,
  onRefresh,
}: Props) {
  const router = useRouter()
  const [showExtensionModal, setShowExtensionModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [responseMessage, setResponseMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // Debug logging
  console.log('ClientInProgressTasks - Number of tasks:', tasks.length)
  tasks.forEach((task, index) => {
    console.log(`Client Task ${index + 1}:`, task.title)
    console.log(`  - Delivery Status:`, task.deliveryStatus)
    console.log(`  - Payment Status:`, task.paymentStatus)
    console.log(`  - Has Extension Request:`, !!task.timeExtensionRequest)
    if (task.timeExtensionRequest) {
      console.log(`  - Extension Status:`, task.timeExtensionRequest.status)
    }
  })

  const handleExtensionResponse = async (approved: boolean) => {
    if (!selectedTask) return
    setLoading(true)
    try {
      await onRespondExtension(selectedTask._id, approved, responseMessage)
      setShowExtensionModal(false)
      setResponseMessage('')
      onRefresh()
    } catch (error) {
      console.error('Error responding to extension:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkReceived = async (taskId: string) => {
    if (!confirm('Mark this task as received?')) return
    setLoading(true)
    try {
      await onMarkReceived(taskId)
      onRefresh()
    } catch (error) {
      console.error('Error marking as received:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMakePayment = async (taskId: string) => {
    if (!confirm('Confirm payment for this task? This will mark the task as completed.')) return
    setLoading(true)
    try {
      await onMakePayment(taskId)
      onRefresh()
      // Redirect to task completion page
      router.push(`/tasks/${taskId}/complete`)
    } catch (error) {
      console.error('Error making payment:', error)
      alert('Failed to process payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (tasks.length === 0) {
    return (
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
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Clock size={24} color="white" strokeWidth={2} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>In Progress Tasks</h2>
            <p style={{ color: '#666', fontSize: '0.875rem', margin: 0 }}>Tasks currently being worked on</p>
          </div>
        </div>

        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            background: '#f8f9fa',
            borderRadius: '12px',
            border: '2px dashed #dee2e6',
          }}
        >
          <Clock size={48} color="#ccc" strokeWidth={2} style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: '#666', fontSize: '1rem', marginBottom: '0.5rem' }}>No tasks in progress</p>
          <p style={{ color: '#999', fontSize: '0.875rem' }}>Post tasks and accept worker applications!</p>
        </div>
      </div>
    )
  }

  return (
    <>
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
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Clock size={24} color="white" strokeWidth={2} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>
              In Progress Tasks ({tasks.length})
            </h2>
            <p style={{ color: '#666', fontSize: '0.875rem', margin: 0 }}>Tasks currently being worked on</p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {tasks.map(task => (
            <div
              key={task._id}
              style={{
                background: '#f8f9fa',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
              }}
            >
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '0.5rem' }}>
                  {task.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>{task.description}</p>

                {/* Worker Info */}
                {task.assignedWorkerId && (
                  <div
                    style={{
                      background: 'white',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <User size={16} color="#063c7a" />
                    <span style={{ fontSize: '0.875rem', color: '#666' }}>Worker:</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1a1a1a' }}>
                      {task.assignedWorkerId.firstName} {task.assignedWorkerId.lastName}
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <DollarSign size={16} color="#063c7a" />
                    <span style={{ fontSize: '1rem', fontWeight: '600', color: '#063c7a' }}>৳{task.budget}</span>
                  </div>
                  {task.deadline && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={16} color="#666" />
                      <span style={{ fontSize: '0.875rem', color: '#666' }}>
                        Deadline: {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Time Extension Request */}
                {task.timeExtensionRequest && task.timeExtensionRequest.status === 'PENDING' && (
                  <div
                    style={{
                      background: '#fef3c7',
                      border: '1px solid #f59e0b',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <AlertCircle size={18} color="#f59e0b" />
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#92400e' }}>
                        Time Extension Request
                      </div>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#78350f', marginBottom: '0.75rem' }}>
                      {task.timeExtensionRequest.requestMessage}
                    </div>
                    {task.timeExtensionRequest.newDeadline && (
                      <div style={{ fontSize: '0.8125rem', color: '#78350f', marginBottom: '0.75rem' }}>
                        Requested new deadline: {new Date(task.timeExtensionRequest.newDeadline).toLocaleDateString()}
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setSelectedTask(task)
                        setResponseMessage('')
                        setShowExtensionModal(true)
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
                      }}
                    >
                      Respond to Request
                    </button>
                  </div>
                )}

                {/* Extension Response Status */}
                {task.timeExtensionRequest &&
                  (task.timeExtensionRequest.status === 'APPROVED' ||
                    task.timeExtensionRequest.status === 'REJECTED') && (
                    <div
                      style={{
                        background: task.timeExtensionRequest.status === 'APPROVED' ? '#d1fae5' : '#fee2e2',
                        border: `1px solid ${task.timeExtensionRequest.status === 'APPROVED' ? '#10b981' : '#ef4444'}`,
                        borderRadius: '8px',
                        padding: '0.75rem',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      {task.timeExtensionRequest.status === 'APPROVED' ? (
                        <CheckCircle size={18} color="#10b981" />
                      ) : (
                        <XCircle size={18} color="#ef4444" />
                      )}
                      <div>
                        <div
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: task.timeExtensionRequest.status === 'APPROVED' ? '#065f46' : '#991b1b',
                          }}
                        >
                          Extension Request {task.timeExtensionRequest.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                        </div>
                        {task.timeExtensionRequest.responseMessage && (
                          <div style={{ fontSize: '0.8125rem', color: '#666', marginTop: '0.25rem' }}>
                            {task.timeExtensionRequest.responseMessage}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* Delivery Status */}
                {task.deliveryStatus === 'DELIVERED' && (
                  <div
                    style={{
                      background: '#d1fae5',
                      border: '1px solid #10b981',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <CheckCircle size={18} color="#10b981" />
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#065f46' }}>Task Delivered</div>
                      <div style={{ fontSize: '0.8125rem', color: '#047857' }}>
                        Delivered on {new Date(task.deliveredAt!).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}

                {task.deliveryStatus === 'RECEIVED' && task.paymentStatus !== 'PAID' && (
                  <div
                    style={{
                      background: '#dbeafe',
                      border: '1px solid #3b82f6',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <CheckCircle size={18} color="#3b82f6" />
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e40af' }}>
                        Task Marked as Received
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#1e3a8a' }}>Ready for payment</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {task.deliveryStatus === 'DELIVERED' && task.paymentStatus !== 'PAID' && (
                  <button
                    onClick={() => handleMarkReceived(task._id)}
                    disabled={loading}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.5 : 1,
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                    onMouseEnter={e => {
                      if (!loading) {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <CheckCircle size={16} />
                    Mark as Received
                  </button>
                )}

                {task.deliveryStatus === 'RECEIVED' && task.paymentStatus !== 'PAID' && (
                  <button
                    onClick={() => handleMakePayment(task._id)}
                    disabled={loading}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.5 : 1,
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                    onMouseEnter={e => {
                      if (!loading) {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <DollarSign size={16} />
                    Make Payment
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Extension Response Modal */}
      {showExtensionModal && selectedTask && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setShowExtensionModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a', marginBottom: '1rem' }}>
              Respond to Time Extension Request
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
              Task: <strong>{selectedTask.title}</strong>
            </p>

            <div
              style={{
                background: '#f8f9fa',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ fontSize: '0.8125rem', color: '#666', marginBottom: '0.5rem' }}>Worker's Request:</div>
              <div style={{ fontSize: '0.875rem', color: '#1a1a1a' }}>
                {selectedTask.timeExtensionRequest?.requestMessage}
              </div>
              {selectedTask.timeExtensionRequest?.newDeadline && (
                <div style={{ fontSize: '0.8125rem', color: '#666', marginTop: '0.5rem' }}>
                  Requested deadline: {new Date(selectedTask.timeExtensionRequest.newDeadline).toLocaleDateString()}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#1a1a1a',
                }}
              >
                Your Response (Optional)
              </label>
              <textarea
                value={responseMessage}
                onChange={e => setResponseMessage(e.target.value)}
                placeholder="Add a message to the worker..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => handleExtensionResponse(false)}
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <XCircle size={16} />
                {loading ? 'Processing...' : 'Reject'}
              </button>
              <button
                onClick={() => handleExtensionResponse(true)}
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <CheckCircle size={16} />
                {loading ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
