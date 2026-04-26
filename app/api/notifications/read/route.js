import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Notification from '@/models/Notification'
import User from '@/models/User'

export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) return Response.json({ success: false })

    await connectDB()
    const user = await User.findOne({ clerkId: userId })
    if (!user) return Response.json({ success: false })

    await Notification.updateMany(
      { recipient: user._id, read: false },
      { read: true }
    )

    return Response.json({ success: true })
  } catch (err) {
    console.error(err)
    return Response.json({ success: false })
  }
}