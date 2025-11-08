/**
 * Check if worker profiles exist
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') })

// Import models
import User from '../lib/models/User'
import WorkerProfile from '../lib/models/WorkerProfile'

const MONGODB_URI = process.env.MONGODB_URI || ''

async function checkProfiles() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    const workers = await User.find({ role: 'WORKER' })
    
    console.log(`Found ${workers.length} workers:\n`)

    for (const worker of workers) {
      const profile = await WorkerProfile.findOne({ userId: worker._id })
      
      console.log(`👤 ${worker.firstName} ${worker.lastName} (${worker.email})`)
      console.log(`   User ID: ${worker._id}`)
      console.log(`   Profile: ${profile ? '✅ EXISTS' : '❌ MISSING'}`)
      
      if (profile) {
        console.log(`   Skills: ${profile.skills?.join(', ') || 'None'}`)
        console.log(`   Location: ${profile.location?.city || 'N/A'}, ${profile.location?.area || 'N/A'}`)
        console.log(`   Rating: ${profile.rating?.average || 0} (${profile.rating?.count || 0} reviews)`)
        console.log(`   Completed Tasks: ${profile.completedTasks || 0}`)
      }
      console.log('')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.connection.close()
    console.log('👋 Database connection closed')
  }
}

checkProfiles()

