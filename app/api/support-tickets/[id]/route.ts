import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/jwt'
import dbConnect from '@/lib/db'
import SupportTicket from '@/lib/models/SupportTicket'
import User from '@/lib/models/User'

// GET /api/support-tickets/[id] - Get a specific ticket
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const ticket = await SupportTicket.findById(params.id)
      .populate('userId', 'firstName lastName email role')
      .populate('assignedAdminId', 'firstName lastName')
      .populate('relatedTaskId', 'title')
      .populate('messages.senderId', 'firstName lastName role')
      .lean()

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Check authorization - users can only view their own tickets, admins can view all
    if (user.role !== 'ADMIN' && ticket.userId._id.toString() !== decoded.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Error fetching ticket:', error)
    return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 })
  }
}

// PATCH /api/support-tickets/[id] - Update ticket (add message, change status, etc.)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

    const ticket = await SupportTicket.findById(params.id)
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Check authorization
    if (user.role !== 'ADMIN' && ticket.userId.toString() !== decoded.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { message, status, priority, assignedAdminId } = body

    // Add message if provided
    if (message) {
      ticket.messages.push({
        senderId: decoded.id as any,
        senderRole: user.role,
        message,
        createdAt: new Date(),
      } as any)
      ticket.lastMessageAt = new Date()

      // If user sends a message and ticket is resolved/closed, reopen it
      if (user.role !== 'ADMIN' && (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED')) {
        ticket.status = 'OPEN'
      }

      // If admin sends first message, set status to IN_PROGRESS
      if (user.role === 'ADMIN' && ticket.status === 'OPEN') {
        ticket.status = 'IN_PROGRESS'
      }
    }

    // Update status if provided (admin only)
    if (status && user.role === 'ADMIN') {
      ticket.status = status
    }

    // Update priority if provided (admin only)
    if (priority && user.role === 'ADMIN') {
      ticket.priority = priority
    }

    // Assign admin if provided (admin only)
    if (assignedAdminId !== undefined && user.role === 'ADMIN') {
      ticket.assignedAdminId = assignedAdminId || undefined
    }

    await ticket.save()

    const updatedTicket = await SupportTicket.findById(ticket._id)
      .populate('userId', 'firstName lastName email role')
      .populate('assignedAdminId', 'firstName lastName')
      .populate('relatedTaskId', 'title')
      .populate('messages.senderId', 'firstName lastName role')
      .lean()

    return NextResponse.json({ ticket: updatedTicket })
  } catch (error) {
    console.error('Error updating ticket:', error)
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })
  }
}

