import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/jwt'
import Groq from 'groq-sdk'
import dbConnect from '@/lib/db'
import User from '@/lib/models/User'
import WorkerProfile from '@/lib/models/WorkerProfile'
import Task from '@/lib/models/Task'
import TaskApplication from '@/lib/models/TaskApplication'
import Review from '@/lib/models/Review'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// Platform knowledge base
const PLATFORM_KNOWLEDGE = `
# Earnify Platform Information

## About Earnify
Earnify is an AI-powered labor marketplace platform connecting workers with clients in Bangladesh. It enables clients to post tasks and workers to find and complete gig economy jobs.

## User Roles
1. **CLIENT**: Can post tasks, review applications, assign workers, receive deliveries, make payments, and leave reviews
2. **WORKER**: Can browse tasks, apply to tasks, complete assigned work, deliver tasks, request time extensions, and build their profile
3. **ADMIN**: Platform administrators with full access

## Task Workflow
1. **Task Creation**: Clients create tasks with title, description, budget, deadline, location, category, and required skills
2. **Task Application**: Workers browse open tasks and submit applications with cover letters and proposed rates
3. **Worker Assignment**: Clients review applications and assign a worker to the task
4. **Task Completion**: Worker completes the task and submits delivery with a message
5. **Delivery Review**: Client reviews the delivery and can accept or request revisions
6. **Payment**: Client makes payment after accepting delivery
7. **Review**: Client leaves a review rating the worker's performance

## Task Statuses
- **OPEN**: Task is available for applications
- **IN_PROGRESS**: Task has been assigned to a worker
- **COMPLETED**: Task is finished and payment made
- **CANCELLED**: Task was cancelled

## Delivery Statuses
- **NOT_DELIVERED**: Work not yet submitted
- **DELIVERED**: Worker submitted the work
- **RECEIVED**: Client accepted the delivery

## Payment Statuses
- **NOT_PAID**: Payment not yet made
- **PAID**: Payment completed

## Key Features

### For Workers:
- **Profile Completion**: Workers can complete their profile with bio, skills, experience, hourly rate, location, and availability
- **AI Task Recommendations**: Get personalized task recommendations based on skills, location, and past performance
- **Task Applications**: Apply to tasks with custom cover letters and proposed rates
- **Task Delivery**: Submit completed work with delivery messages
- **Time Extensions**: Request deadline extensions from clients
- **Reviews & Ratings**: Build reputation through client reviews
- **Profile Completion Tracking**: See profile completion percentage and improve visibility

### For Clients:
- **Task Posting**: Create detailed task listings with all requirements
- **AI Worker Recommendations**: Get AI-powered worker recommendations for tasks
- **Application Management**: Review and compare worker applications
- **Worker Assignment**: Choose the best worker for the task
- **Delivery Management**: Review submitted work and request revisions if needed
- **Payment Processing**: Make secure payments after accepting work
- **Review System**: Rate workers on professionalism, communication, and quality

### AI Features:
- **Skill Extraction**: Automatically extract skills from bio and experience
- **Task Recommendations**: AI matches workers with suitable tasks
- **Worker Recommendations**: AI suggests best workers for client tasks
- **Match Scoring**: Calculate compatibility between workers and tasks

## Profile Completion (Workers)
Profile completion is calculated based on:
- Bio (15%)
- Skills - minimum 3 required (25%)
- Experience (15%)
- Hourly Rate (10%)
- City (10%)
- Area (10%)
- Availability (5%)
- Phone Number (10%)

## Location Coverage
Earnify operates across Bangladesh with support for all major cities and districts.

## Budget & Payments
- Currency: Bangladeshi Taka (৳)
- Workers set hourly rates
- Clients set task budgets
- Payment made after delivery acceptance
- No upfront payment required

## Support & Help
- Report issues through the chatbot
- Get help with task workflow
- Learn about platform features
- Troubleshoot problems
- Contact support team

## Common Issues & Solutions

### For Workers:
**Q: Why am I not getting task recommendations?**
A: Complete your profile first. Add bio, skills (minimum 3), experience, hourly rate, and location.

**Q: How do I apply to a task?**
A: Browse available tasks, click on a task, and click "Apply Now". Write a compelling cover letter and set your proposed rate.

**Q: How do I deliver completed work?**
A: Go to "In Progress" tasks, click on the task, and click "Deliver Task". Add a delivery message explaining your work.

**Q: Can I request more time?**
A: Yes! Click "Request Extension" on your in-progress task and explain why you need more time.

**Q: When do I get paid?**
A: Payment is made by the client after they accept your delivery.

### For Clients:
**Q: How do I post a task?**
A: Click "Create Task" from your dashboard, fill in all details including title, description, budget, deadline, location, category, and required skills.

**Q: How do I choose a worker?**
A: Review applications, check worker profiles and ratings, then click "Assign Worker" on the best application.

**Q: What if I'm not satisfied with the delivery?**
A: You can request revisions or discuss with the worker before accepting delivery.

**Q: How do I make payment?**
A: After accepting delivery, click "Make Payment" on the task. Payment marks the task as completed.

**Q: Can I cancel a task?**
A: Yes, but it's best to communicate with the worker first if they've already been assigned.

## Technical Support
- Platform uses Next.js 14 with TypeScript
- MongoDB Atlas database
- JWT authentication with secure tokens
- AI powered by GROQ API with Llama 3.3 70B model
- Responsive design for mobile and desktop

## Contact & Reporting
Use this chatbot to:
- Report bugs or technical issues
- Get help with any feature
- Ask questions about the platform
- Request assistance with tasks
- Provide feedback
`

