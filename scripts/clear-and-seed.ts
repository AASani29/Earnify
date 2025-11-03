import dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET')

import connectDB from '../lib/db'
import UserModel from '../lib/models/User'
import WorkerProfile from '../lib/models/WorkerProfile'
import ClientProfile from '../lib/models/ClientProfile'
import TaskModel from '../lib/models/Task'
import TaskApplicationModel from '../lib/models/TaskApplication'

async function clearAndSeed() {
  try {
    console.log('🧹 Clearing database...')
    await connectDB()

    // Delete all users, profiles, tasks, and applications
    await UserModel.deleteMany({})
    await WorkerProfile.deleteMany({})
    await ClientProfile.deleteMany({})
    await TaskModel.deleteMany({})
    await TaskApplicationModel.deleteMany({})

    console.log('✅ Database cleared')
    console.log('')
    console.log('🌱 Seeding fresh data...')

    // Create Admin
    const admin = await UserModel.create({
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
    const client = await UserModel.create({
      email: 'client@example.com',
      password: 'client123',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'CLIENT',
      phoneNumber: '+8801712345678',
      profileCompleted: true,
      isVerified: true,
    })
    console.log('✅ Created client user')

    // Create Worker
    const worker = await UserModel.create({
      email: 'worker@example.com',
      password: 'worker123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'WORKER',
      phoneNumber: '+8801787654321',
      profileCompleted: true,
      isVerified: true,
    })
    console.log('✅ Created worker user')

    // Create sample tasks
    const task1 = await TaskModel.create({
      title: 'Deliver packages in Dhaka',
      description: 'Need someone to deliver 5 packages across Dhaka city. Must have own vehicle and be available tomorrow.',
      category: 'DELIVERY',
      budget: 500,
      currency: 'BDT',
      location: {
        address: 'Gulshan 1, Road 12',
        city: 'Dhaka',
        district: 'Dhaka',
      },
      clientId: client._id,
      skillsRequired: ['Driving', 'Navigation'],
      estimatedDuration: 3,
      status: 'OPEN',
    })

    const task2 = await TaskModel.create({
      title: 'Clean 3-bedroom apartment',
      description: 'Looking for professional cleaning service for a 3-bedroom apartment. Deep cleaning required including kitchen and bathrooms.',
      category: 'CLEANING',
      budget: 1500,
      currency: 'BDT',
      location: {
        address: 'Banani, Block C',
        city: 'Dhaka',
        district: 'Dhaka',
      },
      clientId: client._id,
      skillsRequired: ['Cleaning', 'Attention to Detail'],
      estimatedDuration: 4,
      status: 'OPEN',
    })

    const task3 = await TaskModel.create({
      title: 'Fix laptop and install software',
      description: 'My laptop is running slow and I need Windows reinstalled along with essential software. Must be experienced with computer repairs.',
      category: 'TECH_SUPPORT',
      budget: 800,
      currency: 'BDT',
      location: {
        address: 'Dhanmondi 27',
        city: 'Dhaka',
        district: 'Dhaka',
      },
      clientId: client._id,
      skillsRequired: ['Computer Repair', 'Software Installation'],
      estimatedDuration: 2,
      status: 'OPEN',
    })

    console.log('✅ Created 3 sample tasks')

    console.log('')
    console.log('✅ Database seeded successfully!')
    console.log('')
    console.log('Test accounts:')
    console.log('- Admin: admin@example.com / admin123')
    console.log('- Client: client@example.com / client123')
    console.log('- Worker: worker@example.com / worker123')
    console.log('')
    console.log('Sample tasks created:')
    console.log('- Delivery task in Dhaka')
    console.log('- Cleaning task in Dhaka')
    console.log('- Tech support task in Dhaka')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

clearAndSeed()

