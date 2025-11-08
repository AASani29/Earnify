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

    const { requestMessage, newDeadline } = await request.json()

    if (!requestMessage) {
      return NextResponse.json({ message: 'Request message is required' }, { status: 400 })
    }

    const { id } = await params
    const task = await TaskModel.findById(id)
    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 })
    }

    // Verify the worker is assigned to this task
    if (task.assignedWorkerId?.toString() !== decoded.id) {
      return NextResponse.json({ message: 'Not authorized to request extension for this task' }, { status: 403 })
    }

    // Verify task is in progress
    if (task.status !== 'IN_PROGRESS') {
      return NextResponse.json({ message: 'Task is not in progress' }, { status: 400 })
    }

    // Create time extension request
    const extensionRequest = {
      requestedBy: task.assignedWorkerId,
      requestMessage,
      requestedAt: new Date(),
      status: 'PENDING',
      newDeadline: newDeadline ? new Date(newDeadline) : undefined,
    }

    console.log('Saving extension request:', extensionRequest)
    console.log('Task ID:', id)

    // Use raw MongoDB collection to bypass Mongoose schema issues
    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database connection not established')
    }

    console.log('Database name:', db.databaseName)
    console.log('Available collections:', await db.listCollections().toArray())

    const tasksCollection = db.collection('tasks')
    console.log('Using collection:', tasksCollection.collectionName)

    const updateResult = await tasksCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        $set: {
          deliveryStatus: task.deliveryStatus || 'NOT_DELIVERED',
          paymentStatus: task.paymentStatus || 'NOT_PAID',
          timeExtensionRequest: extensionRequest,
        },
      }
    )

    console.log('Update result:', updateResult)

    // Fetch the updated task directly from collection
    const updatedTaskRaw = await tasksCollection.findOne({ _id: new mongoose.Types.ObjectId(id) })

    console.log('Updated task extension request:', updatedTaskRaw?.timeExtensionRequest)
    console.log('Updated task deliveryStatus:', updatedTaskRaw?.deliveryStatus)
    console.log('Updated task paymentStatus:', updatedTaskRaw?.paymentStatus)

    // Also fetch via Mongoose to return
    const updatedTask = await TaskModel.findById(id).lean()

    return NextResponse.json({
      message: 'Time extension request sent successfully',
      task: updatedTask,
    })
  } catch (error: any) {
    console.error('Error requesting time extension:', error)
    return NextResponse.json({ message: error.message || 'Failed to request time extension' }, { status: 500 })
  }
}

