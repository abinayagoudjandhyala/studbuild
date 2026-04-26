import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Message from '@/models/Message'
import Conversation from '@/models/Conversation'
import User from '@/models/User'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return Response.json({ count: 0 })

    await connectDB()
    const currentUser = await User.findOne({ clerkId: userId })
    if (!currentUser) return Response.json({ count: 0 })

    const conversations = await Conversation.find({
      participants: currentUser._id
    })

    const convIds = conversations.map(c => c._id)

    const unreadCount = await Message.countDocuments({
      conversation: { $in: convIds },
      sender: { $ne: currentUser._id },
      read: false,
    })

    return Response.json({ count: unreadCount })
  } catch (err) {
    console.error(err)
    return Response.json({ count: 0 })
  }
}