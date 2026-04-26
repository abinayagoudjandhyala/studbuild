import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
  type: String,
  sparse: true,
},
username: {
  type: String,
  sparse: true,
},
  firstName: String,
  lastName: String,
  avatar: String,
  bio: String,
  university: String,
  graduationYear: String,
  skills: [String],

  // social links
  github: String,
  linkedin: String,
  leetcode: String,
  portfolio: String,
  wakatime: String,

  // app data
  isOnboarded: {
    type: Boolean,
    default: false,
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  badges: [{
    id: String,
    earnedAt: Date,
  }],
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student',
  },
}, {
  timestamps: true
})

export default mongoose.models.User || mongoose.model('User', UserSchema)