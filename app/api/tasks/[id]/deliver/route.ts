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

    const { deliveryMessage } = await request.json()
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

    // Verify the worker is assigned to this task
    if (!task.assignedWorkerId || task.assignedWorkerId.toString() !== decoded.id) {
      return NextResponse.json({ message: 'Not authorized to deliver this task' }, { status: 403 })
    }

    // Verify task is in progress
    if (task.status !== 'IN_PROGRESS') {
      return NextResponse.json({ message: 'Task is not in progress' }, { status: 400 })
    }

    // Use raw MongoDB collection for update
    await tasksCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        $set: {
          deliveryStatus: 'DELIVERED',
          deliveryMessage: deliveryMessage || '',
          deliveredAt: new Date(),
          paymentStatus: task.paymentStatus || 'NOT_PAID',
        },
      }
    )

    // Fetch updated task
    const updatedTask = await tasksCollection.findOne({ _id: new mongoose.Types.ObjectId(id) })

    return NextResponse.json({
      message: 'Task delivered successfully',
      task: updatedTask,
    })
  } catch (error: any) {
    console.error('Error delivering task:', error)
    return NextResponse.json({ message: error.message || 'Failed to deliver task' }, { status: 500 })
  }
}

