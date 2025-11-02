'use client'

import { useJWTAuthContext } from '@/config/Auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import axios from 'axios'

export default function ProfileSetupPage() {
  const { user, isLoading } = useJWTAuthContext()
  const router = useRouter()
  const [formData, setFormData] = useState<any>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (isLoading) {
    return (
      <div className="container">
        <div className="card">Loading...</div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  if (user.profileCompleted) {
    // Redirect to dashboard if profile is already completed
    router.push('/dashboard')
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(',').map((s) => s.trim())
    setFormData((prev: any) => ({ ...prev, skills }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      // TODO: Create API endpoint to save profile
      await axios.post('/api/profile/setup', {
        ...formData,
        role: user.role,
      })

      // Redirect to dashboard after successful profile setup
      router.push('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Worker Profile Form
  if (user.role === 'WORKER') {
    return (
      <div className="container">
        <div className="card">
          <h1 style={{ marginBottom: '1.5rem' }}>Complete Your Worker Profile</h1>
          <p style={{ marginBottom: '2rem', color: '#666' }}>
            Help clients find you by completing your profile with your skills and experience.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Bio</label>
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

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Skills *</label>
              <input
                type="text"
                name="skills"
                className="input"
                onChange={handleSkillsChange}
                placeholder="e.g., Plumbing, Electrical Work, Carpentry"
                required
              />
              <small style={{ color: '#666', fontSize: '0.875rem' }}>Separate skills with commas</small>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Experience</label>
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

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Hourly Rate (BDT)</label>
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

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>City</label>
              <input
                type="text"
                name="city"
                className="input"
                value={formData.city || ''}
                onChange={handleChange}
                placeholder="e.g., Dhaka"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Area</label>
              <input
                type="text"
                name="area"
                className="input"
                value={formData.area || ''}
                onChange={handleChange}
                placeholder="e.g., Gulshan"
              />
            </div>

            {error && <div className="error" style={{ marginBottom: '1rem' }}>{error}</div>}

            <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%' }}>
              {isSubmitting ? 'Saving...' : 'Complete Profile'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Client Profile Form
  if (user.role === 'CLIENT') {
    return (
      <div className="container">
        <div className="card">
          <h1 style={{ marginBottom: '1.5rem' }}>Complete Your Client Profile</h1>
          <p style={{ marginBottom: '2rem', color: '#666' }}>
            Complete your company profile to start posting tasks and hiring workers.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Company Name</label>
              <input
                type="text"
                name="companyName"
                className="input"
                value={formData.companyName || ''}
                onChange={handleChange}
                placeholder="Your company name"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Company Description</label>
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

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Industry</label>
              <input
                type="text"
                name="industry"
                className="input"
                value={formData.industry || ''}
                onChange={handleChange}
                placeholder="e.g., Construction, IT Services, Retail"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Website</label>
              <input
                type="url"
                name="website"
                className="input"
                value={formData.website || ''}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>City</label>
              <input
                type="text"
                name="city"
                className="input"
                value={formData.city || ''}
                onChange={handleChange}
                placeholder="e.g., Dhaka"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Area</label>
              <input
                type="text"
                name="area"
                className="input"
                value={formData.area || ''}
                onChange={handleChange}
                placeholder="e.g., Gulshan"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Address</label>
              <input
                type="text"
                name="address"
                className="input"
                value={formData.address || ''}
                onChange={handleChange}
                placeholder="Full address"
              />
            </div>

            {error && <div className="error" style={{ marginBottom: '1rem' }}>{error}</div>}

            <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%' }}>
              {isSubmitting ? 'Saving...' : 'Complete Profile'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return null
}

