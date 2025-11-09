import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import TaskModel from '@/lib/models/Task'
import { verifyAccessToken } from '@/lib/jwt'

// GET /api/tasks - Get all tasks with filtering
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const city = searchParams.get('city')
    const district = searchParams.get('district')
    const clientId = searchParams.get('clientId')
    const assignedWorkerId = searchParams.get('assignedWorkerId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build query
    const query: any = {}

    if (status) query.status = status
    if (category) query.category = category
    if (city) query['location.city'] = city
    if (district) query['location.district'] = district
    if (clientId) query.clientId = clientId
    if (assignedWorkerId) query.assignedWorkerId = assignedWorkerId
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    // Get total count for pagination
    const total = await TaskModel.countDocuments(query)

    // Get tasks with pagination
    const tasks = await TaskModel.find(query)
      .populate('clientId', 'firstName lastName email')
      .populate('assignedWorkerId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Add application count to each task
    const TaskApplication = (await import('@/lib/models/TaskApplication')).default
    const tasksWithApplicationCount = await Promise.all(
      tasks.map(async (task: any) => {
        const applicationCount = await TaskApplication.countDocuments({ taskId: task._id })
        return {
          ...task,
          applicationCount,
        }
      })
    )

    // Debug logging for in-progress tasks
    if (status === 'IN_PROGRESS') {
      console.log('Fetching IN_PROGRESS tasks for clientId:', clientId)
      console.log('Number of tasks found:', tasks.length)
      tasks.forEach((task: any, index: number) => {
        console.log(`Task ${index + 1}:`, task.title)
        console.log('  - deliveryStatus:', task.deliveryStatus)
        console.log('  - paymentStatus:', task.paymentStatus)
        console.log('  - timeExtensionRequest:', task.timeExtensionRequest)
      })
    }

    return NextResponse.json({
      tasks: tasksWithApplicationCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { message: 'Failed to fetch tasks', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/tasks - Create a new task (CLIENT only)
export async function POST(request: NextRequest) {
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

    // Check if user is a CLIENT
    if (decoded.role !== 'CLIENT') {
      return NextResponse.json(
        { message: 'Forbidden - Only clients can create tasks' },
        { status: 403 }
      )
    }

    await connectDB()

    const body = await request.json()

    // Validate required fields
    const {
      title,
      description,
      category,
      budget,
      location,
    } = body

    if (!title || !description || !category || !budget || !location) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate location
    if (!location.address || !location.city || !location.district) {
      return NextResponse.json(
        { message: 'Location must include address, city, and district' },
        { status: 400 }
      )
    }

    // Create task
    const task = await TaskModel.create({
      ...body,
      clientId: decoded.id,
      status: 'OPEN',
    })

    // Populate client info
    await task.populate('clientId', 'firstName lastName email')

    return NextResponse.json(
      { message: 'Task created successfully', task },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating task:', error)
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Failed to create task', error: error.message },
      { status: 500 }
    )
  }
}

