import mongoose, { Schema, Model, Types } from 'mongoose'

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface ITicketMessage {
  senderId: Types.ObjectId
  senderRole: 'ADMIN' | 'CLIENT' | 'WORKER'
  message: string
  createdAt: Date
}

export interface ISupportTicket {
  userId: Types.ObjectId
  userRole: 'CLIENT' | 'WORKER'
  subject: string
  category: 'TECHNICAL' | 'PAYMENT' | 'DISPUTE' | 'GENERAL' | 'OTHER'
  priority: TicketPriority
  status: TicketStatus
  messages: ITicketMessage[]
  relatedTaskId?: Types.ObjectId
  assignedAdminId?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
  lastMessageAt: Date
}

type SupportTicketModel = Model<ISupportTicket>

const ticketMessageSchema = new Schema<ITicketMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['ADMIN', 'CLIENT', 'WORKER'],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
)

const supportTicketSchema = new Schema<ISupportTicket, SupportTicketModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userRole: {
      type: String,
      enum: ['CLIENT', 'WORKER'],
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      enum: ['TECHNICAL', 'PAYMENT', 'DISPUTE', 'GENERAL', 'OTHER'],
      default: 'GENERAL',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
    },
    messages: {
      type: [ticketMessageSchema],
      default: [],
    },
    relatedTaskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
    },
    assignedAdminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient queries
supportTicketSchema.index({ userId: 1, status: 1 })
supportTicketSchema.index({ status: 1, priority: -1, lastMessageAt: -1 })
supportTicketSchema.index({ assignedAdminId: 1, status: 1 })
supportTicketSchema.index({ category: 1, status: 1 })

// Prevent model recompilation in development
const SupportTicket =
  (mongoose.models.SupportTicket as SupportTicketModel) ||
  mongoose.model<ISupportTicket, SupportTicketModel>('SupportTicket', supportTicketSchema)

export default SupportTicket

