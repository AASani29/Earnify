import mongoose, { Schema, Model, Types } from 'mongoose'

export interface IReview {
  taskId: Types.ObjectId
  workerId: Types.ObjectId
  clientId: Types.ObjectId
  rating: number // 1-5
  comment?: string
  skills?: string[] // Skills demonstrated in this task
  professionalism?: number // 1-5
  communication?: number // 1-5
  quality?: number // 1-5
  timeliness?: number // 1-5
  wouldHireAgain?: boolean
  createdAt: Date
  updatedAt: Date
}

type ReviewModel = Model<IReview>

const reviewSchema = new Schema<IReview, ReviewModel>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    workerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 1000,
    },
    skills: {
      type: [String],
      default: [],
    },
    professionalism: {
      type: Number,
      min: 1,
      max: 5,
    },
    communication: {
      type: Number,
      min: 1,
      max: 5,
    },
    quality: {
      type: Number,
      min: 1,
      max: 5,
    },
    timeliness: {
      type: Number,
      min: 1,
      max: 5,
    },
    wouldHireAgain: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Index for efficient queries
reviewSchema.index({ workerId: 1, createdAt: -1 })
reviewSchema.index({ clientId: 1, createdAt: -1 })
reviewSchema.index({ taskId: 1 })

// Prevent duplicate reviews for the same task-worker combination
reviewSchema.index({ taskId: 1, workerId: 1 }, { unique: true })

// Prevent model recompilation in development
const Review =
  (mongoose.models.Review as ReviewModel) ||
  mongoose.model<IReview, ReviewModel>('Review', reviewSchema)

export default Review

