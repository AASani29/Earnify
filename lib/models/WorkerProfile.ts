import mongoose, { Schema, Model, Types } from 'mongoose'

export interface IWorkerProfile {
  userId: Types.ObjectId
  bio?: string
  skills: string[]
  experience?: string
  hourlyRate?: number
  location?: {
    city?: string
    area?: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  availability: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE'
  documents?: {
    type: 'NID' | 'CERTIFICATE' | 'OTHER'
    url: string
    verified: boolean
  }[]
  rating: {
    average: number
    count: number
  }
  completedTasks: number
  createdAt: Date
  updatedAt: Date
}

type WorkerProfileModel = Model<IWorkerProfile>

const workerProfileSchema = new Schema<IWorkerProfile, WorkerProfileModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: String,
      maxlength: 1000,
    },
    hourlyRate: {
      type: Number,
      min: 0,
    },
    location: {
      city: String,
      area: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    availability: {
      type: String,
      enum: ['AVAILABLE', 'BUSY', 'UNAVAILABLE'],
      default: 'AVAILABLE',
    },
    documents: [
      {
        type: {
          type: String,
          enum: ['NID', 'CERTIFICATE', 'OTHER'],
        },
        url: String,
        verified: {
          type: Boolean,
          default: false,
        },
      },
    ],
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    completedTasks: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Prevent model recompilation in development
const WorkerProfile =
  (mongoose.models.WorkerProfile as WorkerProfileModel) ||
  mongoose.model<IWorkerProfile, WorkerProfileModel>('WorkerProfile', workerProfileSchema)

export default WorkerProfile

