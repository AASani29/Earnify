'use client'

import { useState, useEffect } from 'react'
import { HelpCircle, X, Send, MessageSquare, Plus } from 'lucide-react'
import { useJWTAuthContext } from '@/config/Auth'

interface Message {
  _id: string
  senderId: {
    firstName: string
    lastName: string
  }
  senderRole: string
  message: string
  createdAt: string
}

interface Ticket {
  _id: string
  subject: string
  category: string
  priority: string
  status: string
  messages: Message[]
  createdAt: string
  lastMessageAt: string
}

type Tab = 'submit' | 'tickets'

export default function HelpButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('submit')
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('GENERAL')
  const [priority, setPriority] = useState('MEDIUM')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // My Tickets state
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const { controller } = useJWTAuthContext()

  const fetchTickets = async () => {
    try {
      setIsLoading(true)
      const token = controller.getAccessToken()
      const response = await fetch('/api/support-tickets', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets || [])
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return

    try {
      setIsSending(true)
      const token = controller.getAccessToken()
      const response = await fetch(`/api/support-tickets/${selectedTicket._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: replyMessage,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedTicket(data.ticket)
        setReplyMessage('')
        setTickets(prev => prev.map(t => (t._id === data.ticket._id ? data.ticket : t)))
      }
    } catch (error) {
      console.error('Error sending reply:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) return

    try {
      setIsSubmitting(true)
      const token = controller.getAccessToken()
      const response = await fetch('/api/support-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject,
          category,
          priority,
          message,
        }),
      })

      if (response.ok) {
        setSubmitSuccess(true)
        setSubject('')
        setCategory('GENERAL')
        setPriority('MEDIUM')
        setMessage('')
        fetchTickets() // Refresh tickets list
        setTimeout(() => {
          setSubmitSuccess(false)
          setActiveTab('tickets') // Switch to tickets tab
        }, 1500)
      }
    } catch (error) {
      console.error('Error creating support ticket:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (isOpen && activeTab === 'tickets') {
      fetchTickets()
    }
  }, [isOpen, activeTab])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return { bg: '#e3f2fd', color: '#1976d2' }
      case 'IN_PROGRESS':
        return { bg: '#e1f5fe', color: '#0288d1' }
      case 'RESOLVED':
        return { bg: '#e8f5e9', color: '#2e7d32' }
      case 'CLOSED':
        return { bg: '#f5f5f5', color: '#6c757d' }
      default:
        return { bg: '#f5f5f5', color: '#6c757d' }
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return { bg: '#ffebee', color: '#d32f2f' }
      case 'HIGH':
        return { bg: '#fff3e0', color: '#f57c00' }
      case 'MEDIUM':
        return { bg: '#e3f2fd', color: '#1976d2' }
      case 'LOW':
        return { bg: '#f8f9fa', color: '#6c757d' }
      default:
        return { bg: '#f8f9fa', color: '#6c757d' }
    }
  }

  return (
    <>
      {/* Help Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '6rem',
            right: '2rem',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)',
            color: 'white',
            border: 'none',
            boxShadow: '0 4px 16px rgba(6, 60, 122, 0.3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            zIndex: 999,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(6, 60, 122, 0.4)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(6, 60, 122, 0.3)'
          }}
        >
          <HelpCircle size={24} strokeWidth={2} />
        </button>
      )}

      {/* Help Modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: selectedTicket ? '700px' : '450px',
            maxHeight: '650px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            zIndex: 999,
            overflow: 'hidden',
            border: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)',
              color: 'white',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <HelpCircle size={20} strokeWidth={2} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                  {selectedTicket ? 'Ticket Details' : 'Support Center'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.85 }}>
                  {selectedTicket ? 'View conversation' : 'Get help and support'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false)
                setSelectedTicket(null)
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>

          {/* Tabs - Only show when not viewing a ticket */}
          {!selectedTicket && (
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid #e0e0e0',
                background: '#f8f9fa',
              }}
            >
              <button
                onClick={() => setActiveTab('submit')}
                style={{
                  flex: 1,
                  padding: '0.875rem 1rem',
                  background: activeTab === 'submit' ? 'white' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'submit' ? '2px solid #063c7a' : '2px solid transparent',
                  color: activeTab === 'submit' ? '#063c7a' : '#6c757d',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                }}
              >
                <Plus size={18} strokeWidth={2} />
                Submit Ticket
              </button>
              <button
                onClick={() => setActiveTab('tickets')}
                style={{
                  flex: 1,
                  padding: '0.875rem 1rem',
                  background: activeTab === 'tickets' ? 'white' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'tickets' ? '2px solid #063c7a' : '2px solid transparent',
                  color: activeTab === 'tickets' ? '#063c7a' : '#6c757d',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                }}
              >
                <MessageSquare size={18} strokeWidth={2} />
                My Tickets
              </button>
            </div>
          )}

          {/* Content */}
          {!selectedTicket ? (
            activeTab === 'submit' ? (
              // Submit Ticket Form
              <div style={{ padding: '1.25rem', flex: 1, overflowY: 'auto' }}>
                {submitSuccess ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '2rem',
                      color: '#063c7a',
                    }}
                  >
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✓</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>Ticket Submitted!</div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginTop: '0.5rem' }}>
                      Switching to My Tickets...
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#2c3e50',
                          marginBottom: '0.5rem',
                        }}
                      >
                        Subject *
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        placeholder="Brief description of your issue"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '0.9375rem',
                          outline: 'none',
                          transition: 'border-color 0.2s',
                        }}
                        onFocus={e => {
                          e.currentTarget.style.borderColor = '#063c7a'
                        }}
                        onBlur={e => {
                          e.currentTarget.style.borderColor = '#e0e0e0'
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#2c3e50',
                            marginBottom: '0.5rem',
                          }}
                        >
                          Category
                        </label>
                        <select
                          value={category}
                          onChange={e => setCategory(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            fontSize: '0.9375rem',
                            outline: 'none',
                          }}
                        >
                          <option value="GENERAL">General</option>
                          <option value="TECHNICAL">Technical</option>
                          <option value="PAYMENT">Payment</option>
                          <option value="DISPUTE">Dispute</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#2c3e50',
                            marginBottom: '0.5rem',
                          }}
                        >
                          Priority
                        </label>
                        <select
                          value={priority}
                          onChange={e => setPriority(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            fontSize: '0.9375rem',
                            outline: 'none',
                          }}
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="URGENT">Urgent</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#2c3e50',
                          marginBottom: '0.5rem',
                        }}
                      >
                        Message *
                      </label>
                      <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Describe your issue in detail..."
                        rows={5}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '0.9375rem',
                          outline: 'none',
                          resize: 'none',
                          fontFamily: 'inherit',
                          transition: 'border-color 0.2s',
                        }}
                        onFocus={e => {
                          e.currentTarget.style.borderColor = '#063c7a'
                        }}
                        onBlur={e => {
                          e.currentTarget.style.borderColor = '#e0e0e0'
                        }}
                      />
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={!subject.trim() || !message.trim() || isSubmitting}
                      style={{
                        padding: '0.875rem 1.25rem',
                        background:
                          subject.trim() && message.trim() && !isSubmitting
                            ? 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)'
                            : '#e9ecef',
                        color: subject.trim() && message.trim() && !isSubmitting ? 'white' : '#adb5bd',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.9375rem',
                        fontWeight: '600',
                        cursor: subject.trim() && message.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Send size={16} strokeWidth={2} />
                      {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // My Tickets List
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                {isLoading ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>Loading tickets...</div>
                ) : tickets.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
                    <MessageSquare size={48} color="#e0e0e0" style={{ marginBottom: '1rem' }} />
                    <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>No tickets yet</div>
                    <div style={{ fontSize: '0.875rem' }}>Submit your first support ticket to get help</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {tickets.map(ticket => {
                      const statusStyle = getStatusColor(ticket.status)
                      const priorityStyle = getPriorityColor(ticket.priority)
                      return (
                        <div
                          key={ticket._id}
                          onClick={() => setSelectedTicket(ticket)}
                          style={{
                            padding: '1rem',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            background: 'white',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = '#063c7a'
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = '#e0e0e0'
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = 'none'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <div style={{ fontWeight: '600', color: '#2c3e50', fontSize: '0.9375rem' }}>
                              {ticket.subject}
                            </div>
                            <span
                              style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                background: statusStyle.bg,
                                color: statusStyle.color,
                              }}
                            >
                              {ticket.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span
                              style={{
                                padding: '0.125rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                background: '#f8f9fa',
                                color: '#6c757d',
                              }}
                            >
                              {ticket.category}
                            </span>
                            <span
                              style={{
                                padding: '0.125rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                background: priorityStyle.bg,
                                color: priorityStyle.color,
                              }}
                            >
                              {ticket.priority}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: '#6c757d' }}>
                            {ticket.messages.length} message{ticket.messages.length !== 1 ? 's' : ''} • Last updated{' '}
                            {new Date(ticket.lastMessageAt).toLocaleDateString()}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          ) : (
            // Ticket Detail View
            <>
              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid #e0e0e0',
                  background: '#f8f9fa',
                }}
              >
                <button
                  onClick={() => setSelectedTicket(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#063c7a',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.75rem',
                    padding: '0.25rem 0',
                  }}
                >
                  ← Back to tickets
                </button>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#2c3e50',
                    marginBottom: '0.5rem',
                  }}
                >
                  {selectedTicket.subject}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      background: '#f8f9fa',
                      color: '#6c757d',
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    {selectedTicket.category}
                  </span>
                  <span
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      ...getPriorityColor(selectedTicket.priority),
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    {selectedTicket.priority}
                  </span>
                  <span
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      ...getStatusColor(selectedTicket.status),
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    {selectedTicket.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1.25rem',
                  background: '#fafbfc',
                }}
              >
                {selectedTicket.messages.map(msg => (
                  <div
                    key={msg._id}
                    style={{
                      marginBottom: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.senderRole === 'ADMIN' ? 'flex-start' : 'flex-end',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '80%',
                        background:
                          msg.senderRole === 'ADMIN' ? 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)' : 'white',
                        color: msg.senderRole === 'ADMIN' ? 'white' : '#2c3e50',
                        padding: '0.875rem 1.125rem',
                        borderRadius: msg.senderRole === 'ADMIN' ? '12px 12px 12px 4px' : '12px 12px 4px 12px',
                        border: msg.senderRole === 'ADMIN' ? 'none' : '1px solid #e0e0e0',
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.375rem', fontWeight: '600' }}>
                        {msg.senderRole === 'ADMIN' ? 'Admin Support' : 'You'}
                      </div>
                      <div style={{ fontSize: '0.9375rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                        {msg.message}
                      </div>
                      <div style={{ fontSize: '0.6875rem', opacity: 0.7, marginTop: '0.375rem' }}>
                        {new Date(msg.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Input - Only show if ticket is not closed */}
              {selectedTicket.status !== 'CLOSED' && (
                <div
                  style={{
                    padding: '1rem 1.25rem',
                    borderTop: '1px solid #e0e0e0',
                    background: 'white',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                    <textarea
                      value={replyMessage}
                      onChange={e => setReplyMessage(e.target.value)}
                      placeholder="Type your reply..."
                      rows={3}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '0.9375rem',
                        outline: 'none',
                        resize: 'none',
                        fontFamily: 'inherit',
                      }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = '#063c7a'
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = '#e0e0e0'
                      }}
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={!replyMessage.trim() || isSending}
                      style={{
                        padding: '0.75rem 1.25rem',
                        background:
                          replyMessage.trim() && !isSending
                            ? 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)'
                            : '#e9ecef',
                        color: replyMessage.trim() && !isSending ? 'white' : '#adb5bd',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.9375rem',
                        fontWeight: '600',
                        cursor: replyMessage.trim() && !isSending ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Send size={16} />
                      {isSending ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  )
}
