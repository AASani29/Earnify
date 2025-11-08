/**
 * Check user credentials
 */

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') })

// Import models
import User from '../lib/models/User'

const MONGODB_URI = process.env.MONGODB_URI || ''

async function checkUser() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    const user = await User.findOne({ email: 'rahim@example.com' })
    
    if (!user) {
      console.log('❌ User not found')
      return
    }

    console.log('👤 User found:')
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.firstName} ${user.lastName}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Password hash: ${user.password.substring(0, 20)}...`)
    
    // Test password
    const testPassword = 'password123'
    const isMatch = await bcrypt.compare(testPassword, user.password)
    
    console.log(`\n🔐 Password test:`)
    console.log(`   Testing: "${testPassword}"`)
    console.log(`   Result: ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`)
    
    if (!isMatch) {
      console.log('\n💡 Password does not match. Updating password...')
      console.log('   Note: User model has pre-save hook that will hash the password')

      // Set plain text password - the pre-save hook will hash it
      user.password = 'password123'
      await user.save()
      console.log('✅ Password updated successfully!')

      // Fetch user again to get the hashed password
      const updatedUser = await User.findOne({ email: 'rahim@example.com' })
      if (updatedUser) {
        const isMatchNow = await bcrypt.compare(testPassword, updatedUser.password)
        console.log(`   Re-test: ${isMatchNow ? '✅ MATCH' : '❌ NO MATCH'}`)
      }
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.connection.close()
    console.log('\n👋 Database connection closed')
  }
}

checkUser()

