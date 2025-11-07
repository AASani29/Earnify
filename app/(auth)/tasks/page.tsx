'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useJWTAuthContext } from '@/config/Auth'
import { Task, TaskCategory } from '@/lib/types'

const categories = [
  { value: '', label: 'All Categories' },
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

export default function TasksPage() {
  const router = useRouter()
  const { user, controller, isLoggedIn } = useJWTAuthContext()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    status: 'OPEN',
  })

  // Get access token from controller
  const getAccessToken = () => controller.getAccessToken()

  useEffect(() => {
    fetchTasks()
  }, [filters])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (filters.category) params.append('category', filters.category)
      if (filters.search) params.append('search', filters.search)
      if (filters.status) params.append('status', filters.status)

      const response = await fetch(`/api/tasks?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch tasks')
      }

      const data = await response.json()
      setTasks(data.tasks)
    } catch (err: any) {
      console.error('Error fetching tasks:', err)
      setError('Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    })
  }

  const getCategoryLabel = (category: string) => {
    return categories.find(c => c.value === category)?.label || category
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Tasks</h1>
          <p className="text-gray-600">Find tasks that match your skills</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                id="search"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search tasks..."
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">{error}</div>}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading tasks...</p>
          </div>
        )}

        {/* Tasks List */}
        {!loading && tasks.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No tasks found</p>
          </div>
        )}

        {!loading && tasks.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {tasks.map(task => (
              <div
                key={task._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/tasks/${task._id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{task.title}</h3>
                    <p className="text-gray-600 line-clamp-2">{task.description}</p>
                  </div>
                  <div className="ml-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
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
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Budget</p>
                    <p className="font-semibold text-gray-900">৳{task.budget.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-semibold text-gray-900">{getCategoryLabel(task.category)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-semibold text-gray-900">{task.location.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Posted</p>
                    <p className="font-semibold text-gray-900">{formatDate(task.createdAt)}</p>
                  </div>
                </div>

                {task.skillsRequired && task.skillsRequired.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {task.skillsRequired.map((skill: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
