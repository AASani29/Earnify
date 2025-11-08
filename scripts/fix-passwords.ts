/**
 * Fix passwords for all seed users
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') })

// Import models
import User from '../lib/models/User'

const MONGODB_URI = process.env.MONGODB_URI || ''

async function fixPasswords() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    const seedEmails = [
      'rahim@example.com',
      'fatima@example.com',
      'karim@example.com',
      'nadia@example.com',
      'hassan@example.com',
      'techcorp@example.com',
      'designstudio@example.com',
      'ecommerce@example.com',
    ]

    console.log('🔐 Updating passwords for seed users...\n')

    for (const email of seedEmails) {
      const user = await User.findOne({ email })
      
      if (user) {
        // Set plain text password - the pre-save hook will hash it
        user.password = 'password123'
        await user.save()
        console.log(`  ✓ Updated password for: ${email}`)
      } else {
        console.log(`  ⊗ User not found: ${email}`)
      }
    }

    console.log('\n✅ All passwords updated successfully!')
    console.log('\n🔐 Test Credentials:')
    console.log('   Password: password123')
    console.log('\n👷 Workers:')
    console.log('   - rahim@example.com')
    console.log('   - fatima@example.com')
    console.log('   - karim@example.com')
    console.log('   - nadia@example.com')
    console.log('   - hassan@example.com')
    console.log('\n👔 Clients:')
    console.log('   - techcorp@example.com')
    console.log('   - designstudio@example.com')
    console.log('   - ecommerce@example.com')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.connection.close()
    console.log('\n👋 Database connection closed')
  }
}

fixPasswords()

