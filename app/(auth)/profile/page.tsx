'use client'

import { useJWTAuthContext } from '@/config/Auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AuthNavbar from '@/components/AuthNavbar'
import {
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  DollarSign,
  Edit,
  Save,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

export default function ProfilePage() {
  const { user, isLoggedIn, controller } = useJWTAuthContext()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const getAccessToken = () => controller.getAccessToken()

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return
    try {
      setLoading(true)
      const accessToken = getAccessToken()

      if (!accessToken) {
        console.error('No access token available')
        // Set empty profile to allow editing
        setProfile({})
        setFormData({})
        setLoading(false)
        return
      }

      const response = await fetch('/api/profile', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile || {})
        setFormData(data.profile || {})
      } else {
        console.error('Failed to fetch profile:', response.status)
        // Set empty profile to allow editing
        setProfile({})
        setFormData({})
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      // Set empty profile to allow editing
      setProfile({})
      setFormData({})
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value
      .split(',')
      .map(s => s.trim())
      .filter(s => s)
    setFormData((prev: any) => ({ ...prev, skills }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const accessToken = getAccessToken()
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setFormData(data.profile)
        setSuccess('Profile updated successfully!')
        setEditing(false)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update profile')
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (isLoggedIn === null || loading) {
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
            <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1a1a1a' }}>Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <AuthNavbar />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={32} color="white" strokeWidth={2} />
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>My Profile</h1>
              <p style={{ color: '#666', fontSize: '1rem', margin: 0 }}>
                Manage your personal information and settings
              </p>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
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
                <Edit size={18} strokeWidth={2} />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div
            style={{
              background: '#d1fae5',
              border: '1px solid #6ee7b7',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <CheckCircle size={20} color="#065f46" strokeWidth={2} />
            <span style={{ color: '#065f46', fontSize: '0.9375rem' }}>{success}</span>
          </div>
        )}

        {error && (
          <div
            style={{
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <AlertCircle size={20} color="#dc2626" strokeWidth={2} />
            <span style={{ color: '#dc2626', fontSize: '0.9375rem' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Information Card */}
          <div
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid #e0e0e0',
              marginBottom: '1.5rem',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '1.5rem' }}>
              Basic Information
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#1a1a1a',
                  }}
                >
                  <User size={16} color="#063c7a" strokeWidth={2} />
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName || user.firstName || ''}
                  onChange={handleChange}
                  disabled={!editing}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '0.9375rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                    background: editing ? 'white' : '#f8f9fa',
                  }}
                  onFocus={e => {
                    if (editing) {
                      e.currentTarget.style.borderColor = '#063c7a'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 60, 122, 0.1)'
                    }
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = '#e0e0e0'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#1a1a1a',
                  }}
                >
                  <User size={16} color="#063c7a" strokeWidth={2} />
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName || user.lastName || ''}
                  onChange={handleChange}
                  disabled={!editing}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '0.9375rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                    background: editing ? 'white' : '#f8f9fa',
                  }}
                  onFocus={e => {
                    if (editing) {
                      e.currentTarget.style.borderColor = '#063c7a'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 60, 122, 0.1)'
                    }
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = '#e0e0e0'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  color: '#1a1a1a',
                }}
              >
                <Mail size={16} color="#063c7a" strokeWidth={2} />
                Email
              </label>
              <input
                type="email"
                value={user.email || ''}
                disabled
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '0.9375rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#f8f9fa',
                  color: '#999',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  color: '#1a1a1a',
                }}
              >
                <Phone size={16} color="#063c7a" strokeWidth={2} />
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber || profile?.phoneNumber || ''}
                onChange={handleChange}
                disabled={!editing}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '0.9375rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                  background: editing ? 'white' : '#f8f9fa',
                }}
                onFocus={e => {
                  if (editing) {
                    e.currentTarget.style.borderColor = '#063c7a'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 60, 122, 0.1)'
                  }
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = '#e0e0e0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Role-specific fields will be added here */}
          {user.role === 'WORKER' && (
            <div
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
                marginBottom: '1.5rem',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '1.5rem' }}>
                Worker Information
              </h2>

              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#1a1a1a',
                  }}
                >
                  <User size={16} color="#063c7a" strokeWidth={2} />
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio || profile?.bio || ''}
                  onChange={handleChange}
                  disabled={!editing}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '0.9375rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    background: editing ? 'white' : '#f8f9fa',
                  }}
                  onFocus={e => {
                    if (editing) {
                      e.currentTarget.style.borderColor = '#063c7a'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 60, 122, 0.1)'
                    }
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = '#e0e0e0'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#1a1a1a',
                    }}
                  >
                    <DollarSign size={16} color="#063c7a" strokeWidth={2} />
                    Hourly Rate (৳)
                  </label>
                  <input
                    type="number"
                    name="hourlyRate"
                    value={formData.hourlyRate || profile?.hourlyRate || ''}
                    onChange={handleChange}
                    disabled={!editing}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      fontSize: '0.9375rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box',
                      background: editing ? 'white' : '#f8f9fa',
                    }}
                    onFocus={e => {
                      if (editing) {
                        e.currentTarget.style.borderColor = '#063c7a'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 60, 122, 0.1)'
                      }
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = '#e0e0e0'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#1a1a1a',
                    }}
                  >
                    <Briefcase size={16} color="#063c7a" strokeWidth={2} />
                    Experience (years)
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience || profile?.experience || ''}
                    onChange={handleChange}
                    disabled={!editing}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      fontSize: '0.9375rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box',
                      background: editing ? 'white' : '#f8f9fa',
                    }}
                    onFocus={e => {
                      if (editing) {
                        e.currentTarget.style.borderColor = '#063c7a'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 60, 122, 0.1)'
                      }
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = '#e0e0e0'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#1a1a1a',
                    }}
                  >
                    <MapPin size={16} color="#063c7a" strokeWidth={2} />
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city || profile?.city || ''}
                    onChange={handleChange}
                    disabled={!editing}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      fontSize: '0.9375rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box',
                      background: editing ? 'white' : '#f8f9fa',
                    }}
                    onFocus={e => {
                      if (editing) {
                        e.currentTarget.style.borderColor = '#063c7a'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 60, 122, 0.1)'
                      }
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = '#e0e0e0'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#1a1a1a',
                    }}
                  >
                    <MapPin size={16} color="#063c7a" strokeWidth={2} />
                    Area
                  </label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area || profile?.area || ''}
                    onChange={handleChange}
                    disabled={!editing}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      fontSize: '0.9375rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box',
                      background: editing ? 'white' : '#f8f9fa',
                    }}
                    onFocus={e => {
                      if (editing) {
                        e.currentTarget.style.borderColor = '#063c7a'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 60, 122, 0.1)'
                      }
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = '#e0e0e0'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {editing && (
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  setFormData(profile || {})
                  setError('')
                  setSuccess('')
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: 'white',
                  color: '#666',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
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
                <X size={18} strokeWidth={2} />
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 2rem',
                  background: saving ? '#ccc' : '#063c7a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.9375rem',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  if (!saving) {
                    e.currentTarget.style.background = '#084d99'
                  }
                }}
                onMouseLeave={e => {
                  if (!saving) {
                    e.currentTarget.style.background = '#063c7a'
                  }
                }}
              >
                {saving ? (
                  <>
                    <Loader2 size={18} strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} strokeWidth={2} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
