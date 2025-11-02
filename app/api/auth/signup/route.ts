import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/users'
import { generateAccessToken, generateRefreshToken, getTokenExpiry } from '@/lib/jwt'
import { config } from '@/lib/config'
import { AuthResponse, RegisterData } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body: RegisterData = await request.json()

    // Validate required fields
    if (!body.email || !body.password || !body.firstName || !body.lastName || !body.role) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate role
    if (!['CLIENT', 'WORKER'].includes(body.role)) {
      return NextResponse.json(
        { message: 'Invalid role. Must be CLIENT or WORKER' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password length
    if (body.password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Create user
    const user = await createUser(body)

    // Generate tokens
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

    return NextResponse.json(response, { status: 201 })
  } catch (error: any) {
    console.error('Signup error:', error)

    if (error.message === 'User already exists') {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

