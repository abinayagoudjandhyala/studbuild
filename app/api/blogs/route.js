import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Blog from '@/models/Blog'
import User from '@/models/User'

export async function GET() {
  try {
    await connectDB()
    const blogs = await Blog.find({ isPublished: true })
      .populate('author', 'firstName lastName avatar university clerkId')
      .sort({ createdAt: -1 })
      .limit(20)
    return Response.json({ blogs })
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

    const wordCount = body.content?.split(' ').length || 0
    const readTime = Math.max(1, Math.ceil(wordCount / 200))

    const blog = await Blog.create({
      title: body.title,
      content: body.content,
      excerpt: body.content?.slice(0, 200),
      coverImage: body.coverImage || '',
      tags: body.tags || [],
      author: user._id,
      clerkId: userId,
      readTime,
    })

    return Response.json({ success: true, blog })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}