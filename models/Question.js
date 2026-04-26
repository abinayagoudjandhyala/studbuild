import mongoose from 'mongoose'

const AnswerSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, required: true },
  votes: { type: Number, default: 0 },
  isAccepted: { type: Boolean, default: false },
  voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true })

const QuestionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  tags: [String],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clerkId: { type: String, required: true },
  votes: { type: Number, default: 0 },
  voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  answers: [AnswerSchema],
  views: { type: Number, default: 0 },
  isSolved: { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.models.Question || mongoose.model('Question', QuestionSchema)