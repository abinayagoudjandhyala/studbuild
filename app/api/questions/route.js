import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Question from '@/models/Question'
import User from '@/models/User'

export async function GET() {
  try {
    await connectDB()
    const questions = await Question.find()
      .populate('author', 'firstName lastName avatar clerkId university')
      .sort({ createdAt: -1 })
      .limit(20)
    return Response.json({ questions })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth()
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    await connectDB()

    const user = await User.findOne({ clerkId: userId })
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 })

    const question = await Question.create({
      title: body.title,
      body: body.body,
      tags: body.tags || [],
      author: user._id,
      clerkId: userId,
    })

    return Response.json({ success: true, question })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}