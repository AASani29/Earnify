import mongoose, { Schema, Model, Types } from 'mongoose'

export interface IClientProfile {
  userId: Types.ObjectId
  companyName?: string
  companyDescription?: string
  industry?: string
  website?: string
  location?: {
    city?: string
    area?: string
    address?: string
  }
  verificationDocuments?: {
    type: 'TRADE_LICENSE' | 'NID' | 'OTHER'
    url: string
    verified: boolean
  }[]
  rating: {
    average: number
    count: number
  }
  totalTasksPosted: number
  totalTasksCompleted: number
  createdAt: Date
  updatedAt: Date
}

type ClientProfileModel = Model<IClientProfile>

const clientProfileSchema = new Schema<IClientProfile, ClientProfileModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    companyDescription: {
      type: String,
      maxlength: 1000,
    },
    industry: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    location: {
      city: String,
      area: String,
      address: String,
    },
    verificationDocuments: [
      {
        type: {
          type: String,
          enum: ['TRADE_LICENSE', 'NID', 'OTHER'],
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
    totalTasksPosted: {
      type: Number,
      default: 0,
    },
    totalTasksCompleted: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Prevent model recompilation in development
const ClientProfile =
  (mongoose.models.ClientProfile as ClientProfileModel) ||
  mongoose.model<IClientProfile, ClientProfileModel>('ClientProfile', clientProfileSchema)

export default ClientProfile

