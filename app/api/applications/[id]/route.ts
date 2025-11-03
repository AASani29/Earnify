import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import TaskModel from '@/lib/models/Task'
import TaskApplicationModel from '@/lib/models/TaskApplication'
import { verifyAccessToken } from '@/lib/jwt'
import mongoose from 'mongoose'

// GET /api/applications/[id] - Get a single application
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid application ID' },
        { status: 400 }
      )
    }

    const application = await TaskApplicationModel.findById(id)
      .populate('workerId', 'firstName lastName email phoneNumber')
      .populate('taskId')
      .lean()

    if (!application) {
      return NextResponse.json(
        { message: 'Application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ application })
  } catch (error: any) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { message: 'Failed to fetch application', error: error.message },
      { status: 500 }
    )
  }
}

// PATCH /api/applications/[id] - Update application status (accept/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid application ID' },
        { status: 400 }
      )
    }

    const application = await TaskApplicationModel.findById(id)

    if (!application) {
      return NextResponse.json(
        { message: 'Application not found' },
        { status: 404 }
      )
    }

    const task = await TaskModel.findById(application.taskId)

    if (!task) {
      return NextResponse.json(
        { message: 'Task not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { status } = body

    // Handle different status updates based on user role
    if (status === 'ACCEPTED' || status === 'REJECTED') {
      // Only task owner (client) can accept/reject
      if (task.clientId.toString() !== decoded.id) {
        return NextResponse.json(
          { message: 'Forbidden - Only the task owner can accept/reject applications' },
          { status: 403 }
        )
      }

      if (status === 'ACCEPTED') {
        // Check if task is still open
        if (task.status !== 'OPEN') {
          return NextResponse.json(
            { message: 'This task is no longer accepting applications' },
            { status: 400 }
          )
        }

        // Update application status
        application.status = 'ACCEPTED'
        application.respondedAt = new Date()
        await application.save()

        // Update task status and assign worker
        task.status = 'IN_PROGRESS'
        task.assignedWorkerId = application.workerId
        await task.save()

        // Reject all other pending applications for this task
        await TaskApplicationModel.updateMany(
          {
            taskId: task._id,
            _id: { $ne: application._id },
            status: 'PENDING',
          },
          {
            status: 'REJECTED',
            respondedAt: new Date(),
          }
        )
      } else {
        // REJECTED
        application.status = 'REJECTED'
        application.respondedAt = new Date()
        await application.save()
      }
    } else if (status === 'WITHDRAWN') {
      // Only the worker who applied can withdraw
      if (application.workerId.toString() !== decoded.id) {
        return NextResponse.json(
          { message: 'Forbidden - You can only withdraw your own applications' },
          { status: 403 }
        )
      }

      if (application.status !== 'PENDING') {
        return NextResponse.json(
          { message: 'Can only withdraw pending applications' },
          { status: 400 }
        )
      }

      application.status = 'WITHDRAWN'
      await application.save()
    } else {
      return NextResponse.json(
        { message: 'Invalid status' },
        { status: 400 }
      )
    }

    await application.populate('workerId', 'firstName lastName email phoneNumber')

    return NextResponse.json({
      message: 'Application updated successfully',
      application,
    })
  } catch (error: any) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { message: 'Failed to update application', error: error.message },
      { status: 500 }
    )
  }
}

