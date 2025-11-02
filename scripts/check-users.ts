import dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

import connectDB from '../lib/db'
import UserModel from '../lib/models/User'

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...\n')
    await connectDB()

    const users = await UserModel.find({}).select('email firstName lastName role profileCompleted isVerified')
    
    console.log(`Found ${users.length} users:\n`)
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`)
      console.log(`   Name: ${user.firstName} ${user.lastName}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Profile Completed: ${user.profileCompleted}`)
      console.log(`   Verified: ${user.isVerified}`)
      console.log('')
    })

    process.exit(0)
  } catch (error) {
    console.error('❌ Error checking users:', error)
    process.exit(1)
  }
}

checkUsers()

