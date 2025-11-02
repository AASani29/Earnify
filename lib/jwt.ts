import jwt from 'jsonwebtoken'
import { config } from './config'
import { TokenPayload } from './types'

const refreshTokens = new Set<string>()

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwtAccessSecret, {
    expiresIn: config.accessTokenExpiry,
  })
}

export const generateRefreshToken = (payload: TokenPayload): string => {
  const token = jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.refreshTokenExpiry,
  })
  refreshTokens.add(token)
  return token
}

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, config.jwtAccessSecret) as TokenPayload
  } catch (error) {
    return null
  }
}

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    if (!refreshTokens.has(token)) return null
    return jwt.verify(token, config.jwtRefreshSecret) as TokenPayload
  } catch (error) {
    return null
  }
}

export const revokeRefreshToken = (token: string): void => {
  refreshTokens.delete(token)
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

