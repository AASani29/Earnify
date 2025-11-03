import mongoose, { Schema, Document, Model } from 'mongoose'

export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'

export interface ITaskApplication extends Document {
  _id: mongoose.Types.ObjectId
  taskId: mongoose.Types.ObjectId
  workerId: mongoose.Types.ObjectId
  coverLetter: string
  proposedBudget?: number
  estimatedCompletionTime?: number // in hours
  status: ApplicationStatus
  appliedAt: Date
  respondedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const taskApplicationSchema = new Schema<ITaskApplication>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task ID is required'],
    },
    workerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Worker ID is required'],
    },
    coverLetter: {
      type: String,
      required: [true, 'Cover letter is required'],
      trim: true,
      minlength: [20, 'Cover letter must be at least 20 characters'],
      maxlength: [1000, 'Cover letter cannot exceed 1000 characters'],
    },
    proposedBudget: {
      type: Number,
      min: [0, 'Proposed budget must be positive'],
    },
    estimatedCompletionTime: {
      type: Number,
      min: [0, 'Estimated time must be positive'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'],
      default: 'PENDING',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for better query performance
taskApplicationSchema.index({ taskId: 1, status: 1 })
taskApplicationSchema.index({ workerId: 1, status: 1 })
taskApplicationSchema.index({ taskId: 1, workerId: 1 }, { unique: true }) // Prevent duplicate applications

const TaskApplicationModel: Model<ITaskApplication> = 
  mongoose.models.TaskApplication || mongoose.model<ITaskApplication>('TaskApplication', taskApplicationSchema)

export default TaskApplicationModel

