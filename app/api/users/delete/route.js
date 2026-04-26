import { auth, clerkClient } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Project from '@/models/Project'
import Blog from '@/models/Blog'
import Question from '@/models/Question'
import Message from '@/models/Message'
import Conversation from '@/models/Conversation'

export async function DELETE() {
  try {
    const { userId } = await auth()
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()

    const user = await User.findOne({ clerkId: userId })
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 })

    await Project.deleteMany({ clerkId: userId })
    await Blog.deleteMany({ clerkId: userId })
    await Question.deleteMany({ clerkId: userId })
    await Message.deleteMany({ sender: user._id })
    await User.findByIdAndDelete(user._id)

    const client = await clerkClient()
    await client.users.deleteUser(userId)

    return Response.json({ success: true })
  } catch (err) {
    console.error('Delete account error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}