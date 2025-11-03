'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useJWTAuthContext } from '@/config/Auth'

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
  const { user, controller, isLoading } = useJWTAuthContext()
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
  if (user && user.role !== 'CLIENT') {
    router.push('/dashboard')
    return null
  }

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
    <div className="form-container">
      <div className="form-card">
        <div className="form-header">
          <h1 className="form-title">📋 Post a New Task</h1>
          <p className="form-subtitle">Fill in the details below to post your task and find the perfect worker</p>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title" className="form-label form-label-required">
              Task Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., Need someone to deliver packages"
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description" className="form-label form-label-required">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Describe the task in detail..."
            />
          </div>

          {/* Category and Budget */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category" className="form-label form-label-required">
                Category
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="budget" className="form-label form-label-required">
                Budget (৳ BDT)
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
                className="form-input"
                placeholder="e.g., 500"
              />
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label htmlFor="address" className="form-label form-label-required">
              📍 Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              className="form-input"
              placeholder="Street address"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city" className="form-label form-label-required">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Dhaka"
              />
            </div>

            <div className="form-group">
              <label htmlFor="district" className="form-label form-label-required">
                District
              </label>
              <select
                id="district"
                name="district"
                required
                value={formData.district}
                onChange={handleChange}
                className="form-select"
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
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="deadline" className="form-label">
                ⏰ Deadline
              </label>
              <input
                type="datetime-local"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="estimatedDuration" className="form-label">
                ⏱️ Estimated Duration (hours)
              </label>
              <input
                type="number"
                id="estimatedDuration"
                name="estimatedDuration"
                min="0"
                step="0.5"
                value={formData.estimatedDuration}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., 2"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="skillsRequired" className="form-label">
              🛠️ Skills Required
            </label>
            <input
              type="text"
              id="skillsRequired"
              name="skillsRequired"
              value={formData.skillsRequired}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., Driving, Navigation, Customer Service"
            />
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? '⏳ Creating Task...' : '✨ Post Task'}
            </button>
            <button type="button" onClick={() => router.back()} className="btn-cancel">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
