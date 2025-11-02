import { NextRequest, NextResponse } from 'next/server'
import { findUserById } from '@/lib/users'
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  revokeRefreshToken,
  getTokenExpiry,
} from '@/lib/jwt'
import { config } from '@/lib/config'
import { AuthResponse } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json()

    if (!refreshToken) {
      return NextResponse.json(
        { message: 'Refresh token is required' },
        { status: 400 }
      )
    }

    const payload = verifyRefreshToken(refreshToken)

    if (!payload) {
      return NextResponse.json(
        { message: 'Invalid or expired refresh token' },
        { status: 401 }
      )
    }

    const user = findUserById(payload.id)

    if (!user || !user.active) {
      return NextResponse.json(
        { message: 'User not found or inactive' },
        { status: 401 }
      )
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      type: user.type,
    }

    const newAccessToken = generateAccessToken(tokenPayload)
    const newRefreshToken = generateRefreshToken(tokenPayload)

    revokeRefreshToken(refreshToken)

    const response: AuthResponse = {
      user,
      access: {
        token: newAccessToken,
        expiresAt: getTokenExpiry(config.accessTokenExpiry).toISOString(),
      },
      refresh: {
        token: newRefreshToken,
        expiresAt: getTokenExpiry(config.refreshTokenExpiry).toISOString(),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

