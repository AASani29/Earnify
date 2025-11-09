/**
 * Add more tasks and reviews for testing AI features
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') })

// Import models
import User from '../lib/models/User'
import WorkerProfile from '../lib/models/WorkerProfile'
import ClientProfile from '../lib/models/ClientProfile'
import Task from '../lib/models/Task'
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

async function addTasksAndReviews() {
  console.log('🌱 Adding tasks and reviews...\n')

  // Get users
  const workers = {
    rahim: await User.findOne({ email: 'rahim@example.com' }),
    fatima: await User.findOne({ email: 'fatima@example.com' }),
    karim: await User.findOne({ email: 'karim@example.com' }),
    nadia: await User.findOne({ email: 'nadia@example.com' }),
    hassan: await User.findOne({ email: 'hassan@example.com' }),
  }

  const clients = {
    techcorp: await User.findOne({ email: 'techcorp@example.com' }),
    designstudio: await User.findOne({ email: 'designstudio@example.com' }),
    ecommerce: await User.findOne({ email: 'ecommerce@example.com' }),
  }

  if (!workers.rahim || !workers.fatima || !workers.karim || !workers.nadia || !workers.hassan ||
      !clients.techcorp || !clients.designstudio || !clients.ecommerce) {
    console.error('❌ Required users not found. Run seed-data.ts first.')
    return
  }

  console.log('📋 Creating completed tasks with reviews...\n')

  // Task 1: E-commerce Website (Abdul Rahim) - COMPLETED
  const task1 = await Task.create({
    title: 'Build E-commerce Website with React and Node.js',
    description: 'Need a modern e-commerce website built with React and Node.js. Should include product catalog, shopping cart, payment integration, and admin dashboard. Must be responsive and SEO-friendly.',
    category: 'TECH_SUPPORT',
    skillsRequired: ['React', 'Node.js', 'MongoDB', 'Express.js', 'Payment Integration'],
    budget: 50000,
    currency: 'BDT',
    location: {
      address: '123 Gulshan Avenue, Dhaka',
      city: 'Dhaka',
      district: 'Dhaka',
    },
    deadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    estimatedDuration: 320,
    clientId: clients.techcorp._id,
    status: 'COMPLETED',
    assignedWorkerId: workers.rahim._id,
  })
  console.log(`  ✓ Created task: ${task1.title}`)

  // Review for Task 1
  await Review.create({
    taskId: task1._id,
    workerId: workers.rahim._id,
    clientId: clients.techcorp._id,
    rating: 5,
    comment: 'Excellent work! Abdul delivered a high-quality e-commerce website ahead of schedule. Very professional, responsive to feedback, and the code is clean and well-documented. The payment integration works flawlessly. Highly recommended!',
    skills: ['React', 'Node.js', 'MongoDB', 'Express.js', 'Payment Integration'],
    professionalism: 5,
    communication: 5,
    quality: 5,
    timeliness: 5,
    wouldHireAgain: true,
  })
  console.log(`  ✓ Created review for Abdul Rahim`)

  // Task 2: Mobile App UI/UX (Fatima Khan) - COMPLETED
  const task2 = await Task.create({
    title: 'Healthcare Mobile App UI/UX Design',
    description: 'Design a modern and user-friendly interface for a healthcare mobile app. Need complete UI kit, prototypes, and all user flow screens including patient registration, appointment booking, and telemedicine features.',
    category: 'DESIGN',
    skillsRequired: ['Figma', 'UI Design', 'UX Research', 'Prototyping', 'Mobile Design'],
    budget: 25000,
    currency: 'BDT',
    location: {
      address: '456 Dhanmondi Road, Dhaka',
      city: 'Dhaka',
      district: 'Dhaka',
    },
    deadline: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    estimatedDuration: 120,
    clientId: clients.designstudio._id,
    status: 'COMPLETED',
    assignedWorkerId: workers.fatima._id,
  })
  console.log(`  ✓ Created task: ${task2.title}`)

  // Review for Task 2
  await Review.create({
    taskId: task2._id,
    workerId: workers.fatima._id,
    clientId: clients.designstudio._id,
    rating: 5,
    comment: 'Fatima created beautiful and intuitive designs for our healthcare app. She understood our requirements perfectly and delivered exceptional UI/UX work. Great attention to detail and user experience. The prototypes were pixel-perfect!',
    skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping'],
    professionalism: 5,
    communication: 5,
    quality: 5,
    timeliness: 4,
    wouldHireAgain: true,
  })
  console.log(`  ✓ Created review for Fatima Khan`)

  // Task 3: SEO Content Writing (Karim Ahmed) - COMPLETED
  const task3 = await Task.create({
    title: 'SEO Content Writing and Blog Posts',
    description: 'Write 20 SEO-optimized blog posts for our e-commerce website. Each post should be 1000-1500 words with proper keyword research, meta descriptions, and internal linking strategy.',
    category: 'WRITING',
    skillsRequired: ['SEO', 'Content Writing', 'Copywriting', 'Keyword Research'],
    budget: 35000,
    currency: 'BDT',
    location: {
      address: '789 Banani Road, Dhaka',
      city: 'Dhaka',
      district: 'Dhaka',
    },
    deadline: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    estimatedDuration: 160,
    clientId: clients.ecommerce._id,
    status: 'COMPLETED',
    assignedWorkerId: workers.karim._id,
  })
  console.log(`  ✓ Created task: ${task3.title}`)

  // Review for Task 3
  await Review.create({
    taskId: task3._id,
    workerId: workers.karim._id,
    clientId: clients.ecommerce._id,
    rating: 4,
    comment: 'Karim delivered quality SEO content that helped increase our website traffic by 150%. Good communication and data-driven approach. The keyword research was thorough. Would work with him again.',
    skills: ['SEO', 'Content Writing', 'Keyword Research', 'Analytics'],
    professionalism: 4,
    communication: 5,
    quality: 4,
    timeliness: 4,
    wouldHireAgain: true,
  })
  console.log(`  ✓ Created review for Karim Ahmed`)

  // Task 4: React Native App (Nadia Islam) - COMPLETED
  const task4 = await Task.create({
    title: 'Food Delivery Mobile App Development',
    description: 'Build a food delivery mobile app with real-time tracking, payment integration, restaurant management, and customer reviews. Need both iOS and Android versions with Firebase backend.',
    category: 'TECH_SUPPORT',
    skillsRequired: ['React Native', 'Firebase', 'iOS Development', 'Android Development', 'Real-time Features'],
    budget: 80000,
    currency: 'BDT',
    location: {
      address: '123 Gulshan Avenue, Dhaka',
      city: 'Dhaka',
      district: 'Dhaka',
    },
    deadline: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    estimatedDuration: 480,
    clientId: clients.techcorp._id,
    status: 'COMPLETED',
    assignedWorkerId: workers.nadia._id,
  })
  console.log(`  ✓ Created task: ${task4.title}`)

  // Review for Task 4
  await Review.create({
    taskId: task4._id,
    workerId: workers.nadia._id,
    clientId: clients.techcorp._id,
    rating: 5,
    comment: 'Nadia built an amazing food delivery app! The real-time tracking works perfectly, and the app is smooth on both iOS and Android. She handled all the complex features professionally and delivered on time. Excellent developer!',
    skills: ['React Native', 'Firebase', 'iOS Development', 'Android Development'],
    professionalism: 5,
    communication: 5,
    quality: 5,
    timeliness: 5,
    wouldHireAgain: true,
  })
  console.log(`  ✓ Created review for Nadia Islam`)

  // Task 5: Data Analysis (Hassan Rahman) - COMPLETED
  const task5 = await Task.create({
    title: 'Sales Data Analysis and Predictive Modeling',
    description: 'Analyze 2 years of sales data and create automated reporting dashboards with insights and predictions using Python, Pandas, and Power BI. Include customer segmentation and sales forecasting.',
    category: 'OTHER',
    skillsRequired: ['Python', 'Data Analysis', 'SQL', 'Power BI', 'Machine Learning'],
    budget: 40000,
    currency: 'BDT',
    location: {
      address: '789 Banani Road, Dhaka',
      city: 'Dhaka',
      district: 'Dhaka',
    },
    deadline: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    estimatedDuration: 240,
    clientId: clients.ecommerce._id,
    status: 'COMPLETED',
    assignedWorkerId: workers.hassan._id,
  })
  console.log(`  ✓ Created task: ${task5.title}`)

  // Review for Task 5
  await Review.create({
    taskId: task5._id,
    workerId: workers.hassan._id,
    clientId: clients.ecommerce._id,
    rating: 5,
    comment: 'Hassan provided excellent data analysis and insights. The predictive models are accurate and the Power BI dashboards are very useful for our business decisions. Great communication and technical expertise!',
    skills: ['Python', 'Data Analysis', 'Power BI', 'Machine Learning'],
    professionalism: 5,
    communication: 4,
    quality: 5,
    timeliness: 5,
    wouldHireAgain: true,
  })
  console.log(`  ✓ Created review for Hassan Rahman`)

  console.log('\n📋 Creating open tasks...\n')

  // Open Task 1: Website Redesign
  await Task.create({
    title: 'Corporate Website Redesign with Next.js',
    description: 'Redesign our corporate website using Next.js with modern UI, CMS integration, blog section, and contact forms. Need SEO optimization and fast loading times.',
    category: 'TECH_SUPPORT',
    skillsRequired: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'SEO'],
    budget: 45000,
    currency: 'BDT',
    location: {
      address: '456 Dhanmondi Road, Dhaka',
      city: 'Dhaka',
      district: 'Dhaka',
    },
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    estimatedDuration: 200,
    clientId: clients.designstudio._id,
    status: 'OPEN',
  })
  console.log(`  ✓ Created open task: Corporate Website Redesign`)

  // Open Task 2: Logo and Branding
  await Task.create({
    title: 'Complete Brand Identity Design',
    description: 'Create a complete brand identity including logo, color palette, typography, business cards, and brand guidelines for a new tech startup. Modern and professional design required.',
    category: 'DESIGN',
    skillsRequired: ['Logo Design', 'Branding', 'Adobe Illustrator', 'Graphic Design'],
    budget: 30000,
    currency: 'BDT',
    location: {
      address: '123 Gulshan Avenue, Dhaka',
      city: 'Dhaka',
      district: 'Dhaka',
    },
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    estimatedDuration: 80,
    clientId: clients.techcorp._id,
    status: 'OPEN',
  })
  console.log(`  ✓ Created open task: Brand Identity Design`)

  // Open Task 3: Social Media Marketing
  await Task.create({
    title: 'Social Media Marketing Campaign',
    description: 'Run a 2-month social media marketing campaign on Facebook, Instagram, and LinkedIn. Create engaging content, manage ads, and provide weekly analytics reports.',
    category: 'OTHER',
    skillsRequired: ['Social Media Marketing', 'Facebook Ads', 'Content Creation', 'Analytics'],
    budget: 25000,
    currency: 'BDT',
    location: {
      address: '789 Banani Road, Dhaka',
      city: 'Dhaka',
      district: 'Dhaka',
    },
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    estimatedDuration: 160,
    clientId: clients.ecommerce._id,
    status: 'OPEN',
  })
  console.log(`  ✓ Created open task: Social Media Marketing`)

  // Open Task 4: Mobile App Development
  await Task.create({
    title: 'Fitness Tracking Mobile App',
    description: 'Build a fitness tracking mobile app with workout plans, calorie tracking, progress charts, and social features. Need both iOS and Android versions.',
    category: 'TECH_SUPPORT',
    skillsRequired: ['React Native', 'Firebase', 'Mobile Development', 'UI/UX'],
    budget: 70000,
    currency: 'BDT',
    location: {
      address: '456 Dhanmondi Road, Dhaka',
      city: 'Dhaka',
      district: 'Dhaka',
    },
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    estimatedDuration: 400,
    clientId: clients.designstudio._id,
    status: 'OPEN',
  })
  console.log(`  ✓ Created open task: Fitness Tracking App`)

  // Open Task 5: Data Visualization
  await Task.create({
    title: 'Interactive Data Visualization Dashboard',
    description: 'Create interactive data visualization dashboards for business metrics using Python and D3.js. Include real-time data updates and export functionality.',
    category: 'OTHER',
    skillsRequired: ['Python', 'Data Visualization', 'D3.js', 'Dashboard Design'],
    budget: 35000,
    currency: 'BDT',
    location: {
      address: '123 Gulshan Avenue, Dhaka',
      city: 'Dhaka',
      district: 'Dhaka',
    },
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    estimatedDuration: 180,
    clientId: clients.techcorp._id,
    status: 'OPEN',
  })
  console.log(`  ✓ Created open task: Data Visualization Dashboard`)

  console.log('\n📊 Updating worker profiles with ratings...\n')

  // Update worker profiles
  const workerProfiles = {
    rahim: await WorkerProfile.findOne({ userId: workers.rahim._id }),
    fatima: await WorkerProfile.findOne({ userId: workers.fatima._id }),
    karim: await WorkerProfile.findOne({ userId: workers.karim._id }),
    nadia: await WorkerProfile.findOne({ userId: workers.nadia._id }),
    hassan: await WorkerProfile.findOne({ userId: workers.hassan._id }),
  }

  if (workerProfiles.rahim) {
    workerProfiles.rahim.rating.average = 5.0
    workerProfiles.rahim.rating.count = 1
    workerProfiles.rahim.completedTasks = 1
    await workerProfiles.rahim.save()
    console.log(`  ✓ Updated Abdul Rahim's profile`)
  }

  if (workerProfiles.fatima) {
    workerProfiles.fatima.rating.average = 5.0
    workerProfiles.fatima.rating.count = 1
    workerProfiles.fatima.completedTasks = 1
    await workerProfiles.fatima.save()
    console.log(`  ✓ Updated Fatima Khan's profile`)
  }

  if (workerProfiles.karim) {
    workerProfiles.karim.rating.average = 4.0
    workerProfiles.karim.rating.count = 1
    workerProfiles.karim.completedTasks = 1
    await workerProfiles.karim.save()
    console.log(`  ✓ Updated Karim Ahmed's profile`)
  }

  if (workerProfiles.nadia) {
    workerProfiles.nadia.rating.average = 5.0
    workerProfiles.nadia.rating.count = 1
    workerProfiles.nadia.completedTasks = 1
    await workerProfiles.nadia.save()
    console.log(`  ✓ Updated Nadia Islam's profile`)
  }

  if (workerProfiles.hassan) {
    workerProfiles.hassan.rating.average = 5.0
    workerProfiles.hassan.rating.count = 1
    workerProfiles.hassan.completedTasks = 1
    await workerProfiles.hassan.save()
    console.log(`  ✓ Updated Hassan Rahman's profile`)
  }

  console.log('\n✅ Tasks and reviews added successfully!')
  console.log('\n📊 Summary:')
  console.log(`  - Completed tasks: 5`)
  console.log(`  - Open tasks: 5`)
  console.log(`  - Reviews: 5`)
  console.log(`  - Workers with ratings: 5`)
}

async function main() {
  try {
    await connectDB()
    await addTasksAndReviews()
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.connection.close()
    console.log('\n👋 Database connection closed')
    process.exit(0)
  }
}

main()


