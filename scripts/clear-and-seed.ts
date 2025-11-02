import dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET')

import connectDB from '../lib/db'
import UserModel from '../lib/models/User'
import WorkerProfile from '../lib/models/WorkerProfile'
import ClientProfile from '../lib/models/ClientProfile'

async function clearAndSeed() {
  try {
    console.log('🧹 Clearing database...')
    await connectDB()

    // Delete all users and profiles
    await UserModel.deleteMany({})
    await WorkerProfile.deleteMany({})
    await ClientProfile.deleteMany({})
    
    console.log('✅ Database cleared')
    console.log('')
    console.log('🌱 Seeding fresh data...')

    // Create Admin
    await UserModel.create({
      email: 'admin@example.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      profileCompleted: true,
      isVerified: true,
    })
    console.log('✅ Created admin user')

    // Create Client
    await UserModel.create({
      email: 'client@example.com',
      password: 'client123',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'CLIENT',
      phoneNumber: '+8801712345678',
      profileCompleted: false,
      isVerified: false,
    })
    console.log('✅ Created client user')

    // Create Worker
    await UserModel.create({
      email: 'worker@example.com',
      password: 'worker123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'WORKER',
      phoneNumber: '+8801787654321',
      profileCompleted: false,
      isVerified: false,
    })
    console.log('✅ Created worker user')

    console.log('')
    console.log('✅ Database seeded successfully!')
    console.log('')
    console.log('Test accounts:')
    console.log('- Admin: admin@example.com / admin123')
    console.log('- Client: client@example.com / client123')
    console.log('- Worker: worker@example.com / worker123')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

clearAndSeed()

