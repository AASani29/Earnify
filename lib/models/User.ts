import mongoose, { Schema, Model } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'CLIENT' | 'WORKER'
  phoneNumber?: string
  profileCompleted: boolean
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>
}

type UserModel = Model<IUser, {}, IUserMethods>

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'CLIENT', 'WORKER'],
      required: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }

  try {
    // Using 8 rounds for faster hashing (still secure, better for development)
    const salt = await bcrypt.genSalt(8)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    console.error('Password hashing error:', error)
    next(error)
  }
})

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Prevent model recompilation in development
const User = (mongoose.models.User as UserModel) || mongoose.model<IUser, UserModel>('User', userSchema)

export default User

