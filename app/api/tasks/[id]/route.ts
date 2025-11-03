import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import TaskModel from '@/lib/models/Task'
import { verifyAccessToken } from '@/lib/jwt'
import mongoose from 'mongoose'

// GET /api/tasks/[id] - Get a single task by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid task ID' },
        { status: 400 }
      )
    }

    const task = await TaskModel.findById(id)
      .populate('clientId', 'firstName lastName email phoneNumber')
      .populate('assignedWorkerId', 'firstName lastName email phoneNumber')
      .lean()

    if (!task) {
      return NextResponse.json(
        { message: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ task })
  } catch (error: any) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { message: 'Failed to fetch task', error: error.message },
      { status: 500 }
    )
  }
}

// PATCH /api/tasks/[id] - Update a task (CLIENT only, own tasks)
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

    // Check if user is the task owner
    if (task.clientId.toString() !== decoded.id) {
      return NextResponse.json(
        { message: 'Forbidden - You can only update your own tasks' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Don't allow changing clientId or assignedWorkerId through this endpoint
    delete body.clientId
    delete body.assignedWorkerId

    // Update task
    Object.assign(task, body)
    await task.save()

    await task.populate('clientId', 'firstName lastName email')

    return NextResponse.json({
      message: 'Task updated successfully',
      task,
    })
  } catch (error: any) {
    console.error('Error updating task:', error)
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Failed to update task', error: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/tasks/[id] - Delete a task (CLIENT only, own tasks)
export async function DELETE(
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

    // Check if user is the task owner
    if (task.clientId.toString() !== decoded.id) {
      return NextResponse.json(
        { message: 'Forbidden - You can only delete your own tasks' },
        { status: 403 }
      )
    }

    // Don't allow deleting tasks that are in progress
    if (task.status === 'IN_PROGRESS') {
      return NextResponse.json(
        { message: 'Cannot delete a task that is in progress' },
        { status: 400 }
      )
    }

    await TaskModel.findByIdAndDelete(id)

    return NextResponse.json({
      message: 'Task deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { message: 'Failed to delete task', error: error.message },
      { status: 500 }
    )
  }
}

