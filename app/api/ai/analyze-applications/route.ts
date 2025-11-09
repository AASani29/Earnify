import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/jwt'
import { analyzeApplications } from '@/lib/groq'
import dbConnect from '@/lib/db'
import Task from '@/lib/models/Task'
import TaskApplication from '@/lib/models/TaskApplication'
import WorkerProfile from '@/lib/models/WorkerProfile'

/**
 * GET /api/ai/analyze-applications?taskId=xxx
 * Analyze applications for a task and recommend the best candidate
 */
export async function GET(req: NextRequest) {
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

    const userId = decoded.id

    // Get taskId from query params
    const { searchParams } = new URL(req.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    await dbConnect()

    // Get the task
    const task = await Task.findById(taskId).lean()
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Verify the user is the task owner
    if (task.clientId.toString() !== userId) {
      return NextResponse.json(
        { error: 'You can only analyze applications for your own tasks' },
        { status: 403 }
      )
    }

    // Get all applications for this task
    const applications = await TaskApplication.find({ taskId })
      .populate('workerId', 'firstName lastName email')
      .sort({ appliedAt: -1 })
      .lean()

    if (applications.length === 0) {
      return NextResponse.json({
        success: true,
        recommendedApplicationId: null,
        analysis: [],
        message: 'No applications found for this task',
      })
    }

    // Get worker profiles for all applicants
    const workerIds = applications.map(app => (app.workerId as any)._id)
    const workerProfiles = await WorkerProfile.find({ userId: { $in: workerIds } }).lean()

    // Create a map of userId to profile
    const profileMap = new Map()
    workerProfiles.forEach(profile => {
      profileMap.set(profile.userId.toString(), profile)
    })

    // Prepare applications data with profiles
    const applicationsWithProfiles = applications.map(app => ({
      _id: app._id.toString(),
      workerId: {
        firstName: (app.workerId as any).firstName,
        lastName: (app.workerId as any).lastName,
        email: (app.workerId as any).email,
      },
      workerProfile: profileMap.get((app.workerId as any)._id.toString()),
      coverLetter: app.coverLetter,
      proposedBudget: app.proposedBudget,
      estimatedCompletionTime: app.estimatedCompletionTime,
      appliedAt: app.appliedAt,
    }))

    // Prepare task data
    const taskData = {
      title: task.title,
      description: task.description,
      category: task.category,
      skillsRequired: task.skillsRequired || [],
      budget: task.budget,
      location: task.location,
    }

    // Get AI analysis
    const aiResult = await analyzeApplications(taskData, applicationsWithProfiles)

    return NextResponse.json({
      success: true,
      recommendedApplicationId: aiResult.recommendedApplicationId,
      analysis: aiResult.analysis,
      totalApplications: applications.length,
    })
  } catch (error: any) {
    console.error('Error in analyze-applications API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze applications' },
      { status: 500 }
    )
  }
}

