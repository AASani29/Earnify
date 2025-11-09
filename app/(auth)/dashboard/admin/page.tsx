'use client'

import { useJWTAuthContext } from '@/config/Auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Users,
  Briefcase,
  MessageSquare,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Send,
} from 'lucide-react'
import AuthNavbar from '@/components/AuthNavbar'

type Tab = 'overview' | 'users' | 'tasks' | 'disputes'

interface Statistics {
  totalUsers: number
  totalWorkers: number
  totalClients: number
  totalTasks: number
  totalApplications: number
  openTickets: number
  tasksByStatus: {
    OPEN?: number
    IN_PROGRESS?: number
    COMPLETED?: number
    CANCELLED?: number
  }
}

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
  isVerified: boolean
  profileCompleted: boolean
  createdAt: string
  profile?: any
}

interface Task {
  _id: string
  title: string
  status: string
  budget: number
  clientId: any
  assignedWorkerId?: any
  createdAt: string
  location: {
    city: string
    district: string
  }
}

interface SupportTicket {
  _id: string
  userId: any
  subject: string
  category: string
  priority: string
  status: string
  messages: Array<{
    _id: string
    senderId: any
    senderRole: string
    message: string
    createdAt: string
  }>
  createdAt: string
  lastMessageAt: string
}

export default function AdminDashboardPage() {
  const { user, logout, isLoggedIn, controller } = useJWTAuthContext()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [userFilter, setUserFilter] = useState('ALL')
  const [taskFilter, setTaskFilter] = useState('ALL')
  const [ticketFilter, setTicketFilter] = useState('ALL')

  useEffect(() => {
    if (isLoggedIn !== null && user && user.role !== 'ADMIN') {
      if (user.role === 'WORKER') {
        router.push('/dashboard/worker')
      } else if (user.role === 'CLIENT') {
        router.push('/dashboard/client')
      }
    }
  }, [user, isLoggedIn, router])

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchStatistics()
      if (activeTab === 'users') {
        fetchUsers()
      } else if (activeTab === 'tasks') {
        fetchTasks()
      } else if (activeTab === 'disputes') {
        fetchTickets()
      }
    }
  }, [user, activeTab])

  const fetchStatistics = async () => {
    try {
      const token = controller.getAccessToken()
      const response = await fetch('/api/admin/statistics', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setStatistics(data.statistics)
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = controller.getAccessToken()
      const params = new URLSearchParams()
      if (userFilter !== 'ALL') params.append('role', userFilter)
      const response = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const token = controller.getAccessToken()
      const params = new URLSearchParams()
      if (taskFilter !== 'ALL') params.append('status', taskFilter)
      const response = await fetch(`/api/tasks?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const token = controller.getAccessToken()
      const params = new URLSearchParams()
      if (ticketFilter !== 'ALL') params.append('status', ticketFilter)
      const response = await fetch(`/api/support-tickets?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets)
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyUser = async (userId: string, isVerified: boolean) => {
    try {
      const token = controller.getAccessToken()
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isVerified }),
      })
      if (response.ok) {
        fetchUsers()
        fetchStatistics()
      }
    } catch (error) {
      console.error('Error verifying user:', error)
    }
  }

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return

    try {
      const token = controller.getAccessToken()
      const response = await fetch(`/api/support-tickets/${selectedTicket._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: replyMessage }),
      })
      if (response.ok) {
        const data = await response.json()
        setSelectedTicket(data.ticket)
        setReplyMessage('')
        fetchTickets()
      }
    } catch (error) {
      console.error('Error sending reply:', error)
    }
  }

  const handleUpdateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const token = controller.getAccessToken()
      const response = await fetch(`/api/support-tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })
      if (response.ok) {
        fetchTickets()
        if (selectedTicket && selectedTicket._id === ticketId) {
          const data = await response.json()
          setSelectedTicket(data.ticket)
        }
      }
    } catch (error) {
      console.error('Error updating ticket status:', error)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (isLoggedIn === null) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '1.125rem', color: '#063c7a' }}>Loading...</div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  if (user.role !== 'ADMIN') {
    return null
  }

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <AuthNavbar />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div
          style={{
            marginBottom: '2rem',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)',
            borderRadius: '12px',
            color: 'white',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>Admin Dashboard</h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9375rem' }}>
            Welcome back, {user.firstName}! Manage your platform from here.
          </p>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                padding: '1.25rem',
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Users size={20} color="#063c7a" />
                <span style={{ fontSize: '0.875rem', color: '#6c757d', fontWeight: '500' }}>Total Users</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#063c7a' }}>{statistics.totalUsers}</div>
            </div>

            <div
              style={{
                padding: '1.25rem',
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Users size={20} color="#2e7d32" />
                <span style={{ fontSize: '0.875rem', color: '#6c757d', fontWeight: '500' }}>Workers</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2e7d32' }}>{statistics.totalWorkers}</div>
            </div>

            <div
              style={{
                padding: '1.25rem',
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Users size={20} color="#f57c00" />
                <span style={{ fontSize: '0.875rem', color: '#6c757d', fontWeight: '500' }}>Clients</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f57c00' }}>{statistics.totalClients}</div>
            </div>

            <div
              style={{
                padding: '1.25rem',
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Briefcase size={20} color="#7b1fa2" />
                <span style={{ fontSize: '0.875rem', color: '#6c757d', fontWeight: '500' }}>Total Tasks</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#7b1fa2' }}>{statistics.totalTasks}</div>
            </div>

            <div
              style={{
                padding: '1.25rem',
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <MessageSquare size={20} color="#d32f2f" />
                <span style={{ fontSize: '0.875rem', color: '#6c757d', fontWeight: '500' }}>Open Tickets</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#d32f2f' }}>{statistics.openTickets}</div>
            </div>

            <div
              style={{
                padding: '1.25rem',
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <BarChart3 size={20} color="#1976d2" />
                <span style={{ fontSize: '0.875rem', color: '#6c757d', fontWeight: '500' }}>Applications</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1976d2' }}>
                {statistics.totalApplications}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            borderBottom: '2px solid #e0e0e0',
            paddingBottom: '0',
          }}
        >
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'tasks', label: 'Task Management', icon: Briefcase },
            { id: 'disputes', label: 'Dispute Resolution', icon: MessageSquare },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              style={{
                padding: '0.875rem 1.5rem',
                background: activeTab === tab.id ? 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#6c757d',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                fontSize: '0.9375rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '-2px',
                borderBottom: activeTab === tab.id ? '2px solid #063c7a' : '2px solid transparent',
              }}
            >
              <tab.icon size={18} strokeWidth={2} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '1.5rem' }}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2
                style={{ margin: 0, marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700', color: '#063c7a' }}
              >
                Platform Overview
              </h2>

              {statistics && (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div
                    style={{
                      padding: '1.25rem',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    <h3 style={{ margin: 0, marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600' }}>
                      Tasks by Status
                    </h3>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#2e7d32' }}>
                          {statistics.tasksByStatus.OPEN || 0}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>Open</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#f57c00' }}>
                          {statistics.tasksByStatus.IN_PROGRESS || 0}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>In Progress</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1976d2' }}>
                          {statistics.tasksByStatus.COMPLETED || 0}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>Completed</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#d32f2f' }}>
                          {statistics.tasksByStatus.CANCELLED || 0}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>Cancelled</div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '1.25rem',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    <h3 style={{ margin: 0, marginBottom: '0.75rem', fontSize: '1.125rem', fontWeight: '600' }}>
                      Quick Actions
                    </h3>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                      }}
                    >
                      <button
                        onClick={() => setActiveTab('users')}
                        style={{
                          padding: '1rem',
                          background: 'white',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = '#063c7a'
                          e.currentTarget.style.transform = 'translateY(-2px)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = '#e0e0e0'
                          e.currentTarget.style.transform = 'translateY(0)'
                        }}
                      >
                        <div style={{ fontWeight: '600', color: '#063c7a', marginBottom: '0.25rem' }}>Manage Users</div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>View and verify users</div>
                      </button>

                      <button
                        onClick={() => setActiveTab('tasks')}
                        style={{
                          padding: '1rem',
                          background: 'white',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = '#063c7a'
                          e.currentTarget.style.transform = 'translateY(-2px)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = '#e0e0e0'
                          e.currentTarget.style.transform = 'translateY(0)'
                        }}
                      >
                        <div style={{ fontWeight: '600', color: '#063c7a', marginBottom: '0.25rem' }}>
                          Monitor Tasks
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>View all platform tasks</div>
                      </button>

                      <button
                        onClick={() => setActiveTab('disputes')}
                        style={{
                          padding: '1rem',
                          background: 'white',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = '#063c7a'
                          e.currentTarget.style.transform = 'translateY(-2px)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = '#e0e0e0'
                          e.currentTarget.style.transform = 'translateY(0)'
                        }}
                      >
                        <div style={{ fontWeight: '600', color: '#063c7a', marginBottom: '0.25rem' }}>
                          Handle Disputes
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>Resolve support tickets</div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Management Tab */}
          {activeTab === 'users' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                }}
              >
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#063c7a' }}>User Management</h2>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <Filter size={18} color="#6c757d" />
                  <select
                    value={userFilter}
                    onChange={e => {
                      setUserFilter(e.target.value)
                      setTimeout(fetchUsers, 100)
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '0.9375rem',
                      outline: 'none',
                    }}
                  >
                    <option value="ALL">All Users</option>
                    <option value="WORKER">Workers</option>
                    <option value="CLIENT">Clients</option>
                    <option value="ADMIN">Admins</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>Loading users...</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                        <th
                          style={{
                            padding: '0.875rem',
                            textAlign: 'left',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#6c757d',
                          }}
                        >
                          Name
                        </th>
                        <th
                          style={{
                            padding: '0.875rem',
                            textAlign: 'left',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#6c757d',
                          }}
                        >
                          Email
                        </th>
                        <th
                          style={{
                            padding: '0.875rem',
                            textAlign: 'left',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#6c757d',
                          }}
                        >
                          Role
                        </th>
                        <th
                          style={{
                            padding: '0.875rem',
                            textAlign: 'left',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#6c757d',
                          }}
                        >
                          Status
                        </th>
                        <th
                          style={{
                            padding: '0.875rem',
                            textAlign: 'left',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#6c757d',
                          }}
                        >
                          Joined
                        </th>
                        <th
                          style={{
                            padding: '0.875rem',
                            textAlign: 'left',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#6c757d',
                          }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                          <td style={{ padding: '1rem 0.875rem' }}>
                            <div style={{ fontWeight: '600', color: '#2c3e50' }}>
                              {u.firstName} {u.lastName}
                            </div>
                          </td>
                          <td style={{ padding: '1rem 0.875rem', fontSize: '0.9375rem', color: '#6c757d' }}>
                            {u.email}
                          </td>
                          <td style={{ padding: '1rem 0.875rem' }}>
                            <span
                              style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '6px',
                                fontSize: '0.8125rem',
                                fontWeight: '600',
                                background:
                                  u.role === 'WORKER' ? '#e3f2fd' : u.role === 'CLIENT' ? '#fff3e0' : '#f3e5f5',
                                color: u.role === 'WORKER' ? '#1976d2' : u.role === 'CLIENT' ? '#f57c00' : '#7b1fa2',
                              }}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td style={{ padding: '1rem 0.875rem' }}>
                            {u.isVerified ? (
                              <span
                                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#2e7d32' }}
                              >
                                <CheckCircle size={16} />
                                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Verified</span>
                              </span>
                            ) : (
                              <span
                                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#d32f2f' }}
                              >
                                <XCircle size={16} />
                                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Not Verified</span>
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '1rem 0.875rem', fontSize: '0.875rem', color: '#6c757d' }}>
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '1rem 0.875rem' }}>
                            {u.role !== 'ADMIN' && (
                              <button
                                onClick={() => handleVerifyUser(u._id, !u.isVerified)}
                                style={{
                                  padding: '0.5rem 1rem',
                                  background: u.isVerified
                                    ? '#fff3e0'
                                    : 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)',
                                  color: u.isVerified ? '#f57c00' : 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '0.8125rem',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                }}
                              >
                                {u.isVerified ? 'Unverify' : 'Verify'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>No users found</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Task Management Tab */}
          {activeTab === 'tasks' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                }}
              >
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#063c7a' }}>Task Management</h2>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <Filter size={18} color="#6c757d" />
                  <select
                    value={taskFilter}
                    onChange={e => {
                      setTaskFilter(e.target.value)
                      setTimeout(fetchTasks, 100)
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '0.9375rem',
                      outline: 'none',
                    }}
                  >
                    <option value="ALL">All Tasks</option>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>Loading tasks...</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                        <th
                          style={{
                            padding: '0.875rem',
                            textAlign: 'left',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#6c757d',
                          }}
                        >
                          Task Title
                        </th>
                        <th
                          style={{
                            padding: '0.875rem',
                            textAlign: 'left',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#6c757d',
                          }}
                        >
                          Client
                        </th>
                        <th
                          style={{
                            padding: '0.875rem',
                            textAlign: 'left',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#6c757d',
                          }}
                        >
                          Worker
                        </th>
                        <th
                          style={{
                            padding: '0.875rem',
                            textAlign: 'left',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#6c757d',
                          }}
                        >
                          Status
                        </th>
                        <th
                          style={{
                            padding: '0.875rem',
                            textAlign: 'left',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#6c757d',
                          }}
                        >
                          Budget
                        </th>
                        <th
                          style={{
                            padding: '0.875rem',
                            textAlign: 'left',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#6c757d',
                          }}
                        >
                          Location
                        </th>
                        <th
                          style={{
                            padding: '0.875rem',
                            textAlign: 'left',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#6c757d',
                          }}
                        >
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map(task => (
                        <tr key={task._id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                          <td style={{ padding: '1rem 0.875rem' }}>
                            <div style={{ fontWeight: '600', color: '#2c3e50', maxWidth: '250px' }}>{task.title}</div>
                          </td>
                          <td style={{ padding: '1rem 0.875rem', fontSize: '0.9375rem', color: '#6c757d' }}>
                            {task.clientId?.firstName} {task.clientId?.lastName}
                          </td>
                          <td style={{ padding: '1rem 0.875rem', fontSize: '0.9375rem', color: '#6c757d' }}>
                            {task.assignedWorkerId ? (
                              <>
                                {task.assignedWorkerId.firstName} {task.assignedWorkerId.lastName}
                              </>
                            ) : (
                              <span style={{ color: '#adb5bd' }}>Not assigned</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem 0.875rem' }}>
                            <span
                              style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '6px',
                                fontSize: '0.8125rem',
                                fontWeight: '600',
                                background:
                                  task.status === 'OPEN'
                                    ? '#e8f5e9'
                                    : task.status === 'IN_PROGRESS'
                                    ? '#fff3e0'
                                    : task.status === 'COMPLETED'
                                    ? '#e3f2fd'
                                    : '#ffebee',
                                color:
                                  task.status === 'OPEN'
                                    ? '#2e7d32'
                                    : task.status === 'IN_PROGRESS'
                                    ? '#f57c00'
                                    : task.status === 'COMPLETED'
                                    ? '#1976d2'
                                    : '#d32f2f',
                              }}
                            >
                              {task.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: '1rem 0.875rem',
                              fontSize: '0.9375rem',
                              fontWeight: '600',
                              color: '#063c7a',
                            }}
                          >
                            ৳{task.budget.toLocaleString()}
                          </td>
                          <td style={{ padding: '1rem 0.875rem', fontSize: '0.875rem', color: '#6c757d' }}>
                            {task.location.city}, {task.location.district}
                          </td>
                          <td style={{ padding: '1rem 0.875rem', fontSize: '0.875rem', color: '#6c757d' }}>
                            {new Date(task.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {tasks.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>No tasks found</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Dispute Resolution Tab */}
          {activeTab === 'disputes' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                }}
              >
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#063c7a' }}>
                  Dispute Resolution
                </h2>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <Filter size={18} color="#6c757d" />
                  <select
                    value={ticketFilter}
                    onChange={e => {
                      setTicketFilter(e.target.value)
                      setTimeout(fetchTickets, 100)
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '0.9375rem',
                      outline: 'none',
                    }}
                  >
                    <option value="ALL">All Tickets</option>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>

              <div
                style={{ display: 'grid', gridTemplateColumns: selectedTicket ? '1fr 1.5fr' : '1fr', gap: '1.5rem' }}
              >
                {/* Ticket List */}
                <div
                  style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    maxHeight: '600px',
                    overflowY: 'auto',
                  }}
                >
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>Loading tickets...</div>
                  ) : tickets.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>No tickets found</div>
                  ) : (
                    tickets.map(ticket => (
                      <div
                        key={ticket._id}
                        onClick={() => setSelectedTicket(ticket)}
                        style={{
                          padding: '1rem',
                          borderBottom: '1px solid #e0e0e0',
                          cursor: 'pointer',
                          background: selectedTicket?._id === ticket._id ? '#f8f9fa' : 'white',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => {
                          if (selectedTicket?._id !== ticket._id) {
                            e.currentTarget.style.background = '#fafbfc'
                          }
                        }}
                        onMouseLeave={e => {
                          if (selectedTicket?._id !== ticket._id) {
                            e.currentTarget.style.background = 'white'
                          }
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start',
                            marginBottom: '0.5rem',
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontWeight: '600',
                                color: '#2c3e50',
                                marginBottom: '0.25rem',
                                fontSize: '0.9375rem',
                              }}
                            >
                              {ticket.subject}
                            </div>
                            <div style={{ fontSize: '0.8125rem', color: '#6c757d' }}>
                              From: {ticket.userId.firstName} {ticket.userId.lastName} ({ticket.userId.role})
                            </div>
                          </div>
                          <span
                            style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              background:
                                ticket.status === 'OPEN'
                                  ? '#e8f5e9'
                                  : ticket.status === 'IN_PROGRESS'
                                  ? '#fff3e0'
                                  : ticket.status === 'RESOLVED'
                                  ? '#e3f2fd'
                                  : '#f5f5f5',
                              color:
                                ticket.status === 'OPEN'
                                  ? '#2e7d32'
                                  : ticket.status === 'IN_PROGRESS'
                                  ? '#f57c00'
                                  : ticket.status === 'RESOLVED'
                                  ? '#1976d2'
                                  : '#6c757d',
                            }}
                          >
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
                              background:
                                ticket.priority === 'URGENT'
                                  ? '#ffebee'
                                  : ticket.priority === 'HIGH'
                                  ? '#fff3e0'
                                  : '#f8f9fa',
                              color:
                                ticket.priority === 'URGENT'
                                  ? '#d32f2f'
                                  : ticket.priority === 'HIGH'
                                  ? '#f57c00'
                                  : '#6c757d',
                            }}
                          >
                            {ticket.priority}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#adb5bd', marginLeft: 'auto' }}>
                            {new Date(ticket.lastMessageAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Ticket Detail */}
                {selectedTicket && (
                  <div
                    style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      maxHeight: '600px',
                    }}
                  >
                    {/* Ticket Header */}
                    <div
                      style={{
                        padding: '1rem 1.25rem',
                        borderBottom: '1px solid #e0e0e0',
                        background: '#f8f9fa',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <div>
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
                          <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                            From: {selectedTicket.userId.firstName} {selectedTicket.userId.lastName} (
                            {selectedTicket.userId.role})
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedTicket(null)}
                          style={{
                            padding: '0.5rem',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#6c757d',
                          }}
                        >
                          ✕
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
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
                            background:
                              selectedTicket.priority === 'URGENT'
                                ? '#ffebee'
                                : selectedTicket.priority === 'HIGH'
                                ? '#fff3e0'
                                : '#f8f9fa',
                            color:
                              selectedTicket.priority === 'URGENT'
                                ? '#d32f2f'
                                : selectedTicket.priority === 'HIGH'
                                ? '#f57c00'
                                : '#6c757d',
                            border: '1px solid #e0e0e0',
                          }}
                        >
                          {selectedTicket.priority}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(status => (
                          <button
                            key={status}
                            onClick={() => handleUpdateTicketStatus(selectedTicket._id, status)}
                            style={{
                              padding: '0.375rem 0.75rem',
                              background:
                                selectedTicket.status === status
                                  ? 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)'
                                  : 'white',
                              color: selectedTicket.status === status ? 'white' : '#6c757d',
                              border: '1px solid #e0e0e0',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                          >
                            {status.replace('_', ' ')}
                          </button>
                        ))}
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
                            alignItems: msg.senderRole === 'ADMIN' ? 'flex-end' : 'flex-start',
                          }}
                        >
                          <div
                            style={{
                              maxWidth: '80%',
                              background:
                                msg.senderRole === 'ADMIN'
                                  ? 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)'
                                  : 'white',
                              color: msg.senderRole === 'ADMIN' ? 'white' : '#2c3e50',
                              padding: '0.875rem 1.125rem',
                              borderRadius: msg.senderRole === 'ADMIN' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                              border: msg.senderRole === 'ADMIN' ? 'none' : '1px solid #e0e0e0',
                            }}
                          >
                            <div
                              style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.375rem', fontWeight: '600' }}
                            >
                              {msg.senderId.firstName} {msg.senderId.lastName} ({msg.senderRole})
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

                    {/* Reply Input */}
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
                          disabled={!replyMessage.trim()}
                          style={{
                            padding: '0.75rem 1.25rem',
                            background: replyMessage.trim()
                              ? 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)'
                              : '#e9ecef',
                            color: replyMessage.trim() ? 'white' : '#adb5bd',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.9375rem',
                            fontWeight: '600',
                            cursor: replyMessage.trim() ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s',
                          }}
                        >
                          <Send size={16} />
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
