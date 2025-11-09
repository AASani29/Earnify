'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useJWTAuthContext } from '@/config/Auth'
import AuthNavbar from '@/components/AuthNavbar'
import {
  FileText,
  DollarSign,
  MapPin,
  Calendar,
  Clock,
  Briefcase,
  AlertCircle,
  CheckCircle,
  Wrench,
} from 'lucide-react'

const categories = [
  { value: 'DELIVERY', label: 'Delivery' },
  { value: 'CLEANING', label: 'Cleaning' },
  { value: 'TECH_SUPPORT', label: 'Tech Support' },
  { value: 'HANDYMAN', label: 'Handyman' },
  { value: 'TUTORING', label: 'Tutoring' },
  { value: 'PHOTOGRAPHY', label: 'Photography' },
  { value: 'WRITING', label: 'Writing' },
  { value: 'DESIGN', label: 'Design' },
  { value: 'OTHER', label: 'Other' },
]

const bangladeshDistricts = [
  'Dhaka',
  'Chittagong',
  'Rajshahi',
  'Khulna',
  'Barisal',
  'Sylhet',
  'Rangpur',
  'Mymensingh',
  'Comilla',
  'Gazipur',
  'Narayanganj',
  'Tangail',
  'Jessore',
  'Bogra',
  'Dinajpur',
  "Cox's Bazar",
]

export default function CreateTaskPage() {
  const router = useRouter()
  const { user, controller, isLoggedIn } = useJWTAuthContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Get access token from controller
  const getAccessToken = () => controller.getAccessToken()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    currency: 'BDT',
    address: '',
    city: '',
    district: '',
    deadline: '',
    skillsRequired: '',
    estimatedDuration: '',
  })

  // Redirect if not a client
  useEffect(() => {
    if (user && user.role !== 'CLIENT') {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        budget: parseFloat(formData.budget),
        currency: formData.currency,
        location: {
          address: formData.address,
          city: formData.city,
          district: formData.district,
        },
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
        skillsRequired: formData.skillsRequired ? formData.skillsRequired.split(',').map(s => s.trim()) : [],
        estimatedDuration: formData.estimatedDuration ? parseFloat(formData.estimatedDuration) : undefined,
      }

      const accessToken = getAccessToken()
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(taskData),
      })

      if (response.ok) {
        router.push('/dashboard/client')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create task')
      }
    } catch (err: any) {
      console.error('Error creating task:', err)
      setError('Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <AuthNavbar />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
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
              <FileText size={32} color="white" strokeWidth={2} />
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>Post a New Task</h1>
              <p style={{ color: '#666', fontSize: '1rem', margin: 0 }}>
                Fill in the details below to post your task and find the perfect worker
              </p>
            </div>
          </div>
        </div>

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
          {/* Title */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="title"
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
              <FileText size={16} color="#063c7a" strokeWidth={2} />
              Task Title <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Need someone to deliver packages"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '0.9375rem',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = '#063c7a'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 60, 122, 0.1)'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = '#e0e0e0'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="description"
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
              <FileText size={16} color="#063c7a" strokeWidth={2} />
              Description <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the task in detail..."
              rows={5}
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
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = '#063c7a'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 60, 122, 0.1)'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = '#e0e0e0'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Category and Budget */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label
                htmlFor="category"
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
                Category <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '0.9375rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                  background: 'white',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#063c7a'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 60, 122, 0.1)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = '#e0e0e0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="budget"
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
                Budget (৳ BDT) <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="number"
                id="budget"
                name="budget"
                required
                min="0"
                step="0.01"
                value={formData.budget}
                onChange={handleChange}
                placeholder="e.g., 500"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '0.9375rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#063c7a'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 60, 122, 0.1)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = '#e0e0e0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Location */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="address"
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
              Address <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '0.9375rem',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = '#063c7a'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 60, 122, 0.1)'
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
                htmlFor="city"
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
                City <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                id="city"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g., Dhaka"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '0.9375rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#063c7a'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 60, 122, 0.1)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = '#e0e0e0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            <div>
              <label
                htmlFor="district"
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
                District <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                id="district"
                name="district"
                required
                value={formData.district}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '0.9375rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                  background: 'white',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#063c7a'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 60, 122, 0.1)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = '#e0e0e0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <option value="">Select a district</option>
                {bangladeshDistricts.map(district => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label
                htmlFor="deadline"
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
                <Calendar size={16} color="#063c7a" strokeWidth={2} />
                Deadline
              </label>
              <input
                type="datetime-local"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '0.9375rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#063c7a'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 60, 122, 0.1)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = '#e0e0e0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            <div>
              <label
                htmlFor="estimatedDuration"
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
                <Clock size={16} color="#063c7a" strokeWidth={2} />
                Estimated Duration (hours)
              </label>
              <input
                type="number"
                id="estimatedDuration"
                name="estimatedDuration"
                min="0"
                step="0.5"
                value={formData.estimatedDuration}
                onChange={handleChange}
                placeholder="e.g., 2"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '0.9375rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#063c7a'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 60, 122, 0.1)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = '#e0e0e0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label
              htmlFor="skillsRequired"
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
              <Wrench size={16} color="#063c7a" strokeWidth={2} />
              Skills Required
            </label>
            <input
              type="text"
              id="skillsRequired"
              name="skillsRequired"
              value={formData.skillsRequired}
              onChange={handleChange}
              placeholder="e.g., Driving, Navigation, Customer Service"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '0.9375rem',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = '#063c7a'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 60, 122, 0.1)'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = '#e0e0e0'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => router.back()}
              style={{
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 2rem',
                background: loading ? '#ccc' : '#063c7a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.9375rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.background = '#084d99'
                }
              }}
              onMouseLeave={e => {
                if (!loading) {
                  e.currentTarget.style.background = '#063c7a'
                }
              }}
            >
              {loading ? (
                <>Creating Task...</>
              ) : (
                <>
                  <CheckCircle size={18} strokeWidth={2} />
                  Post Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
