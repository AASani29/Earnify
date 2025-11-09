import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/jwt'
import dbConnect from '@/lib/db'
import Task from '@/lib/models/Task'
import User from '@/lib/models/User'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyAccessToken(token)

    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    await dbConnect()

    const admin = await User.findById(decoded.id)
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Get filter from query params
    const { searchParams } = new URL(req.url)
    const statusFilter = searchParams.get('status') || 'ALL'

    // Build query
    const query: any = {}
    if (statusFilter !== 'ALL') {
      query.status = statusFilter
    }

    // Fetch tasks with populated client and worker info
    const tasks = await Task.find(query)
      .populate('clientId', 'firstName lastName email')
      .populate('assignedWorkerId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()

    return NextResponse.json({ tasks }, { status: 200 })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

