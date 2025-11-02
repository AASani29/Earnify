import { JWTAuthConfig, createJWTAuthProvider } from 'next-jwt-auth'
import { useContext } from 'react'
import { LoggedInUser } from '../types/Auth'

export const authConfig: JWTAuthConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  user: {
    property: 'user',
  },
  accessToken: {
    property: 'access.token',
    expireTimeProperty: 'access.expiresAt',
  },
  refreshToken: {
    property: 'refresh.token',
    expireTimeProperty: 'refresh.expiresAt',
  },
  endpoints: {
    login: { url: '/api/auth/signin', method: 'post' },
    logout: { url: '/api/auth/signout', method: 'post' },
    refresh: { url: '/api/auth/refresh-token', method: 'post' },
    user: { url: '/api/auth/profile', method: 'get' },
  },
  pages: {
    login: { url: '/login' },
  },
  unauthorizedStatusCode: 401,
}

export const { JWTAuthContext, JWTAuthProvider } = createJWTAuthProvider<LoggedInUser>()

export const useJWTAuthContext = () => {
  const context = useContext(JWTAuthContext)
  if (!context) {
    throw new Error('JWTAuthContext not found')
  }
  return context
}

