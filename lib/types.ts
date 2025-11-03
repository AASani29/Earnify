export type UserRole = 'ADMIN' | 'CLIENT' | 'WORKER'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  phoneNumber?: string
  profileCompleted: boolean
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface TokenPayload {
  id: string
  email: string
  role: UserRole
}

export interface AuthResponse {
  user: User
  access: {
    token: string
    expiresAt: string
  }
  refresh: {
    token: string
    expiresAt: string
  }
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
  phoneNumber?: string
}

// Task Types
export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type TaskCategory =
  | 'DELIVERY'
  | 'CLEANING'
  | 'TECH_SUPPORT'
  | 'HANDYMAN'
  | 'TUTORING'
  | 'PHOTOGRAPHY'
  | 'WRITING'
  | 'DESIGN'
  | 'OTHER'

export interface TaskLocation {
  address: string
  city: string
  district: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface Task {
  id: string
  title: string
  description: string
  category: TaskCategory
  budget: number
  currency: string
  location: TaskLocation
  deadline?: string
  status: TaskStatus
  clientId: string
  assignedWorkerId?: string
  skillsRequired: string[]
  estimatedDuration?: number
  images?: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateTaskData {
  title: string
  description: string
  category: TaskCategory
  budget: number
  currency?: string
  location: TaskLocation
  deadline?: string
  skillsRequired?: string[]
  estimatedDuration?: number
  images?: string[]
}

// Task Application Types
export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'

export interface TaskApplication {
  id: string
  taskId: string
  workerId: string
  coverLetter: string
  proposedBudget?: number
  estimatedCompletionTime?: number
  status: ApplicationStatus
  appliedAt: string
  respondedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateApplicationData {
  taskId: string
  coverLetter: string
  proposedBudget?: number
  estimatedCompletionTime?: number
}

