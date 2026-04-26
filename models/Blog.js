import mongoose from 'mongoose'

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  coverImage: { type: String, default: '' },
  tags: [String],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', required: true
  },
  clerkId: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  readTime: { type: Number, default: 5 },
  isPublished: { type: Boolean, default: true },
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true })

export default mongoose.models.Blog || mongoose.model('Blog', BlogSchema)