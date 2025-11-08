import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/jwt'
import dbConnect from '@/lib/db'
import Review from '@/lib/models/Review'
import Task from '@/lib/models/Task'
import WorkerProfile from '@/lib/models/WorkerProfile'
import User from '@/lib/models/User'
import mongoose from 'mongoose'

/**
 * GET /api/reviews - Get reviews
 * Query params:
 * - workerId: Get reviews for a specific worker
 * - clientId: Get reviews by a specific client
 * - taskId: Get review for a specific task
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const workerId = searchParams.get('workerId')
    const clientId = searchParams.get('clientId')
    const taskId = searchParams.get('taskId')

    await dbConnect()

    const query: any = {}
    if (workerId) query.workerId = workerId
    if (clientId) query.clientId = clientId
    if (taskId) query.taskId = taskId

    const reviews = await Review.find(query)
      .populate('workerId', 'firstName lastName email')
      .populate('clientId', 'firstName lastName email companyName')
      .populate('taskId', 'title category')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      reviews,
      count: reviews.length,
    })
  } catch (error: any) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/reviews - Create a new review
 * Only clients can create reviews for workers after task completion
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyAccessToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const clientId = decoded.id // Token contains 'id' not 'userId'
    await dbConnect()

    // Verify user is a client
    const client = await User.findById(clientId)
    if (!client || client.role !== 'CLIENT') {
      return NextResponse.json(
        { error: 'Only clients can create reviews' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const {
      taskId,
      workerId,
      rating,
      comment,
      skills,
      professionalism,
      communication,
      quality,
      timeliness,
      wouldHireAgain,
    } = body

    // Validate required fields
    if (!taskId || !workerId || !rating) {
      console.log('Validation failed - missing fields:', { taskId, workerId, rating })
      return NextResponse.json(
        { error: 'Task ID, Worker ID, and rating are required' },
        { status: 400 }
      )
    }

    // Use raw MongoDB collection to get task data
    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database connection not established')
    }

    const tasksCollection = db.collection('tasks')
    const task = await tasksCollection.findOne({ _id: new mongoose.Types.ObjectId(taskId) })

    if (!task) {
      console.log('Task not found:', taskId)
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    console.log('Task found:', {
      id: task._id,
      title: task.title,
      status: task.status,
      clientId: task.clientId,
      assignedWorkerId: task.assignedWorkerId,
      paymentStatus: task.paymentStatus,
    })

    if (task.clientId.toString() !== clientId) {
      console.log('Client mismatch:', { taskClientId: task.clientId, requestClientId: clientId })
      return NextResponse.json(
        { error: 'You can only review tasks you created' },
        { status: 403 }
      )
    }

    // Verify task is completed
    if (task.status !== 'COMPLETED') {
      console.log('Task not completed:', { status: task.status })
      return NextResponse.json(
        { error: 'You can only review completed tasks' },
        { status: 400 }
      )
    }

    // Verify worker was assigned to this task
    if (task.assignedWorkerId?.toString() !== workerId) {
      console.log('Worker mismatch:', { taskWorkerId: task.assignedWorkerId, requestWorkerId: workerId })
      return NextResponse.json(
        { error: 'This worker was not assigned to this task' },
        { status: 400 }
      )
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ taskId, workerId })
    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this worker for this task' },
        { status: 400 }
      )
    }

    // Create review
    const review = await Review.create({
      taskId,
      workerId,
      clientId,
      rating,
      comment,
      skills: skills || [],
      professionalism,
      communication,
      quality,
      timeliness,
      wouldHireAgain: wouldHireAgain || false,
    })

    // Update worker profile rating
    const workerProfile = await WorkerProfile.findOne({ userId: workerId })
    if (workerProfile) {
      const allReviews = await Review.find({ workerId })
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0)
      const averageRating = totalRating / allReviews.length

      workerProfile.rating.average = Math.round(averageRating * 10) / 10 // Round to 1 decimal
      workerProfile.rating.count = allReviews.length
      await workerProfile.save()
    }

    const populatedReview = await Review.findById(review._id)
      .populate('workerId', 'firstName lastName email')
      .populate('clientId', 'firstName lastName email companyName')
      .populate('taskId', 'title category')

    return NextResponse.json({
      success: true,
      review: populatedReview,
      message: 'Review created successfully',
    })
  } catch (error: any) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create review' },
      { status: 500 }
    )
  }
}

