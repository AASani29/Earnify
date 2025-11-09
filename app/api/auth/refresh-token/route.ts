import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/lib/models/User'
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

    // Connect to MongoDB and fetch user
    await connectDB()
    const dbUser = await User.findById(payload.id).select('-password').lean()

    if (!dbUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 401 }
      )
    }

    // Convert MongoDB user to response format
    const user = {
      id: dbUser._id.toString(),
      email: dbUser.email,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      role: dbUser.role,
      profileCompleted: dbUser.profileCompleted,
      isVerified: dbUser.isVerified,
      phoneNumber: dbUser.phoneNumber,
      createdAt: dbUser.createdAt.toISOString(),
      updatedAt: dbUser.updatedAt.toISOString(),
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
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
    console.error('Refresh token error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

