'use client'

import { useJWTAuthContext } from '@/config/Auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ProfilePage() {
  const { user, isLoading, controller } = useJWTAuthContext()
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

  if (isLoading || loading) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <p>Loading profile...</p>
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
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Top Navigation Bar */}
      <div style={{ background: 'white', borderBottom: '2px solid #e9ecef', marginBottom: '2rem' }}>
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '1rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>💼 Earnify</h2>
            <nav style={{ display: 'flex', gap: '1.5rem' }}>
              <a
                href={user.role === 'WORKER' ? '/dashboard/worker' : '/dashboard/client'}
                style={{
                  color: '#6c757d',
                  fontWeight: '500',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#667eea')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6c757d')}
              >
                Dashboard
              </a>
              <a
                href="/profile"
                style={{
                  color: '#667eea',
                  fontWeight: '600',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                  borderBottom: '2px solid #667eea',
                }}
              >
                👤 My Profile
              </a>
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                {user.firstName} {user.lastName}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>{user.role}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1rem 2rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>👤 My Profile</h1>
            <p style={{ color: '#6c757d' }}>Manage your profile information and skills</p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              style={{
                background: '#667eea',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="success" style={{ marginBottom: '1.5rem' }}>
            {success}
          </div>
        )}
        {error && (
          <div className="error" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {/* Profile Content */}
        <div className="card">
          {editing || !profile || Object.keys(profile).length === 0 ? (
            // Edit Mode (or empty profile)
            <form onSubmit={handleSubmit}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                Edit Profile Information
              </h2>

              {user.role === 'WORKER' && (
                <>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Bio</label>
                    <textarea
                      name="bio"
                      className="input"
                      value={formData.bio || ''}
                      onChange={handleChange}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      maxLength={500}
                      style={{ width: '100%', resize: 'vertical' }}
                    />
                    <small style={{ color: '#666', fontSize: '0.875rem' }}>Max 500 characters</small>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                      Skills (comma-separated) *
                    </label>
                    <input
                      type="text"
                      name="skills"
                      className="input"
                      value={formData.skills?.join(', ') || ''}
                      onChange={handleSkillsChange}
                      placeholder="e.g., Plumbing, Electrical Work, Carpentry"
                      required
                    />
                    <small style={{ color: '#666', fontSize: '0.875rem' }}>Separate skills with commas</small>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Experience</label>
                    <textarea
                      name="experience"
                      className="input"
                      value={formData.experience || ''}
                      onChange={handleChange}
                      placeholder="Describe your work experience..."
                      rows={4}
                      maxLength={1000}
                      style={{ width: '100%', resize: 'vertical' }}
                    />
                    <small style={{ color: '#666', fontSize: '0.875rem' }}>Max 1000 characters</small>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                        Hourly Rate (৳ BDT)
                      </label>
                      <input
                        type="number"
                        name="hourlyRate"
                        className="input"
                        value={formData.hourlyRate || ''}
                        onChange={handleChange}
                        placeholder="e.g., 500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>City</label>
                      <input
                        type="text"
                        name="city"
                        className="input"
                        value={formData.city || ''}
                        onChange={handleChange}
                        placeholder="e.g., Dhaka"
                      />
                    </div>
                  </div>
                </>
              )}

              {user.role === 'CLIENT' && (
                <>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      className="input"
                      value={formData.companyName || ''}
                      onChange={handleChange}
                      placeholder="Your company name"
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                      Company Description
                    </label>
                    <textarea
                      name="companyDescription"
                      className="input"
                      value={formData.companyDescription || ''}
                      onChange={handleChange}
                      placeholder="Tell us about your company..."
                      rows={4}
                      maxLength={1000}
                      style={{ width: '100%', resize: 'vertical' }}
                    />
                    <small style={{ color: '#666', fontSize: '0.875rem' }}>Max 1000 characters</small>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Industry</label>
                      <input
                        type="text"
                        name="industry"
                        className="input"
                        value={formData.industry || ''}
                        onChange={handleChange}
                        placeholder="e.g., Construction, IT Services"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Website</label>
                      <input
                        type="url"
                        name="website"
                        className="input"
                        value={formData.website || ''}
                        onChange={handleChange}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>City</label>
                      <input
                        type="text"
                        name="city"
                        className="input"
                        value={formData.city || ''}
                        onChange={handleChange}
                        placeholder="e.g., Dhaka"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Area</label>
                      <input
                        type="text"
                        name="area"
                        className="input"
                        value={formData.area || ''}
                        onChange={handleChange}
                        placeholder="e.g., Gulshan"
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Address</label>
                    <input
                      type="text"
                      name="address"
                      className="input"
                      value={formData.address || ''}
                      onChange={handleChange}
                      placeholder="Full address"
                    />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
                  {saving ? 'Saving...' : '💾 Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false)
                    setFormData(profile)
                    setError('')
                  }}
                  className="btn"
                  style={{ background: '#e9ecef', color: '#495057' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            // View Mode
            <>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Profile Information</h2>

              {user.role === 'WORKER' && (
                <>
                  {profile.bio && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#495057' }}>Bio</h3>
                      <p style={{ color: '#6c757d', lineHeight: '1.6' }}>{profile.bio}</p>
                    </div>
                  )}

                  {profile.skills && profile.skills.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ fontWeight: '600', marginBottom: '0.75rem', color: '#495057' }}>Skills</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {profile.skills.map((skill: string, index: number) => (
                          <span
                            key={index}
                            style={{
                              padding: '0.5rem 1rem',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              borderRadius: '20px',
                              fontSize: '0.9rem',
                              fontWeight: '500',
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.experience && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#495057' }}>Experience</h3>
                      <p style={{ color: '#6c757d', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                        {profile.experience}
                      </p>
                    </div>
                  )}

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem',
                      marginTop: '1.5rem',
                      padding: '1.5rem',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                    }}
                  >
                    {profile.hourlyRate && (
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                          Hourly Rate
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#28a745' }}>
                          ৳{profile.hourlyRate} BDT
                        </div>
                      </div>
                    )}
                    {profile.city && (
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>Location</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#495057' }}>📍 {profile.city}</div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {user.role === 'CLIENT' && (
                <>
                  {profile.companyName && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#495057' }}>Company Name</h3>
                      <p style={{ color: '#6c757d', fontSize: '1.1rem', fontWeight: '600' }}>{profile.companyName}</p>
                    </div>
                  )}

                  {profile.companyDescription && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#495057' }}>
                        Company Description
                      </h3>
                      <p style={{ color: '#6c757d', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                        {profile.companyDescription}
                      </p>
                    </div>
                  )}

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem',
                      marginTop: '1.5rem',
                      padding: '1.5rem',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                    }}
                  >
                    {profile.industry && (
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>Industry</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#495057' }}>
                          🏭 {profile.industry}
                        </div>
                      </div>
                    )}
                    {profile.website && (
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>Website</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#495057' }}>
                          <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#667eea', textDecoration: 'none' }}
                          >
                            🌐 {profile.website}
                          </a>
                        </div>
                      </div>
                    )}
                    {profile.city && (
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>Location</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#495057' }}>
                          📍 {profile.city}
                          {profile.area && `, ${profile.area}`}
                        </div>
                      </div>
                    )}
                    {profile.address && (
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>Address</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#495057' }}>
                          🏢 {profile.address}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
