import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/lib/models/User'
import WorkerProfile from '@/lib/models/WorkerProfile'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const { id } = params

    // Get user
    const user = await User.findById(id).select('-password').lean()
    if (!user) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 })
    }

    if (user.role !== 'WORKER') {
      return NextResponse.json({ error: 'User is not a worker' }, { status: 400 })
    }

    // Get worker profile
    const workerProfile = await WorkerProfile.findOne({ userId: id }).lean()

    // Combine user and profile data
    const worker = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      bio: workerProfile?.bio || '',
      skills: workerProfile?.skills || [],
      experience: workerProfile?.experience || '',
      hourlyRate: workerProfile?.hourlyRate || 0,
      location: workerProfile?.location || {},
      availability: workerProfile?.availability || 'AVAILABLE',
      rating: workerProfile?.rating || { average: 0, count: 0 },
      completedTasks: workerProfile?.completedTasks || 0,
    }

    return NextResponse.json({
      success: true,
      worker,
    })
  } catch (error: any) {
    console.error('Error fetching worker profile:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch worker profile' }, { status: 500 })
  }
}

