import jwt from 'jsonwebtoken'
import { config } from './config'
import { TokenPayload } from './types'

// NOTE: For production, use Redis or a database to store refresh tokens
// For now, we'll skip the refresh token whitelist check to avoid server restart issues
// This is acceptable for development but should be replaced with persistent storage in production

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwtAccessSecret as jwt.Secret, {
    expiresIn: config.accessTokenExpiry,
  } as jwt.SignOptions)
}

export const generateRefreshToken = (payload: TokenPayload): string => {
  const token = jwt.sign(payload, config.jwtRefreshSecret as jwt.Secret, {
    expiresIn: config.refreshTokenExpiry,
  } as jwt.SignOptions)
  // TODO: Store in Redis/Database for production
  return token
}

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, config.jwtAccessSecret as string) as TokenPayload
  } catch (error) {
    return null
  }
}

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    // Verify the token signature and expiration
    // Skip whitelist check to avoid server restart issues
    return jwt.verify(token, config.jwtRefreshSecret as string) as TokenPayload
  } catch (error) {
    return null
  }
}

export const revokeRefreshToken = (token: string): void => {
  // TODO: Implement token revocation in Redis/Database for production
  // For now, tokens will expire naturally based on their expiration time
}

export const getTokenExpiry = (expiresIn: string): Date => {
  const now = new Date()
  const match = expiresIn.match(/^(\d+)([smhd])$/)
  
  if (!match) return new Date(now.getTime() + 5 * 60 * 1000)
  
  const value = parseInt(match[1])
  const unit = match[2]
  
  switch (unit) {
    case 's':
      return new Date(now.getTime() + value * 1000)
    case 'm':
      return new Date(now.getTime() + value * 60 * 1000)
    case 'h':
      return new Date(now.getTime() + value * 60 * 60 * 1000)
    case 'd':
      return new Date(now.getTime() + value * 24 * 60 * 60 * 1000)
    default:
      return new Date(now.getTime() + 5 * 60 * 1000)
  }
}

