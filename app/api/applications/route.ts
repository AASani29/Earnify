import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import TaskApplicationModel from '@/lib/models/TaskApplication'
import { verifyAccessToken } from '@/lib/jwt'

// GET /api/applications - Get user's applications (for workers)
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = verifyAccessToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { message: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Build query
    const query: any = { workerId: decoded.id }
    
    if (status) {
      query.status = status
    }

    // Get applications
    const applications = await TaskApplicationModel.find(query)
      .populate('taskId')
      .populate('workerId', 'firstName lastName email')
      .sort({ appliedAt: -1 })
      .lean()

    return NextResponse.json({ applications })
  } catch (error: any) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { message: 'Failed to fetch applications', error: error.message },
      { status: 500 }
    )
  }
}

