/**
 * Migration script to add new workflow fields to existing tasks
 * Run this with: npx ts-node scripts/migrate-tasks.ts
 */

import mongoose from 'mongoose'
import TaskModel from '../lib/models/Task'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function migrateTasks() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables')
    }

    console.log('Connecting to MongoDB...')
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB')

    // Find all tasks that don't have the new fields
    const tasks = await TaskModel.find({})
    console.log(`Found ${tasks.length} tasks to check`)

    let updatedCount = 0

    for (const task of tasks) {
      let needsUpdate = false

      // Add deliveryStatus if missing
      if (!task.deliveryStatus) {
        task.deliveryStatus = 'NOT_DELIVERED'
        needsUpdate = true
      }

      // Add paymentStatus if missing
      if (!task.paymentStatus) {
        task.paymentStatus = 'NOT_PAID'
        needsUpdate = true
      }

      if (needsUpdate) {
        await task.save()
        updatedCount++
        console.log(`Updated task: ${task.title} (${task._id})`)
      }
    }

    console.log(`\nMigration complete!`)
    console.log(`Total tasks: ${tasks.length}`)
    console.log(`Updated tasks: ${updatedCount}`)
    console.log(`Skipped tasks: ${tasks.length - updatedCount}`)

    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

migrateTasks()

