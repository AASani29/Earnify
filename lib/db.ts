import mongoose from 'mongoose'

function getMongoDBURI() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/next-jwt-auth'
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable')
  }
  return uri
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) {
    console.log('Using cached MongoDB connection to:', (cached.conn as any).connection.db.databaseName)
    return cached.conn
  }

  if (!cached.promise) {
    const MONGODB_URI = getMongoDBURI()
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000, // 45 second socket timeout
    }

    console.log('Connecting to MongoDB:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'))
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully to database:', (mongoose as any).connection.db.databaseName)
      return mongoose
    }) as any
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    console.error('❌ MongoDB connection error:', e)
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectDB

