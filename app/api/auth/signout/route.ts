import { NextRequest, NextResponse } from 'next/server'
import { revokeRefreshToken } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json()

    if (refreshToken) {
      revokeRefreshToken(refreshToken)
    }

    return NextResponse.json({ message: 'Logged out successfully' })
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

