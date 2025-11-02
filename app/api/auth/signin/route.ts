import { NextRequest, NextResponse } from 'next/server'
import { findUserByEmail, verifyPassword } from '@/lib/users'
import { generateAccessToken, generateRefreshToken, getTokenExpiry } from '@/lib/jwt'
import { config } from '@/lib/config'
import { AuthResponse } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.log('Login attempt for:', email)
    const user = await findUserByEmail(email)

    if (!user) {
      console.log('User not found:', email)
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log('User found, verifying password...')
    const isPasswordValid = await verifyPassword(email, password)
    if (!isPasswordValid) {
      console.log('Password verification failed for:', email)
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log('Login successful for:', email)

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    }

    const accessToken = generateAccessToken(tokenPayload)
    const refreshToken = generateRefreshToken(tokenPayload)

    const response: AuthResponse = {
      user,
      access: {
        token: accessToken,
        expiresAt: getTokenExpiry(config.accessTokenExpiry).toISOString(),
      },
      refresh: {
        token: refreshToken,
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

