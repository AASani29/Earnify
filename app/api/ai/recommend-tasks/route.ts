import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/jwt'
import { getTaskRecommendations, calculateMatchScore } from '@/lib/groq'
import dbConnect from '@/lib/db'
import WorkerProfile from '@/lib/models/WorkerProfile'
import Task from '@/lib/models/Task'
import TaskApplication from '@/lib/models/TaskApplication'
import Review from '@/lib/models/Review'

/**
 * GET /api/ai/recommend-tasks
 * Get AI-powered task recommendations for the logged-in worker
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

    const userId = decoded.id // Token contains 'id' not 'userId'

    await dbConnect()

    // Get worker profile
    const workerProfile = await WorkerProfile.findOne({ userId })
    if (!workerProfile) {
      console.log(`Worker profile not found for userId: ${userId}`)
      return NextResponse.json(
        {
          error: 'Worker profile not found',
          message: 'Please complete your worker profile first to get AI recommendations',
          success: false
        },
        { status: 404 }
      )
    }

    console.log(`Worker profile found for userId: ${userId}, skills: ${workerProfile.skills?.length || 0}`)

    // Get worker reviews for better recommendations
    const workerReviews = await Review.find({ workerId: userId })
      .select('rating comment skills professionalism communication quality')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    // Get tasks the worker has already applied to
    const applications = await TaskApplication.find({ workerId: userId })
    const appliedTaskIds = applications.map(app => app.taskId.toString())

    // Get available open tasks (excluding already applied ones)
    const availableTasks = await Task.find({
      status: 'OPEN',
      _id: { $nin: appliedTaskIds },
    })
      .populate('clientId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(50) // Limit to recent 50 tasks for performance
      .lean()

    if (availableTasks.length === 0) {
      return NextResponse.json({
        success: true,
        recommendations: [],
        message: 'No available tasks found',
      })
    }

    // Prepare data for AI recommendation
    const tasksForAI = availableTasks.map(task => ({
      _id: task._id.toString(),
      title: task.title,
      category: task.category,
      skillsRequired: task.skillsRequired || [],
      location: {
        city: task.location.city,
      },
      budget: task.budget,
    }))

    const workerForAI = {
      skills: workerProfile.skills || [],
      location: workerProfile.location,
      rating: workerProfile.rating,
      experience: workerProfile.experience,
      completedTasks: workerProfile.completedTasks,
      reviews: workerReviews,
    }

    // Get AI recommendations
    const recommendedTaskIds = await getTaskRecommendations(workerForAI, tasksForAI)

    // Calculate match scores for recommended tasks
    const recommendationsWithScores = await Promise.all(
      recommendedTaskIds.slice(0, 10).map(async taskId => {
        const task = availableTasks.find(t => t._id.toString() === taskId)
        if (!task) return null

        const matchResult = await calculateMatchScore(
          {
            skills: workerProfile.skills || [],
            location: workerProfile.location,
            rating: workerProfile.rating,
            hourlyRate: workerProfile.hourlyRate,
            reviews: workerReviews,
          },
          {
            skillsRequired: task.skillsRequired || [],
            location: task.location,
            budget: task.budget,
            category: task.category,
          }
        )

        return {
          task: {
            _id: task._id,
            title: task.title,
            description: task.description,
            category: task.category,
            budget: task.budget,
            currency: task.currency,
            location: task.location,
            deadline: task.deadline,
            skillsRequired: task.skillsRequired,
            estimatedDuration: task.estimatedDuration,
            clientId: task.clientId,
            createdAt: task.createdAt,
          },
          matchScore: matchResult.score,
          matchReasons: matchResult.reasons,
        }
      })
    )

    // Filter out null values and sort by match score
    const validRecommendations = recommendationsWithScores
      .filter(r => r !== null)
      .sort((a, b) => b!.matchScore - a!.matchScore)

    return NextResponse.json({
      success: true,
      recommendations: validRecommendations,
      totalAvailable: availableTasks.length,
    })
  } catch (error: any) {
    console.error('Error in recommend-tasks API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get task recommendations' },
      { status: 500 }
    )
  }
}

