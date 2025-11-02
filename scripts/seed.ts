import dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

import { seedUsers } from '../lib/users'

async function seed() {
  try {
    console.log('🌱 Seeding database...')
    await seedUsers()
    console.log('✅ Database seeded successfully!')
    console.log('\nTest accounts created:')
    console.log('- Admin: admin@example.com / admin123')
    console.log('- Client: client@example.com / client123')
    console.log('- Worker: worker@example.com / worker123')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seed()

