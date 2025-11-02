import { AuthUser } from 'next-jwt-auth'

export type UserRole = 'ADMIN' | 'CLIENT' | 'WORKER'

export interface LoggedInUser extends AuthUser {
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

