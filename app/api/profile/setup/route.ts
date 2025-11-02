import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/jwt'
import connectDB from '@/lib/db'
import User from '@/lib/models/User'
import WorkerProfile from '@/lib/models/WorkerProfile'
import ClientProfile from '@/lib/models/ClientProfile'

export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyAccessToken(token)

    if (!payload) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { role } = body

    await connectDB()

    // Get user
    const user = await User.findById(payload.id)
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Handle Worker profile
    if (role === 'WORKER') {
      const { bio, skills, experience, hourlyRate, city, area } = body

      // Create or update worker profile
      await WorkerProfile.findOneAndUpdate(
        { userId: user._id },
        {
          userId: user._id,
          bio,
          skills: skills || [],
          experience,
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
          location: {
            city,
            area,
          },
        },
        { upsert: true, new: true }
      )

      // Mark profile as completed
      user.profileCompleted = true
      await user.save()

      return NextResponse.json({ message: 'Worker profile created successfully' }, { status: 200 })
    }

    // Handle Client profile
    if (role === 'CLIENT') {
      const { companyName, companyDescription, industry, website, city, area, address } = body

      // Create or update client profile
      await ClientProfile.findOneAndUpdate(
        { userId: user._id },
        {
          userId: user._id,
          companyName,
          companyDescription,
          industry,
          website,
          location: {
            city,
            area,
            address,
          },
        },
        { upsert: true, new: true }
      )

      // Mark profile as completed
      user.profileCompleted = true
      await user.save()

      return NextResponse.json({ message: 'Client profile created successfully' }, { status: 200 })
    }

    return NextResponse.json({ message: 'Invalid role' }, { status: 400 })
  } catch (error: any) {
    console.error('Profile setup error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

