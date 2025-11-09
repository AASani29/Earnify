import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/jwt'
import { getWorkerRecommendations, calculateMatchScore } from '@/lib/groq'
import dbConnect from '@/lib/db'
import WorkerProfile from '@/lib/models/WorkerProfile'
import Task from '@/lib/models/Task'
import User from '@/lib/models/User'
import Review from '@/lib/models/Review'

/**
 * GET /api/ai/recommend-workers?taskId=xxx
 * Get AI-powered worker recommendations for a specific task
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

    // Get taskId from query params
    const { searchParams } = new URL(req.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
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
        { error: 'You can only get recommendations for your own tasks' },
        { status: 403 }
      )
    }

    // Get available workers (with profiles)
    const workerProfiles = await WorkerProfile.find({
      availability: { $in: ['AVAILABLE', 'BUSY'] },
    })
      .populate('userId', 'firstName lastName email')
      .limit(50) // Limit for performance
      .lean()

    if (workerProfiles.length === 0) {
      return NextResponse.json({
        success: true,
        recommendations: [],
        message: 'No available workers found',
      })
    }

    // Get reviews for all workers
    const workerUserIds = workerProfiles.map(p => (p.userId as any)._id)
    const allReviews = await Review.find({ workerId: { $in: workerUserIds } })
      .select('workerId rating comment skills professionalism communication quality')
      .lean()

    // Group reviews by worker
    const reviewsByWorker = new Map()
    allReviews.forEach(review => {
      const workerId = review.workerId.toString()
      if (!reviewsByWorker.has(workerId)) {
        reviewsByWorker.set(workerId, [])
      }
      reviewsByWorker.get(workerId).push(review)
    })

    // Prepare data for AI recommendation
    const workersForAI = workerProfiles.map(profile => {
      const populatedUser = profile.userId as any
      return {
        _id: profile._id.toString(),
        userId: populatedUser._id.toString(),
        skills: profile.skills || [],
        location: profile.location,
        rating: profile.rating,
        hourlyRate: profile.hourlyRate,
        completedTasks: profile.completedTasks,
        experience: profile.experience,
        reviews: reviewsByWorker.get(populatedUser._id.toString()) || [],
      }
    })

    const taskForAI = {
      title: task.title,
      category: task.category,
      skillsRequired: task.skillsRequired || [],
      location: {
        city: task.location.city,
      },
      budget: task.budget,
    }

    // Get AI recommendations
    const recommendedWorkerIds = await getWorkerRecommendations(taskForAI, workersForAI)

    // Calculate match scores for recommended workers
    const recommendationsWithScores = await Promise.all(
      recommendedWorkerIds.slice(0, 10).map(async workerId => {
        const profile = workerProfiles.find(
          p => (p.userId as any)._id.toString() === workerId
        )
        if (!profile) return null

        const matchResult = await calculateMatchScore(
          {
            skills: profile.skills || [],
            location: profile.location,
            rating: profile.rating,
            hourlyRate: profile.hourlyRate,
          },
          {
            skillsRequired: task.skillsRequired || [],
            location: task.location,
            budget: task.budget,
            category: task.category,
          }
        )

        // Type assertion for populated userId
        const populatedUser = profile.userId as any

        return {
          worker: {
            userId: populatedUser._id,
            firstName: populatedUser.firstName,
            lastName: populatedUser.lastName,
            email: populatedUser.email,
            bio: profile.bio,
            skills: profile.skills,
            experience: profile.experience,
            hourlyRate: profile.hourlyRate,
            location: profile.location,
            availability: profile.availability,
            rating: profile.rating,
            completedTasks: profile.completedTasks,
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
      totalAvailable: workerProfiles.length,
    })
  } catch (error: any) {
    console.error('Error in recommend-workers API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get worker recommendations' },
      { status: 500 }
    )
  }
}

