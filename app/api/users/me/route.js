import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ user: null }, { status: 401 })
    }

    await connectDB()
    const user = await User.findOne({ clerkId: userId })
    return Response.json({ user })
  } catch (err) {
    console.error(err)
    return Response.json({ user: null }, { status: 500 })
  }
}