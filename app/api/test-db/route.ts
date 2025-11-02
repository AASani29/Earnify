import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'

export async function GET() {
  try {
    console.log('Testing database connection...')
    const startTime = Date.now()
    
    await connectDB()
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connected successfully',
      duration: `${duration}ms`
    })
  } catch (error: any) {
    console.error('Database test error:', error)
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Database connection failed',
      error: error.toString()
    }, { status: 500 })
  }
}