// Fetch user-specific data from database
async function fetchUserData(userId: string, role: string) {
  try {
    await dbConnect()

    const userData: any = {
      userId,
      role,
    }

    // Get user basic info
    const user = await User.findById(userId).select('firstName lastName email phoneNumber profileCompleted isVerified').lean()
    if (user) {
      userData.user = user
    }

    if (role === 'WORKER') {
      // Get worker profile
      const workerProfile = await WorkerProfile.findOne({ userId })
        .select('bio skills experience hourlyRate location availability rating completedTasks')
        .lean()
      if (workerProfile) {
        userData.profile = workerProfile
      }

      // Get worker's tasks (assigned)
      const assignedTasks = await Task.find({ assignedWorkerId: userId })
        .select('title status budget deadline deliveryStatus paymentStatus category')
        .populate('clientId', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
      userData.assignedTasks = assignedTasks

      // Get worker's applications
      const applications = await TaskApplication.find({ workerId: userId })
        .select('status proposedRate coverLetter createdAt')
        .populate('taskId', 'title budget category')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
      userData.applications = applications

      // Get worker's reviews
      const reviews = await Review.find({ workerId: userId })
        .select('rating comment skills professionalism communication quality createdAt')
        .populate('clientId', 'firstName lastName')
        .populate('taskId', 'title')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
      userData.reviews = reviews

      // Calculate statistics
      userData.stats = {
        totalTasksAssigned: assignedTasks.length,
        completedTasks: assignedTasks.filter((t: any) => t.status === 'COMPLETED').length,
        inProgressTasks: assignedTasks.filter((t: any) => t.status === 'IN_PROGRESS').length,
        totalApplications: applications.length,
        pendingApplications: applications.filter((a: any) => a.status === 'PENDING').length,
        acceptedApplications: applications.filter((a: any) => a.status === 'ACCEPTED').length,
        totalReviews: reviews.length,
        averageRating: workerProfile?.rating?.average || 0,
      }
    } else if (role === 'CLIENT') {
      // Get client's posted tasks
      const postedTasks = await Task.find({ clientId: userId })
        .select('title status budget deadline category skillsRequired location deliveryStatus paymentStatus')
        .populate('assignedWorkerId', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
      userData.postedTasks = postedTasks

      // Get applications for client's tasks
      const taskIds = postedTasks.map((t: any) => t._id)
      const applicationsReceived = await TaskApplication.find({ taskId: { $in: taskIds } })
        .select('status proposedRate coverLetter createdAt')
        .populate('workerId', 'firstName lastName')
        .populate('taskId', 'title')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean()
      userData.applicationsReceived = applicationsReceived

      // Get reviews given by client
      const reviewsGiven = await Review.find({ clientId: userId })
        .select('rating comment skills professionalism communication quality createdAt')
        .populate('workerId', 'firstName lastName')
        .populate('taskId', 'title')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
      userData.reviewsGiven = reviewsGiven

      // Calculate statistics
      userData.stats = {
        totalTasksPosted: postedTasks.length,
        openTasks: postedTasks.filter((t: any) => t.status === 'OPEN').length,
        inProgressTasks: postedTasks.filter((t: any) => t.status === 'IN_PROGRESS').length,
        completedTasks: postedTasks.filter((t: any) => t.status === 'COMPLETED').length,
        totalApplicationsReceived: applicationsReceived.length,
        pendingApplications: applicationsReceived.filter((a: any) => a.status === 'PENDING').length,
        totalReviewsGiven: reviewsGiven.length,
      }
    }

    return userData
  } catch (error) {
    console.error('Error fetching user data:', error)
    return null
  }
}

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

    const { message, conversationHistory } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Fetch user-specific data from database
    const userData = await fetchUserData(decoded.id, decoded.role)

    // Build user context from database
    let userContext = `\n\n## Current User Information\n`
    userContext += `- Role: ${decoded.role}\n`

    if (userData) {
      if (userData.user) {
        userContext += `- Name: ${userData.user.firstName} ${userData.user.lastName}\n`
        userContext += `- Email: ${userData.user.email}\n`
        userContext += `- Phone: ${userData.user.phoneNumber || 'Not provided'}\n`
        userContext += `- Profile Completed: ${userData.user.profileCompleted ? 'Yes' : 'No'}\n`
        userContext += `- Verified: ${userData.user.isVerified ? 'Yes' : 'No'}\n`
      }

      if (decoded.role === 'WORKER' && userData.profile) {
        userContext += `\n### Worker Profile:\n`
        userContext += `- Skills: ${userData.profile.skills?.join(', ') || 'None'}\n`
        userContext += `- Experience: ${userData.profile.experience || 'Not provided'}\n`
        userContext += `- Hourly Rate: ${userData.profile.hourlyRate ? `৳${userData.profile.hourlyRate}` : 'Not set'}\n`
        userContext += `- Location: ${userData.profile.location?.city || 'Not set'}, ${userData.profile.location?.area || ''}\n`
        userContext += `- Availability: ${userData.profile.availability}\n`
        userContext += `- Rating: ${userData.profile.rating?.average || 0}/5 (${userData.profile.rating?.count || 0} reviews)\n`
        userContext += `- Completed Tasks: ${userData.profile.completedTasks || 0}\n`
      }

      if (userData.stats) {
        userContext += `\n### Statistics:\n`
        if (decoded.role === 'WORKER') {
          userContext += `- Total Tasks Assigned: ${userData.stats.totalTasksAssigned}\n`
          userContext += `- Completed Tasks: ${userData.stats.completedTasks}\n`
          userContext += `- In Progress Tasks: ${userData.stats.inProgressTasks}\n`
          userContext += `- Total Applications: ${userData.stats.totalApplications}\n`
          userContext += `- Pending Applications: ${userData.stats.pendingApplications}\n`
          userContext += `- Accepted Applications: ${userData.stats.acceptedApplications}\n`
          userContext += `- Total Reviews: ${userData.stats.totalReviews}\n`
          userContext += `- Average Rating: ${userData.stats.averageRating}/5\n`
        } else if (decoded.role === 'CLIENT') {
          userContext += `- Total Tasks Posted: ${userData.stats.totalTasksPosted}\n`
          userContext += `- Open Tasks: ${userData.stats.openTasks}\n`
          userContext += `- In Progress Tasks: ${userData.stats.inProgressTasks}\n`
          userContext += `- Completed Tasks: ${userData.stats.completedTasks}\n`
          userContext += `- Applications Received: ${userData.stats.totalApplicationsReceived}\n`
          userContext += `- Pending Applications: ${userData.stats.pendingApplications}\n`
          userContext += `- Reviews Given: ${userData.stats.totalReviewsGiven}\n`
        }
      }

      // Add recent tasks info
      if (decoded.role === 'WORKER' && userData.assignedTasks?.length > 0) {
        userContext += `\n### Recent Assigned Tasks (${userData.assignedTasks.length}):\n`
        userData.assignedTasks.slice(0, 5).forEach((task: any, index: number) => {
          userContext += `${index + 1}. "${task.title}" - Status: ${task.status}, Budget: ৳${task.budget}, Category: ${task.category}\n`
        })
      }

      if (decoded.role === 'CLIENT' && userData.postedTasks?.length > 0) {
        userContext += `\n### Recent Posted Tasks (${userData.postedTasks.length}):\n`
        userData.postedTasks.slice(0, 5).forEach((task: any, index: number) => {
          userContext += `${index + 1}. "${task.title}" - Status: ${task.status}, Budget: ৳${task.budget}, Category: ${task.category}\n`
        })
      }

      // Add recent reviews
      if (decoded.role === 'WORKER' && userData.reviews?.length > 0) {
        userContext += `\n### Recent Reviews Received (${userData.reviews.length}):\n`
        userData.reviews.slice(0, 3).forEach((review: any, index: number) => {
          userContext += `${index + 1}. Rating: ${review.rating}/5 - "${review.comment?.substring(0, 100) || 'No comment'}"\n`
        })
      }

      if (decoded.role === 'CLIENT' && userData.reviewsGiven?.length > 0) {
        userContext += `\n### Recent Reviews Given (${userData.reviewsGiven.length}):\n`
        userData.reviewsGiven.slice(0, 3).forEach((review: any, index: number) => {
          userContext += `${index + 1}. Rating: ${review.rating}/5 for task "${review.taskId?.title || 'Unknown'}"\n`
        })
      }

      // Add applications info
      if (decoded.role === 'WORKER' && userData.applications?.length > 0) {
        userContext += `\n### Recent Applications (${userData.applications.length}):\n`
        userData.applications.slice(0, 3).forEach((app: any, index: number) => {
          userContext += `${index + 1}. Task: "${app.taskId?.title || 'Unknown'}" - Status: ${app.status}, Proposed Rate: ৳${app.proposedRate}\n`
        })
      }
    }

    // Build conversation messages
    const messages: any[] = [
      {
        role: 'system',
        content: `You are Earnify Support Assistant, a helpful and professional customer support chatbot for the Earnify platform.

${PLATFORM_KNOWLEDGE}

Your role:
- Help users understand how to use the platform
- Answer questions about features and workflows
- Troubleshoot common issues
- Provide step-by-step guidance
- Be friendly, professional, and concise
- Use the user's data below to provide personalized responses
- When asked about their data (tasks, reviews, profile, etc.), use the information provided below
- Calculate and analyze data when asked (e.g., "How many tasks have I completed?", "What's my average rating?")
- If you don't know something, admit it and suggest contacting human support
- Always format responses clearly with bullet points or numbered steps when appropriate
- Use Bangladeshi Taka (৳) for currency

${userContext}

Provide helpful, accurate, and personalized support based on the user's actual data.`,
      },
    ]

    // Add conversation history if provided
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      conversationHistory.forEach((msg: any) => {
        if (msg.role && msg.content) {
          messages.push({
            role: msg.role,
            content: msg.content,
          })
        }
      })
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: message,
    })

    // Get AI response
    const completion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1000,
    })

    const response = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.'

    return NextResponse.json({
      success: true,
      response,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Chatbot error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process message',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

