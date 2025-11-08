import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/jwt'
import { extractSkills } from '@/lib/groq'
import dbConnect from '@/lib/db'
import WorkerProfile from '@/lib/models/WorkerProfile'

/**
 * POST /api/ai/extract-skills
 * Extract skills from bio and experience using AI
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

    const userId = decoded.id // Token contains 'id' not 'userId'

    // Get request body
    const body = await req.json()
    const { bio, experience, autoUpdate } = body

    if (!bio && !experience) {
      return NextResponse.json(
        { error: 'Please provide bio or experience text' },
        { status: 400 }
      )
    }

    // Combine bio and experience for skill extraction
    const text = [bio, experience].filter(Boolean).join('\n\n')

    // Extract skills using AI
    const extractedSkills = await extractSkills(text)

    // If autoUpdate is true, update the worker profile
    if (autoUpdate) {
      await dbConnect()
      
      const profile = await WorkerProfile.findOne({ userId })
      if (!profile) {
        return NextResponse.json(
          { error: 'Worker profile not found' },
          { status: 404 }
        )
      }

      // Merge extracted skills with existing skills (avoid duplicates)
      const existingSkills = profile.skills || []
      const mergedSkills = Array.from(
        new Set([...existingSkills, ...extractedSkills])
      )

      profile.skills = mergedSkills
      await profile.save()

      return NextResponse.json({
        success: true,
        extractedSkills,
        allSkills: mergedSkills,
        message: 'Skills extracted and profile updated successfully',
      })
    }

    // Return extracted skills without updating
    return NextResponse.json({
      success: true,
      extractedSkills,
    })
  } catch (error: any) {
    console.error('Error in extract-skills API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to extract skills' },
      { status: 500 }
    )
  }
}

