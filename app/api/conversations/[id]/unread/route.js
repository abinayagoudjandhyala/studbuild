import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Message from '@/models/Message'
import User from '@/models/User'

export async function GET(req, { params }) {
  try {
    const { id } = await params
    const { userId } = await auth()
    if (!userId) return Response.json({ count: 0 })

    await connectDB()
    const currentUser = await User.findOne({ clerkId: userId })
    if (!currentUser) return Response.json({ count: 0 })

    const count = await Message.countDocuments({
      conversation: id,
      sender: { $ne: currentUser._id },
      read: false,
    })

    return Response.json({ count })
  } catch (err) {
    console.error(err)
    return Response.json({ count: 0 })
  }
}