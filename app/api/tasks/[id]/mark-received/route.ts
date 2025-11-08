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

    const { id } = await params

    // Use raw MongoDB collection
    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database connection not established')
    }

    const tasksCollection = db.collection('tasks')
    const task = await tasksCollection.findOne({ _id: new mongoose.Types.ObjectId(id) })

    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 })
    }

    // Verify the client owns this task
    if (task.clientId.toString() !== decoded.id) {
      return NextResponse.json({ message: 'Not authorized to mark this task as received' }, { status: 403 })
    }

    // Verify task has been delivered
    if (task.deliveryStatus !== 'DELIVERED') {
      return NextResponse.json({ message: 'Task has not been delivered yet' }, { status: 400 })
    }

    // Use raw MongoDB collection for update
    await tasksCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: { deliveryStatus: 'RECEIVED' } }
    )

    // Fetch updated task
    const updatedTask = await tasksCollection.findOne({ _id: new mongoose.Types.ObjectId(id) })

    return NextResponse.json({
      message: 'Task marked as received successfully',
      task: updatedTask,
    })
  } catch (error: any) {
    console.error('Error marking task as received:', error)
    return NextResponse.json({ message: error.message || 'Failed to mark task as received' }, { status: 500 })
  }
}

