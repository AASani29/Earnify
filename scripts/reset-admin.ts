import dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

import connectDB from '../lib/db'
import UserModel from '../lib/models/User'

async function resetAdmin() {
  try {
    console.log('🔄 Resetting admin user...')
    await connectDB()

    // Delete existing admin
    await UserModel.deleteOne({ email: 'admin@example.com' })
    console.log('Deleted old admin user')

    // Create new admin
    await UserModel.create({
      email: 'admin@example.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      profileCompleted: true,
      isVerified: true,
    })

    console.log('✅ Admin user reset successfully!')
    console.log('\nAdmin credentials:')
    console.log('Email: admin@example.com')
    console.log('Password: admin123')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error resetting admin:', error)
    process.exit(1)
  }
}

resetAdmin()

