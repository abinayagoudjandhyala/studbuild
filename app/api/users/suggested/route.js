import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function GET() {
  try {
    const { userId } = await auth()
    await connectDB()

    const currentUser = userId
      ? await User.findOne({ clerkId: userId })
      : null

    const query = currentUser
      ? { _id: { $ne: currentUser._id }, isOnboarded: true }
      : { isOnboarded: true }

    const users = await User.find(query)
      .select('firstName lastName avatar university skills clerkId')
      .limit(6)

    return Response.json({ users })
  } catch (err) {
    console.error(err)
    return Response.json({ users: [] })
  }
}