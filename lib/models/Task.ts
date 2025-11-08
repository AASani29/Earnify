import mongoose, { Schema, Document, Model } from 'mongoose'

export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type TaskCategory = 
  | 'DELIVERY' 
  | 'CLEANING' 
  | 'TECH_SUPPORT' 
  | 'HANDYMAN' 
  | 'TUTORING' 
  | 'PHOTOGRAPHY' 
  | 'WRITING' 
  | 'DESIGN' 
  | 'OTHER'

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId
  title: string
  description: string
  category: TaskCategory
  budget: number
  currency: string
  location: {
    address: string
    city: string
    district: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  deadline?: Date
  status: TaskStatus
  clientId: mongoose.Types.ObjectId
  assignedWorkerId?: mongoose.Types.ObjectId
  skillsRequired: string[]
  estimatedDuration?: number // in hours
  images?: string[]
  // New workflow fields
  deliveryStatus?: 'NOT_DELIVERED' | 'DELIVERED' | 'RECEIVED'
  deliveryMessage?: string
  deliveredAt?: Date
  timeExtensionRequest?: {
    requestedBy: mongoose.Types.ObjectId
    requestMessage: string
    requestedAt: Date
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    responseMessage?: string
    respondedAt?: Date
    newDeadline?: Date
  }
  paymentStatus?: 'NOT_PAID' | 'PAID'
  paidAt?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Task category is required'],
      enum: {
        values: ['DELIVERY', 'CLEANING', 'TECH_SUPPORT', 'HANDYMAN', 'TUTORING', 'PHOTOGRAPHY', 'WRITING', 'DESIGN', 'OTHER'],
        message: '{VALUE} is not a valid category',
      },
    },
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
      min: [0, 'Budget must be a positive number'],
    },
    currency: {
      type: String,
      default: 'BDT',
      enum: ['BDT', 'USD'],
    },
    location: {
      address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
      district: {
        type: String,
        required: [true, 'District is required'],
        trim: true,
      },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    deadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'OPEN',
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client ID is required'],
    },
    assignedWorkerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    skillsRequired: {
      type: [String],
      default: [],
    },
    estimatedDuration: {
      type: Number,
      min: [0, 'Duration must be positive'],
    },
    images: {
      type: [String],
      default: [],
    },
    deliveryStatus: {
      type: String,
      enum: ['NOT_DELIVERED', 'DELIVERED', 'RECEIVED'],
      default: 'NOT_DELIVERED',
    },
    deliveryMessage: {
      type: String,
      trim: true,
    },
    deliveredAt: {
      type: Date,
    },
    timeExtensionRequest: {
      requestedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      requestMessage: {
        type: String,
        trim: true,
      },
      requestedAt: {
        type: Date,
      },
      status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
      },
      responseMessage: {
        type: String,
        trim: true,
      },
      respondedAt: {
        type: Date,
      },
      newDeadline: {
        type: Date,
      },
    },
    paymentStatus: {
      type: String,
      enum: ['NOT_PAID', 'PAID'],
      default: 'NOT_PAID',
    },
    paidAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for better query performance
taskSchema.index({ clientId: 1, status: 1 })
taskSchema.index({ assignedWorkerId: 1, status: 1 })
taskSchema.index({ status: 1, createdAt: -1 })
taskSchema.index({ category: 1, status: 1 })
taskSchema.index({ 'location.city': 1, status: 1 })
taskSchema.index({ 'location.district': 1, status: 1 })

const TaskModel: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', taskSchema)

export default TaskModel

