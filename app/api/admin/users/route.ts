import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/jwt'
import dbConnect from '@/lib/db'
import User from '@/lib/models/User'
import WorkerProfile from '@/lib/models/WorkerProfile'
import ClientProfile from '@/lib/models/ClientProfile'

// GET /api/admin/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyAccessToken(token)

    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    await dbConnect()

    const user = await User.findById(decoded.id)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const isVerified = searchParams.get('isVerified')
    const search = searchParams.get('search')

    let query: any = {}

    if (role && role !== 'ALL') {
      query.role = role
    }

    if (isVerified !== null && isVerified !== undefined && isVerified !== '') {
      query.isVerified = isVerified === 'true'
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 }).lean()

    // Fetch profiles for workers and clients
    const enrichedUsers = await Promise.all(
      users.map(async user => {
        if (user.role === 'WORKER') {
          const profile = await WorkerProfile.findOne({ userId: user._id }).lean()
          return { ...user, profile }
        } else if (user.role === 'CLIENT') {
          const profile = await ClientProfile.findOne({ userId: user._id }).lean()
          return { ...user, profile }
        }
        return user
      })
    )

    return NextResponse.json({ users: enrichedUsers })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

