import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Message from '@/models/Message'
import Conversation from '@/models/Conversation'
import User from '@/models/User'

export async function GET(req, { params }) {
  try {
    const { id } = await params
    const { userId } = await auth()
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()

    const currentUser = await User.findOne({ clerkId: userId })

    const messages = await Message.find({ conversation: id })
      .populate('sender', 'firstName lastName avatar clerkId')
      .sort({ createdAt: 1 })

    await Message.updateMany(
      {
        conversation: id,
        sender: { $ne: currentUser._id },
        read: false,
      },
      { read: true }
    )

    return Response.json({ messages })
  } catch (err) {
    console.error(err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req, { params }) {
  try {
    const { id } = await params
    const { userId } = await auth()
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { content } = await req.json()
    await connectDB()

    const currentUser = await User.findOne({ clerkId: userId })
    if (!currentUser) return Response.json({ error: 'User not found' }, { status: 404 })

    const message = await Message.create({
      conversation: id,
      sender: currentUser._id,
      content,
    })

    await Conversation.findByIdAndUpdate(id, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
    })

    const populated = await message.populate('sender', 'firstName lastName avatar')
    return Response.json({ message: populated })
  } catch (err) {
    console.error(err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}