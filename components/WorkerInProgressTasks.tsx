'use client'

import { useState } from 'react'
import { Clock, Send, AlertCircle, CheckCircle, XCircle, Calendar } from 'lucide-react'

interface Task {
  _id: string
  title: string
  description: string
  budget: number
  deadline?: string
  deliveryStatus?: string
  deliveredAt?: string
  timeExtensionRequest?: {
    status: string
    requestMessage: string
    responseMessage?: string
    respondedAt?: string
  }
}

interface Props {
  tasks: Task[]
  onDeliver: (taskId: string, message: string) => Promise<void>
  onRequestExtension: (taskId: string, message: string, newDeadline: string) => Promise<void>
  onRefresh: () => void
}

export default function WorkerInProgressTasks({ tasks, onDeliver, onRequestExtension, onRefresh }: Props) {
  const [showDeliverModal, setShowDeliverModal] = useState(false)
  const [showExtensionModal, setShowExtensionModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [deliveryMessage, setDeliveryMessage] = useState('')
  const [extensionMessage, setExtensionMessage] = useState('')
  const [newDeadline, setNewDeadline] = useState('')
  const [loading, setLoading] = useState(false)

  const handleDeliverClick = (task: Task) => {
    setSelectedTask(task)
    setDeliveryMessage('')
    setShowDeliverModal(true)
  }

  const handleExtensionClick = (task: Task) => {
    setSelectedTask(task)
    setExtensionMessage('')
    setNewDeadline('')
    setShowExtensionModal(true)
  }

  const handleDeliverSubmit = async () => {
    if (!selectedTask) return
    setLoading(true)
    try {
      await onDeliver(selectedTask._id, deliveryMessage)
      setShowDeliverModal(false)
      setDeliveryMessage('')
      alert('Task delivered successfully!')
      onRefresh()
    } catch (error: any) {
      console.error('Error delivering task:', error)
      alert(error.message || 'Failed to deliver task. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleExtensionSubmit = async () => {
    if (!selectedTask || !extensionMessage) return
    setLoading(true)
    try {
      await onRequestExtension(selectedTask._id, extensionMessage, newDeadline)
      setShowExtensionModal(false)
      setExtensionMessage('')
      setNewDeadline('')
      alert('Time extension request sent successfully!')
      onRefresh()
    } catch (error: any) {
      console.error('Error requesting extension:', error)
      alert(error.message || 'Failed to request extension. Please try again.')
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
            <p style={{ color: '#666', fontSize: '0.875rem', margin: 0 }}>Tasks you're currently working on</p>
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
          <p style={{ color: '#999', fontSize: '0.875rem' }}>Apply for tasks to start working!</p>
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
            <p style={{ color: '#666', fontSize: '0.875rem', margin: 0 }}>Tasks you're currently working on</p>
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

                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#666' }}>Budget:</span>
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
                        Waiting for client to mark as received
                      </div>
                    </div>
                  </div>
                )}

                {/* Time Extension Request Status */}
                {task.timeExtensionRequest && (
                  <div
                    style={{
                      background:
                        task.timeExtensionRequest.status === 'PENDING'
                          ? '#fef3c7'
                          : task.timeExtensionRequest.status === 'APPROVED'
                          ? '#d1fae5'
                          : '#fee2e2',
                      border: `1px solid ${
                        task.timeExtensionRequest.status === 'PENDING'
                          ? '#f59e0b'
                          : task.timeExtensionRequest.status === 'APPROVED'
                          ? '#10b981'
                          : '#ef4444'
                      }`,
                      borderRadius: '8px',
                      padding: '0.75rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      {task.timeExtensionRequest.status === 'PENDING' && <AlertCircle size={18} color="#f59e0b" />}
                      {task.timeExtensionRequest.status === 'APPROVED' && <CheckCircle size={18} color="#10b981" />}
                      {task.timeExtensionRequest.status === 'REJECTED' && <XCircle size={18} color="#ef4444" />}
                      <div
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color:
                            task.timeExtensionRequest.status === 'PENDING'
                              ? '#92400e'
                              : task.timeExtensionRequest.status === 'APPROVED'
                              ? '#065f46'
                              : '#991b1b',
                        }}
                      >
                        Time Extension Request:{' '}
                        {task.timeExtensionRequest.status === 'PENDING'
                          ? 'Pending'
                          : task.timeExtensionRequest.status === 'APPROVED'
                          ? 'Approved'
                          : 'Rejected'}
                      </div>
                    </div>
                    {task.timeExtensionRequest.responseMessage && (
                      <div style={{ fontSize: '0.8125rem', color: '#666', marginTop: '0.25rem' }}>
                        Response: {task.timeExtensionRequest.responseMessage}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {task.deliveryStatus !== 'DELIVERED' && (
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleDeliverClick(task)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <Send size={16} />
                    Deliver Task
                  </button>

                  {!task.timeExtensionRequest || task.timeExtensionRequest.status !== 'PENDING' ? (
                    <button
                      onClick={() => handleExtensionClick(task)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'white',
                        color: '#063c7a',
                        border: '2px solid #063c7a',
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
                        e.currentTarget.style.background = '#063c7a'
                        e.currentTarget.style.color = 'white'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'white'
                        e.currentTarget.style.color = '#063c7a'
                      }}
                    >
                      <Clock size={16} />
                      Request Time Extension
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Deliver Modal */}
      {showDeliverModal && selectedTask && (
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
          onClick={() => setShowDeliverModal(false)}
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
              Deliver Task
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1.5rem' }}>
              Task: <strong>{selectedTask.title}</strong>
            </p>

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
                Delivery Message (Optional)
              </label>
              <textarea
                value={deliveryMessage}
                onChange={e => setDeliveryMessage(e.target.value)}
                placeholder="Add any notes about the delivery..."
                rows={4}
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
                onClick={() => setShowDeliverModal(false)}
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#f3f4f6',
                  color: '#1a1a1a',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeliverSubmit}
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
                <Send size={16} />
                {loading ? 'Delivering...' : 'Deliver Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extension Request Modal */}
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
              Request Time Extension
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1.5rem' }}>
              Task: <strong>{selectedTask.title}</strong>
            </p>

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
                Reason for Extension *
              </label>
              <textarea
                value={extensionMessage}
                onChange={e => setExtensionMessage(e.target.value)}
                placeholder="Explain why you need more time..."
                rows={4}
                required
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
                New Deadline (Optional)
              </label>
              <input
                type="date"
                value={newDeadline}
                onChange={e => setNewDeadline(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowExtensionModal(false)}
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#f3f4f6',
                  color: '#1a1a1a',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleExtensionSubmit}
                disabled={loading || !extensionMessage}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: loading || !extensionMessage ? 'not-allowed' : 'pointer',
                  opacity: loading || !extensionMessage ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Send size={16} />
                {loading ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
