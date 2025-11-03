import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import TaskModel from '@/lib/models/Task'
import TaskApplicationModel from '@/lib/models/TaskApplication'
import { verifyAccessToken } from '@/lib/jwt'
import mongoose from 'mongoose'

// GET /api/tasks/[id]/applications - Get all applications for a task
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
        { message: 'Invalid task ID' },
        { status: 400 }
      )
    }

    // Find the task
    const task = await TaskModel.findById(id)

    if (!task) {
      return NextResponse.json(
        { message: 'Task not found' },
        { status: 404 }
      )
    }

    // Only the task owner (client) can view all applications
    if (task.clientId.toString() !== decoded.id) {
      return NextResponse.json(
        { message: 'Forbidden - Only the task owner can view applications' },
        { status: 403 }
      )
    }

    // Get all applications for this task
    const applications = await TaskApplicationModel.find({ taskId: id })
      .populate('workerId', 'firstName lastName email phoneNumber')
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

// POST /api/tasks/[id]/applications - Apply to a task (WORKER only)
export async function POST(
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

    // Check if user is a WORKER
    if (decoded.role !== 'WORKER') {
      return NextResponse.json(
        { message: 'Forbidden - Only workers can apply to tasks' },
        { status: 403 }
      )
    }

    await connectDB()

    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid task ID' },
        { status: 400 }
      )
    }

    // Find the task
    const task = await TaskModel.findById(id)

    if (!task) {
      return NextResponse.json(
        { message: 'Task not found' },
        { status: 404 }
      )
    }

    // Check if task is still open
    if (task.status !== 'OPEN') {
      return NextResponse.json(
        { message: 'This task is no longer accepting applications' },
        { status: 400 }
      )
    }

    // Check if worker already applied
    const existingApplication = await TaskApplicationModel.findOne({
      taskId: id,
      workerId: decoded.id,
    })

    if (existingApplication) {
      return NextResponse.json(
        { message: 'You have already applied to this task' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validate required fields
    const { coverLetter } = body

    if (!coverLetter) {
      return NextResponse.json(
        { message: 'Cover letter is required' },
        { status: 400 }
      )
    }

    // Create application
    const application = await TaskApplicationModel.create({
      taskId: id,
      workerId: decoded.id,
      coverLetter,
      proposedBudget: body.proposedBudget,
      estimatedCompletionTime: body.estimatedCompletionTime,
      status: 'PENDING',
    })

    // Populate worker info
    await application.populate('workerId', 'firstName lastName email phoneNumber')

    return NextResponse.json(
      { message: 'Application submitted successfully', application },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating application:', error)
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      )
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { message: 'You have already applied to this task' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Failed to submit application', error: error.message },
      { status: 500 }
    )
  }
}

