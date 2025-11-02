import connectDB from './db'
import UserModel from './models/User'
import { User, RegisterData } from './types'

export const findUserByEmail = async (email: string): Promise<User | null> => {
  await connectDB()
  const user = await UserModel.findOne({ email }).lean()

  if (!user) return null

  return {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    phoneNumber: user.phoneNumber,
    profileCompleted: user.profileCompleted,
    isVerified: user.isVerified,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}

export const findUserById = async (id: string): Promise<User | null> => {
  await connectDB()
  const user = await UserModel.findById(id).lean()

  if (!user) return null

  return {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    phoneNumber: user.phoneNumber,
    profileCompleted: user.profileCompleted,
    isVerified: user.isVerified,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}

export const verifyPassword = async (email: string, password: string): Promise<boolean> => {
  await connectDB()
  const user = await UserModel.findOne({ email })

  if (!user) {
    console.log('verifyPassword: User not found')
    return false
  }

  console.log('verifyPassword: User found, comparing password...')
  const isValid = await user.comparePassword(password)
  console.log('verifyPassword: Password valid?', isValid)
  return isValid
}

export const createUser = async (data: RegisterData): Promise<User> => {
  await connectDB()

  // Check if user already exists
  const existingUser = await UserModel.findOne({ email: data.email })
  if (existingUser) {
    throw new Error('User already exists')
  }

  // Create new user
  const newUser = await UserModel.create({
    email: data.email,
    password: data.password, // Will be hashed by pre-save hook
    firstName: data.firstName,
    lastName: data.lastName,
    role: data.role,
    phoneNumber: data.phoneNumber,
    profileCompleted: false,
    isVerified: false,
  })

  return {
    id: newUser._id.toString(),
    email: newUser.email,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    role: newUser.role,
    phoneNumber: newUser.phoneNumber,
    profileCompleted: newUser.profileCompleted,
    isVerified: newUser.isVerified,
    createdAt: newUser.createdAt.toISOString(),
    updatedAt: newUser.updatedAt.toISOString(),
  }
}

// Seed initial users (run once)
export const seedUsers = async () => {
  await connectDB()

  const adminExists = await UserModel.findOne({ email: 'admin@example.com' })
  if (!adminExists) {
    await UserModel.create({
      email: 'admin@example.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      profileCompleted: true,
      isVerified: true,
    })
  }

  const clientExists = await UserModel.findOne({ email: 'client@example.com' })
  if (!clientExists) {
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
  }

  const workerExists = await UserModel.findOne({ email: 'worker@example.com' })
  if (!workerExists) {
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
  }
}

