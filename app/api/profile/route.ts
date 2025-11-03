import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/jwt'
import connectDB from '@/lib/db'
import User from '@/lib/models/User'

// GET /api/profile - Get user profile
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyAccessToken(token)

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(decoded.userId).select('-password')
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
      profile.bio = user.bio
      profile.skills = user.skills
      profile.experience = user.experience
      profile.hourlyRate = user.hourlyRate
      profile.city = user.city
      profile.area = user.area
    } else if (user.role === 'CLIENT') {
      profile.companyName = user.companyName
      profile.companyDescription = user.companyDescription
      profile.industry = user.industry
      profile.website = user.website
      profile.city = user.city
      profile.area = user.area
      profile.address = user.address
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

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()

    await connectDB()

    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update profile based on role
    if (user.role === 'WORKER') {
      if (body.bio !== undefined) user.bio = body.bio
      if (body.skills !== undefined) user.skills = body.skills
      if (body.experience !== undefined) user.experience = body.experience
      if (body.hourlyRate !== undefined) user.hourlyRate = body.hourlyRate
      if (body.city !== undefined) user.city = body.city
      if (body.area !== undefined) user.area = body.area

      // Mark profile as completed if skills are provided
      if (body.skills && body.skills.length > 0) {
        user.profileCompleted = true
      }
    } else if (user.role === 'CLIENT') {
      if (body.companyName !== undefined) user.companyName = body.companyName
      if (body.companyDescription !== undefined) user.companyDescription = body.companyDescription
      if (body.industry !== undefined) user.industry = body.industry
      if (body.website !== undefined) user.website = body.website
      if (body.city !== undefined) user.city = body.city
      if (body.area !== undefined) user.area = body.area
      if (body.address !== undefined) user.address = body.address

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
      profile.bio = user.bio
      profile.skills = user.skills
      profile.experience = user.experience
      profile.hourlyRate = user.hourlyRate
      profile.city = user.city
      profile.area = user.area
    } else if (user.role === 'CLIENT') {
      profile.companyName = user.companyName
      profile.companyDescription = user.companyDescription
      profile.industry = user.industry
      profile.website = user.website
      profile.city = user.city
      profile.area = user.area
      profile.address = user.address
    }

    return NextResponse.json({ profile, message: 'Profile updated successfully' }, { status: 200 })
  } catch (error: any) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

