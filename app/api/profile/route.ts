import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/jwt'
import connectDB from '@/lib/db'
import User from '@/lib/models/User'
import WorkerProfile from '@/lib/models/WorkerProfile'
import ClientProfile from '@/lib/models/ClientProfile'

// GET /api/profile - Get user profile
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyAccessToken(token)

    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return profile data based on role
    const profile: any = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phoneNumber: user.phoneNumber,
      profileCompleted: user.profileCompleted,
      isVerified: user.isVerified,
    }

    if (user.role === 'WORKER') {
      const workerProfile = await WorkerProfile.findOne({ userId: user._id })
      if (workerProfile) {
        profile.bio = workerProfile.bio
        profile.skills = workerProfile.skills
        profile.experience = workerProfile.experience
        profile.hourlyRate = workerProfile.hourlyRate
        profile.city = workerProfile.location?.city
        profile.area = workerProfile.location?.area
        profile.availability = workerProfile.availability
        profile.rating = workerProfile.rating
        profile.completedTasks = workerProfile.completedTasks
      }
    } else if (user.role === 'CLIENT') {
      const clientProfile = await ClientProfile.findOne({ userId: user._id })
      if (clientProfile) {
        profile.companyName = clientProfile.companyName
        profile.companyDescription = clientProfile.companyDescription
        profile.industry = clientProfile.industry
        profile.website = clientProfile.website
        profile.city = clientProfile.location?.city
        profile.area = clientProfile.location?.area
        profile.address = clientProfile.location?.address
      }
    }

    return NextResponse.json({ profile }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/profile - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyAccessToken(token)

    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()

    await connectDB()

    const user = await User.findById(decoded.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update profile based on role
    if (user.role === 'WORKER') {
      // Update or create WorkerProfile
      const workerProfileData: any = {}

      if (body.bio !== undefined) workerProfileData.bio = body.bio
      if (body.skills !== undefined) workerProfileData.skills = body.skills
      if (body.experience !== undefined) workerProfileData.experience = body.experience
      if (body.hourlyRate !== undefined) workerProfileData.hourlyRate = parseFloat(body.hourlyRate)

      // Handle location
      if (body.city !== undefined || body.area !== undefined) {
        workerProfileData.location = {}
        if (body.city !== undefined) workerProfileData.location.city = body.city
        if (body.area !== undefined) workerProfileData.location.area = body.area
      }

      if (body.availability !== undefined) workerProfileData.availability = body.availability

      // Update or create worker profile
      await WorkerProfile.findOneAndUpdate(
        { userId: user._id },
        { $set: workerProfileData },
        { upsert: true, new: true }
      )

      // Mark profile as completed if skills are provided
      if (body.skills && body.skills.length > 0) {
        user.profileCompleted = true
      }
    } else if (user.role === 'CLIENT') {
      // Update or create ClientProfile
      const clientProfileData: any = {}

      if (body.companyName !== undefined) clientProfileData.companyName = body.companyName
      if (body.companyDescription !== undefined) clientProfileData.companyDescription = body.companyDescription
      if (body.industry !== undefined) clientProfileData.industry = body.industry
      if (body.website !== undefined) clientProfileData.website = body.website

      // Handle location
      if (body.city !== undefined || body.area !== undefined || body.address !== undefined) {
        clientProfileData.location = {}
        if (body.city !== undefined) clientProfileData.location.city = body.city
        if (body.area !== undefined) clientProfileData.location.area = body.area
        if (body.address !== undefined) clientProfileData.location.address = body.address
      }

      // Update or create client profile
      await ClientProfile.findOneAndUpdate(
        { userId: user._id },
        { $set: clientProfileData },
        { upsert: true, new: true }
      )

      // Mark profile as completed if company name is provided
      if (body.companyName) {
        user.profileCompleted = true
      }
    }

    await user.save()

    // Return updated profile
    const profile: any = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phoneNumber: user.phoneNumber,
      profileCompleted: user.profileCompleted,
      isVerified: user.isVerified,
    }

    if (user.role === 'WORKER') {
      const workerProfile = await WorkerProfile.findOne({ userId: user._id })
      if (workerProfile) {
        profile.bio = workerProfile.bio
        profile.skills = workerProfile.skills
        profile.experience = workerProfile.experience
        profile.hourlyRate = workerProfile.hourlyRate
        profile.city = workerProfile.location?.city
        profile.area = workerProfile.location?.area
        profile.availability = workerProfile.availability
        profile.rating = workerProfile.rating
        profile.completedTasks = workerProfile.completedTasks
      }
    } else if (user.role === 'CLIENT') {
      const clientProfile = await ClientProfile.findOne({ userId: user._id })
      if (clientProfile) {
        profile.companyName = clientProfile.companyName
        profile.companyDescription = clientProfile.companyDescription
        profile.industry = clientProfile.industry
        profile.website = clientProfile.website
        profile.city = clientProfile.location?.city
        profile.area = clientProfile.location?.area
        profile.address = clientProfile.location?.address
      }
    }

    return NextResponse.json({ profile, message: 'Profile updated successfully' }, { status: 200 })
  } catch (error: any) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

