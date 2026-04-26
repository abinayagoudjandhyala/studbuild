import mongoose from 'mongoose'

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['like', 'comment', 'follow', 'message', 'answer', 'blog_like'],
    required: true
  },
  message: { type: String, required: true },
  link: { type: String },
  read: { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema)