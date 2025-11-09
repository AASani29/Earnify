import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/jwt'
import dbConnect from '@/lib/db'
import User from '@/lib/models/User'
import Task from '@/lib/models/Task'
import TaskApplication from '@/lib/models/TaskApplication'
import SupportTicket from '@/lib/models/SupportTicket'

// GET /api/admin/statistics - Get platform statistics (admin only)
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

    // Fetch statistics
    const [totalUsers, totalWorkers, totalClients, totalTasks, totalApplications, openTickets] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'WORKER' }),
      User.countDocuments({ role: 'CLIENT' }),
      Task.countDocuments(),
      TaskApplication.countDocuments(),
      SupportTicket.countDocuments({ status: { $in: ['OPEN', 'IN_PROGRESS'] } }),
    ])

    const tasksByStatus = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ])

    const statistics = {
      totalUsers,
      totalWorkers,
      totalClients,
      totalTasks,
      totalApplications,
      openTickets,
      tasksByStatus: tasksByStatus.reduce((acc: any, item: any) => {
        acc[item._id] = item.count
        return acc
      }, {}),
    }

    return NextResponse.json({ statistics })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 })
  }
}

