/**
 * Seed script to populate database with sample data for testing AI features
 * Run with: npx ts-node scripts/seed-data.ts
 */

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') })

// Import models
import User from '../lib/models/User'
import WorkerProfile from '../lib/models/WorkerProfile'
import ClientProfile from '../lib/models/ClientProfile'
import Task from '../lib/models/Task'
import TaskApplication from '../lib/models/TaskApplication'
import Review from '../lib/models/Review'

const MONGODB_URI = process.env.MONGODB_URI || ''

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}

async function seedData() {
  console.log('🌱 Starting database seeding...\n')

  // Check if seed data already exists
  const existingWorker = await User.findOne({ email: 'rahim@example.com' })
  if (existingWorker) {
    console.log('✅ Seed data already exists in database!')
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
    console.log('\n💡 To re-seed with fresh data, delete existing users first.')
    return
  }

  // Note: User model has a pre-save hook that hashes passwords
  // So we use plain text here and let the model handle hashing
  const plainPassword = 'password123'

  // Create Workers
  console.log('👷 Creating workers...')
  const workers = []
  
  const workerData = [
    {
      email: 'rahim@example.com',
      firstName: 'Abdul',
      lastName: 'Rahim',
      role: 'WORKER',
      phoneNumber: '+8801712345678',
      profileCompleted: true,
      profile: {
        bio: 'Experienced web developer with 5 years of experience in React and Node.js. Passionate about creating responsive and user-friendly applications.',
        skills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'MongoDB', 'Express.js', 'Next.js'],
        experience: 'Worked on multiple e-commerce and SaaS projects. Specialized in full-stack development with modern frameworks.',
        hourlyRate: 800,
        location: { city: 'Dhaka', area: 'Dhanmondi' },
        availability: 'AVAILABLE',
      },
    },
    {
      email: 'fatima@example.com',
      firstName: 'Fatima',
      lastName: 'Khan',
      role: 'WORKER',
      phoneNumber: '+8801812345679',
      profileCompleted: true,
      profile: {
        bio: 'Professional graphic designer and UI/UX specialist. Creating beautiful and functional designs for 4 years.',
        skills: ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'UI Design', 'UX Research', 'Prototyping'],
        experience: 'Designed interfaces for mobile apps, websites, and SaaS products. Strong focus on user experience and accessibility.',
        hourlyRate: 600,
        location: { city: 'Dhaka', area: 'Gulshan' },
        availability: 'AVAILABLE',
      },
    },
    {
      email: 'karim@example.com',
      firstName: 'Karim',
      lastName: 'Ahmed',
      role: 'WORKER',
      phoneNumber: '+8801912345680',
      profileCompleted: true,
      profile: {
        bio: 'Digital marketing expert specializing in SEO, social media marketing, and content strategy.',
        skills: ['SEO', 'Social Media Marketing', 'Content Writing', 'Google Ads', 'Facebook Ads', 'Analytics'],
        experience: 'Helped 20+ businesses grow their online presence. Expert in data-driven marketing strategies.',
        hourlyRate: 500,
        location: { city: 'Dhaka', area: 'Banani' },
        availability: 'AVAILABLE',
      },
    },
    {
      email: 'nadia@example.com',
      firstName: 'Nadia',
      lastName: 'Islam',
      role: 'WORKER',
      phoneNumber: '+8801612345681',
      profileCompleted: true,
      profile: {
        bio: 'Mobile app developer with expertise in React Native and Flutter. Built 15+ apps for iOS and Android.',
        skills: ['React Native', 'Flutter', 'Dart', 'iOS Development', 'Android Development', 'Firebase'],
        experience: 'Developed apps for healthcare, education, and e-commerce sectors. Focus on performance and user experience.',
        hourlyRate: 900,
        location: { city: 'Chittagong', area: 'Agrabad' },
        availability: 'AVAILABLE',
      },
    },
    {
      email: 'hassan@example.com',
      firstName: 'Hassan',
      lastName: 'Rahman',
      role: 'WORKER',
      phoneNumber: '+8801512345682',
      profileCompleted: true,
      profile: {
        bio: 'Data analyst and Python developer. Experienced in data visualization, machine learning, and automation.',
        skills: ['Python', 'Data Analysis', 'Machine Learning', 'Pandas', 'NumPy', 'SQL', 'Power BI'],
        experience: 'Worked with financial and healthcare data. Created automated reporting systems and predictive models.',
        hourlyRate: 700,
        location: { city: 'Dhaka', area: 'Mirpur' },
        availability: 'AVAILABLE',
      },
    },
  ]

  for (const data of workerData) {
    // Check if user already exists
    let user = await User.findOne({ email: data.email })

    if (!user) {
      user = await User.create({
        email: data.email,
        password: plainPassword, // Will be hashed by pre-save hook
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        phoneNumber: data.phoneNumber,
        profileCompleted: data.profileCompleted,
        isVerified: true,
      })
      console.log(`  ✓ Created worker: ${data.firstName} ${data.lastName}`)
    } else {
      console.log(`  ⊙ Worker already exists: ${data.firstName} ${data.lastName}`)
    }

    // Check if profile exists
    let workerProfile = await WorkerProfile.findOne({ userId: user._id })

    if (!workerProfile) {
      workerProfile = await WorkerProfile.create({
        userId: user._id,
        ...data.profile,
      })
      console.log(`  ✓ Created profile for: ${data.firstName} ${data.lastName}`)
    } else {
      console.log(`  ⊙ Profile already exists for: ${data.firstName} ${data.lastName}`)
    }

    workers.push({ user, profile: workerProfile })
  }

  // Create Clients
  console.log('\n👔 Creating clients...')
  const clients = []

  const clientData = [
    {
      email: 'techcorp@example.com',
      firstName: 'Amir',
      lastName: 'Hossain',
      role: 'CLIENT',
      phoneNumber: '+8801412345683',
      profileCompleted: true,
      profile: {
        companyName: 'TechCorp Bangladesh',
        companyDescription: 'Leading software development company in Bangladesh',
        industry: 'Technology',
        website: 'https://techcorp.com.bd',
        location: { city: 'Dhaka', area: 'Gulshan', address: '123 Gulshan Avenue' },
      },
    },
    {
      email: 'designstudio@example.com',
      firstName: 'Sadia',
      lastName: 'Begum',
      role: 'CLIENT',
      phoneNumber: '+8801312345684',
      profileCompleted: true,
      profile: {
        companyName: 'Creative Design Studio',
        companyDescription: 'Award-winning design agency specializing in branding and digital design',
        industry: 'Design & Marketing',
        website: 'https://creativedesign.com.bd',
        location: { city: 'Dhaka', area: 'Dhanmondi', address: '456 Dhanmondi Road' },
      },
    },
    {
      email: 'ecommerce@example.com',
      firstName: 'Rafiq',
      lastName: 'Uddin',
      role: 'CLIENT',
      phoneNumber: '+8801212345685',
      profileCompleted: true,
      profile: {
        companyName: 'ShopBD Online',
        companyDescription: 'Fast-growing e-commerce platform for Bangladesh',
        industry: 'E-commerce',
        website: 'https://shopbd.com',
        location: { city: 'Dhaka', area: 'Banani', address: '789 Banani Road' },
      },
    },
  ]

  for (const data of clientData) {
    // Check if user already exists
    let user = await User.findOne({ email: data.email })

    if (!user) {
      user = await User.create({
        email: data.email,
        password: plainPassword, // Will be hashed by pre-save hook
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        phoneNumber: data.phoneNumber,
        profileCompleted: data.profileCompleted,
        isVerified: true,
      })
      console.log(`  ✓ Created client: ${data.profile.companyName}`)
    } else {
      console.log(`  ⊙ Client already exists: ${data.profile.companyName}`)
    }

    // Check if profile exists
    let clientProfile = await ClientProfile.findOne({ userId: user._id })

    if (!clientProfile) {
      clientProfile = await ClientProfile.create({
        userId: user._id,
        ...data.profile,
      })
      console.log(`  ✓ Created profile for: ${data.profile.companyName}`)
    } else {
      console.log(`  ⊙ Profile already exists for: ${data.profile.companyName}`)
    }

    clients.push({ user, profile: clientProfile })
  }

  console.log('\n📋 Creating tasks...')
  const tasks = []

  // Task 1: Tech Support (COMPLETED)
  const task1 = await Task.create({
    title: 'Build E-commerce Website with React',
    description: 'Need a modern e-commerce website built with React and Node.js. Should include product catalog, shopping cart, and payment integration. Must be responsive and SEO-friendly.',
    category: 'TECH_SUPPORT',
    skillsRequired: ['React', 'Node.js', 'MongoDB', 'Express.js'],
    budget: 50000,
    currency: 'BDT',
    location: {
      address: '123 Gulshan Avenue, Dhaka',
      city: 'Dhaka',
      district: 'Dhaka',
    },
    deadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    estimatedDuration: 320, // hours (2 months)
    clientId: clients[0].user._id,
    status: 'COMPLETED',
    assignedWorkerId: workers[0].user._id,
  })
  tasks.push(task1)
  console.log(`  ✓ Created task: ${task1.title}`)

  // Task 2: Design (COMPLETED)
  const task2 = await Task.create({
    title: 'Mobile App UI/UX Design',
    description: 'Design a modern and user-friendly interface for a healthcare mobile app. Need complete UI kit and prototypes with all screens and user flows.',
    category: 'DESIGN',
    skillsRequired: ['Figma', 'UI Design', 'UX Research', 'Prototyping'],
    budget: 25000,
    currency: 'BDT',
    location: {
      address: '456 Dhanmondi Road, Dhaka',
      city: 'Dhaka',
      district: 'Dhaka',
    },
    deadline: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    estimatedDuration: 120, // hours (3 weeks)
    clientId: clients[1].user._id,
    status: 'COMPLETED',
    assignedWorkerId: workers[1].user._id,
  })
  tasks.push(task2)
  console.log(`  ✓ Created task: ${task2.title}`)

  // Task 3: Writing (COMPLETED)
  const task3 = await Task.create({
    title: 'SEO Content Writing and Blog Posts',
    description: 'Write 20 SEO-optimized blog posts for our e-commerce website. Each post should be 1000-1500 words with proper keyword research and meta descriptions.',
    category: 'WRITING',
    skillsRequired: ['SEO', 'Content Writing', 'Copywriting', 'Research'],
    budget: 35000,
    currency: 'BDT',
    location: {
      address: '789 Banani Road, Dhaka',
      city: 'Dhaka',
      district: 'Dhaka',
    },
    deadline: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    estimatedDuration: 160, // hours
    clientId: clients[2].user._id,
    status: 'COMPLETED',
    assignedWorkerId: workers[2].user._id,
  })
  tasks.push(task3)
  console.log(`  ✓ Created task: ${task3.title}`)

  // Task 4: Tech Support (OPEN)
  const task4 = await Task.create({
    title: 'React Native Food Delivery App Development',
    description: 'Build a food delivery mobile app with real-time tracking, payment integration, and restaurant management system. Need both iOS and Android versions.',
    category: 'TECH_SUPPORT',
    skillsRequired: ['React Native', 'Firebase', 'iOS Development', 'Android Development'],
    budget: 80000,
    currency: 'BDT',
    location: {
      address: '123 Gulshan Avenue, Dhaka',
      city: 'Dhaka',
      district: 'Dhaka',
    },
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    estimatedDuration: 480, // hours (3 months)
    clientId: clients[0].user._id,
    status: 'OPEN',
  })
  tasks.push(task4)
  console.log(`  ✓ Created task: ${task4.title}`)

  // Task 5: Other (OPEN)
  const task5 = await Task.create({
    title: 'Sales Data Analysis and Reporting Dashboard',
    description: 'Analyze 2 years of sales data and create automated reporting dashboards with insights and predictions using Python and Power BI.',
    category: 'OTHER',
    skillsRequired: ['Python', 'Data Analysis', 'SQL', 'Power BI', 'Machine Learning'],
    budget: 40000,
    currency: 'BDT',
    location: {
      address: '789 Banani Road, Dhaka',
      city: 'Dhaka',
      district: 'Dhaka',
    },
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    estimatedDuration: 240, // hours (6 weeks)
    clientId: clients[2].user._id,
    status: 'OPEN',
  })
  tasks.push(task5)
  console.log(`  ✓ Created task: ${task5.title}`)

  // Task 6: Design (OPEN)
  const task6 = await Task.create({
    title: 'Corporate Branding and Logo Design',
    description: 'Create a complete brand identity including logo, color palette, typography, and brand guidelines for a new tech startup.',
    category: 'DESIGN',
    skillsRequired: ['Logo Design', 'Branding', 'Adobe Illustrator', 'Graphic Design'],
    budget: 35000,
    currency: 'BDT',
    location: {
      address: 'CDA Avenue, Agrabad, Chittagong',
      city: 'Chittagong',
      district: 'Chittagong',
    },
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    estimatedDuration: 80, // hours (1 month)
    clientId: clients[1].user._id,
    status: 'OPEN',
  })
  tasks.push(task6)
  console.log(`  ✓ Created task: ${task6.title}`)

  // Create Reviews for completed tasks
  console.log('\n⭐ Creating reviews...')

  // Review 1: For Abdul Rahim (Web Developer)
  const review1 = await Review.create({
    taskId: task1._id,
    workerId: workers[0].user._id,
    clientId: clients[0].user._id,
    rating: 5,
    comment: 'Excellent work! Abdul delivered a high-quality e-commerce website ahead of schedule. Very professional and responsive to feedback. The code is clean and well-documented. Highly recommended!',
    skills: ['React', 'Node.js', 'MongoDB', 'Express.js'],
    professionalism: 5,
    communication: 5,
    quality: 5,
    timeliness: 5,
    wouldHireAgain: true,
  })
  console.log(`  ✓ Created review for ${workers[0].user.firstName} ${workers[0].user.lastName}`)

  // Review 2: For Fatima Khan (Designer)
  const review2 = await Review.create({
    taskId: task2._id,
    workerId: workers[1].user._id,
    clientId: clients[1].user._id,
    rating: 5,
    comment: 'Fatima created beautiful and intuitive designs for our healthcare app. She understood our requirements perfectly and delivered exceptional UI/UX work. Great attention to detail!',
    skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping'],
    professionalism: 5,
    communication: 5,
    quality: 5,
    timeliness: 4,
    wouldHireAgain: true,
  })
  console.log(`  ✓ Created review for ${workers[1].user.firstName} ${workers[1].user.lastName}`)

  // Review 3: For Karim Ahmed (Digital Marketer)
  const review3 = await Review.create({
    taskId: task3._id,
    workerId: workers[2].user._id,
    clientId: clients[2].user._id,
    rating: 4,
    comment: 'Karim ran a successful marketing campaign that increased our website traffic by 150%. Good communication and data-driven approach. Would work with him again.',
    skills: ['SEO', 'Social Media Marketing', 'Google Ads', 'Analytics'],
    professionalism: 4,
    communication: 5,
    quality: 4,
    timeliness: 4,
    wouldHireAgain: true,
  })
  console.log(`  ✓ Created review for ${workers[2].user.firstName} ${workers[2].user.lastName}`)

  // Update worker profiles with ratings
  console.log('\n📊 Updating worker ratings...')

  // Update Abdul Rahim's rating
  workers[0].profile.rating.average = 5.0
  workers[0].profile.rating.count = 1
  workers[0].profile.completedTasks = 1
  await workers[0].profile.save()
  console.log(`  ✓ Updated rating for ${workers[0].user.firstName}`)

  // Update Fatima Khan's rating
  workers[1].profile.rating.average = 5.0
  workers[1].profile.rating.count = 1
  workers[1].profile.completedTasks = 1
  await workers[1].profile.save()
  console.log(`  ✓ Updated rating for ${workers[1].user.firstName}`)

  // Update Karim Ahmed's rating
  workers[2].profile.rating.average = 4.0
  workers[2].profile.rating.count = 1
  workers[2].profile.completedTasks = 1
  await workers[2].profile.save()
  console.log(`  ✓ Updated rating for ${workers[2].user.firstName}`)

  console.log('\n✅ Database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`  - Workers created: ${workers.length}`)
  console.log(`  - Clients created: ${clients.length}`)
  console.log(`  - Tasks created: ${tasks.length}`)
  console.log(`  - Reviews created: 3`)
  console.log('\n🔐 Login credentials (all users):')
  console.log('  Password: password123')
  console.log('\n👷 Workers:')
  workers.forEach(w => console.log(`  - ${w.user.email}`))
  console.log('\n👔 Clients:')
  clients.forEach(c => console.log(`  - ${c.user.email}`))
}

async function main() {
  try {
    await connectDB()
    await seedData()
  } catch (error) {
    console.error('❌ Error seeding database:', error)
  } finally {
    await mongoose.connection.close()
    console.log('\n👋 Database connection closed')
    process.exit(0)
  }
}

main()

