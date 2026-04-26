import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Notification from '@/models/Notification'
import User from '@/models/User'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return Response.json({ notifications: [] })

    await connectDB()
    const user = await User.findOne({ clerkId: userId })
    if (!user) return Response.json({ notifications: [] })

    const notifications = await Notification.find({ recipient: user._id })
      .populate('sender', 'firstName lastName avatar clerkId')
      .sort({ createdAt: -1 })
      .limit(30)

    const unreadCount = await Notification.countDocuments({
      recipient: user._id, read: false
    })

    return Response.json({ notifications, unreadCount })
  } catch (err) {
    console.error(err)
    return Response.json({ notifications: [], unreadCount: 0 })
  }
}