import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/jwt'
import dbConnect from '@/lib/db'
import SupportTicket from '@/lib/models/SupportTicket'
import User from '@/lib/models/User'

// GET /api/support-tickets - Get support tickets (for users and admin)
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

    await dbConnect()

    const user = await User.findById(decoded.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query: any = {}

    // If admin, get all tickets or filter by status
    if (user.role === 'ADMIN') {
      if (status) {
        query.status = status
      }
    } else {
      // For regular users, only get their own tickets
      query.userId = decoded.id
      if (status) {
        query.status = status
      }
    }

    const tickets = await SupportTicket.find(query)
      .populate('userId', 'firstName lastName email role')
      .populate('assignedAdminId', 'firstName lastName')
      .populate('relatedTaskId', 'title')
      .sort({ lastMessageAt: -1 })
      .lean()

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('Error fetching support tickets:', error)
    return NextResponse.json({ error: 'Failed to fetch support tickets' }, { status: 500 })
  }
}

// POST /api/support-tickets - Create a new support ticket
export async function POST(request: NextRequest) {
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

    await dbConnect()

    const user = await User.findById(decoded.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role === 'ADMIN') {
      return NextResponse.json({ error: 'Admins cannot create support tickets' }, { status: 400 })
    }

    const body = await request.json()
    const { subject, category, priority, message, relatedTaskId } = body

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 })
    }

    const ticket = await SupportTicket.create({
      userId: decoded.id,
      userRole: user.role,
      subject,
      category: category || 'GENERAL',
      priority: priority || 'MEDIUM',
      status: 'OPEN',
      messages: [
        {
          senderId: decoded.id,
          senderRole: user.role,
          message,
          createdAt: new Date(),
        },
      ],
      relatedTaskId: relatedTaskId || undefined,
      lastMessageAt: new Date(),
    })

    const populatedTicket = await SupportTicket.findById(ticket._id)
      .populate('userId', 'firstName lastName email role')
      .populate('relatedTaskId', 'title')
      .lean()

    return NextResponse.json({ ticket: populatedTicket }, { status: 201 })
  } catch (error) {
    console.error('Error creating support ticket:', error)
    return NextResponse.json({ error: 'Failed to create support ticket' }, { status: 500 })
  }
}

