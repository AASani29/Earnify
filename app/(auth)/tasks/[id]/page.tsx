'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useJWTAuthContext } from '@/config/Auth'

export default function TaskDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { user, controller, isLoading } = useJWTAuthContext()
  const [task, setTask] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    proposedBudget: '',
    estimatedCompletionTime: '',
  })
  const [submitting, setSubmitting] = useState(false)

  // Get access token from controller
  const getAccessToken = () => controller.getAccessToken()

  useEffect(() => {
    fetchTask()
  }, [params.id])

  const fetchTask = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tasks/${params.id}`)

      if (!response.ok) {
        throw new Error('Failed to fetch task')
      }

      const data = await response.json()
      setTask(data.task)
    } catch (err: any) {
      console.error('Error fetching task:', err)
      setError('Failed to fetch task')
    } finally {
      setLoading(false)
    }
  }

  const handleApplicationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setApplicationData({
      ...applicationData,
      [e.target.name]: e.target.value,
    })
  }

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const data = {
        coverLetter: applicationData.coverLetter,
        proposedBudget: applicationData.proposedBudget ? parseFloat(applicationData.proposedBudget) : undefined,
        estimatedCompletionTime: applicationData.estimatedCompletionTime
          ? parseFloat(applicationData.estimatedCompletionTime)
          : undefined,
      }

      const accessToken = getAccessToken()
      const response = await fetch(`/api/tasks/${params.id}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit application')
      }

      alert('Application submitted successfully!')
      setShowApplicationForm(false)
      router.push('/dashboard/worker')
    } catch (err: any) {
      console.error('Error submitting application:', err)
      setError(err.message || 'Failed to submit application')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading task...</p>
        </div>
      </div>
    )
  }

  if (error && !task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!task) return null

  const isWorker = user?.role === 'WORKER'
  const isClient = user?.role === 'CLIENT'
  const isOwner = task.clientId._id === user?.id

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button onClick={() => router.back()} className="mb-4 text-blue-600 hover:text-blue-700 flex items-center">
          ← Back
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{task.title}</h1>
              <p className="text-gray-600">
                Posted by {task.clientId.firstName} {task.clientId.lastName}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                task.status === 'OPEN'
                  ? 'bg-green-100 text-green-800'
                  : task.status === 'IN_PROGRESS'
                  ? 'bg-blue-100 text-blue-800'
                  : task.status === 'COMPLETED'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {task.status.replace('_', ' ')}
            </span>
          </div>

          {/* Key Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500 mb-1">Budget</p>
              <p className="text-2xl font-bold text-gray-900">৳{task.budget.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Category</p>
              <p className="text-lg font-semibold text-gray-900">{task.category.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Duration</p>
              <p className="text-lg font-semibold text-gray-900">
                {task.estimatedDuration ? `${task.estimatedDuration} hrs` : 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Deadline</p>
              <p className="text-lg font-semibold text-gray-900">
                {task.deadline ? formatDate(task.deadline) : 'Flexible'}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
          </div>

          {/* Location */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Location</h2>
            <p className="text-gray-700">{task.location.address}</p>
            <p className="text-gray-700">
              {task.location.city}, {task.location.district}
            </p>
          </div>

          {/* Skills Required */}
          {task.skillsRequired && task.skillsRequired.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Skills Required</h2>
              <div className="flex flex-wrap gap-2">
                {task.skillsRequired.map((skill: string, index: number) => (
                  <span key={index} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">{error}</div>}

          {/* Actions */}
          {isWorker && task.status === 'OPEN' && !showApplicationForm && (
            <button
              onClick={() => setShowApplicationForm(true)}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 font-medium text-lg"
            >
              Apply for this Task
            </button>
          )}

          {isClient && isOwner && (
            <button
              onClick={() => router.push(`/dashboard/client?taskId=${task._id}`)}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 font-medium text-lg"
            >
              Manage Applications
            </button>
          )}

          {/* Application Form */}
          {showApplicationForm && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Submit Your Application</h2>
              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter *
                  </label>
                  <textarea
                    id="coverLetter"
                    name="coverLetter"
                    required
                    rows={5}
                    value={applicationData.coverLetter}
                    onChange={handleApplicationChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Explain why you're the best fit for this task..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="proposedBudget" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Proposed Budget (BDT)
                    </label>
                    <input
                      type="number"
                      id="proposedBudget"
                      name="proposedBudget"
                      min="0"
                      step="0.01"
                      value={applicationData.proposedBudget}
                      onChange={handleApplicationChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Original: ৳${task.budget}`}
                    />
                  </div>

                  <div>
                    <label htmlFor="estimatedCompletionTime" className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Time (hours)
                    </label>
                    <input
                      type="number"
                      id="estimatedCompletionTime"
                      name="estimatedCompletionTime"
                      min="0"
                      step="0.5"
                      value={applicationData.estimatedCompletionTime}
                      onChange={handleApplicationChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 2"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                  >
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowApplicationForm(false)}
                    className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
