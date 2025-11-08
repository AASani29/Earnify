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
      return NextResponse.json({ message: 'Not authorized to make payment for this task' }, { status: 403 })
    }

    // Verify task has been received
    if (task.deliveryStatus !== 'RECEIVED') {
      return NextResponse.json({ message: 'Task must be received before payment' }, { status: 400 })
    }

    // Verify payment hasn't been made already
    if (task.paymentStatus === 'PAID') {
      return NextResponse.json({ message: 'Payment already made for this task' }, { status: 400 })
    }

    // Use raw MongoDB collection for update
    await tasksCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        $set: {
          paymentStatus: 'PAID',
          paidAt: new Date(),
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      }
    )

    // Fetch updated task
    const updatedTask = await tasksCollection.findOne({ _id: new mongoose.Types.ObjectId(id) })

    return NextResponse.json({
      message: 'Payment made successfully',
      task: updatedTask,
    })
  } catch (error: any) {
    console.error('Error making payment:', error)
    return NextResponse.json({ message: error.message || 'Failed to make payment' }, { status: 500 })
  }
}

