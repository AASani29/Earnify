import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import TaskModel from '@/lib/models/Task'
import { verifyAccessToken } from '@/lib/jwt'
import mongoose from 'mongoose'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyAccessToken(token)
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    const { approved, responseMessage } = await request.json()

    const { id } = await params

    // Use raw MongoDB collection to get the actual data
    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database connection not established')
    }

    const tasksCollection = db.collection('tasks')
    const task = await tasksCollection.findOne({ _id: new mongoose.Types.ObjectId(id) })

    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 })
    }

    console.log('Task found:', task.title)
    console.log('Task timeExtensionRequest:', task.timeExtensionRequest)

    // Verify the client owns this task
    if (task.clientId.toString() !== decoded.id) {
      return NextResponse.json({ message: 'Not authorized to respond to this request' }, { status: 403 })
    }

    // Verify there's a pending extension request
    if (!task.timeExtensionRequest || task.timeExtensionRequest.status !== 'PENDING') {
      console.log('Extension request check failed:', {
        hasRequest: !!task.timeExtensionRequest,
        status: task.timeExtensionRequest?.status,
      })
      return NextResponse.json({ message: 'No pending extension request' }, { status: 400 })
    }

    // Prepare updated extension request
    const updatedExtensionRequest = {
      ...task.timeExtensionRequest,
      status: approved ? 'APPROVED' : 'REJECTED',
      responseMessage: responseMessage || '',
      respondedAt: new Date(),
    }

    // Prepare update object
    const updateData: any = {
      timeExtensionRequest: updatedExtensionRequest,
    }

    // If approved and new deadline was provided, update the task deadline
    if (approved && task.timeExtensionRequest.newDeadline) {
      updateData.deadline = task.timeExtensionRequest.newDeadline
    }

    console.log('Updating task with:', updateData)

    // Use raw MongoDB collection for update
    const updateResult = await tasksCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: updateData }
    )

    console.log('Update result:', updateResult)

    // Fetch updated task
    const updatedTask = await tasksCollection.findOne({ _id: new mongoose.Types.ObjectId(id) })

    return NextResponse.json({
      message: `Time extension request ${approved ? 'approved' : 'rejected'} successfully`,
      task: updatedTask,
    })
  } catch (error: any) {
    console.error('Error responding to extension request:', error)
    return NextResponse.json({ message: error.message || 'Failed to respond to extension request' }, { status: 500 })
  }
}

