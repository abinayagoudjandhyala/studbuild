import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Conversation from '@/models/Conversation'
import User from '@/models/User'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const currentUser = await User.findOne({ clerkId: userId })
    if (!currentUser) return Response.json({ error: 'User not found' }, { status: 404 })

    const conversations = await Conversation.find({
      participants: currentUser._id
    })
      .populate('participants', 'firstName lastName avatar clerkId username')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 })

    return Response.json({ conversations })
  } catch (err) {
    console.error(err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth()
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { targetClerkId } = await req.json()
    await connectDB()

    const currentUser = await User.findOne({ clerkId: userId })
    const targetUser = await User.findOne({ clerkId: targetClerkId })

    if (!currentUser || !targetUser) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [currentUser._id, targetUser._id] }
    })

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUser._id, targetUser._id],
      })
    }

    return Response.json({ conversation })
  } catch (err) {
    console.error(err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}