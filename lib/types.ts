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

