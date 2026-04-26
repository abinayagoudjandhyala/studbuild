import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Blog from '@/models/Blog'
import User from '@/models/User'

export async function POST(req, { params }) {
  try {
    const { id } = await params
    const { userId } = await auth()
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const user = await User.findOne({ clerkId: userId })
    const blog = await Blog.findById(id)

    if (!user || !blog) return Response.json({ error: 'Not found' }, { status: 404 })

    const liked = blog.likes.includes(user._id)
    if (liked) {
      blog.likes = blog.likes.filter(l => l.toString() !== user._id.toString())
    } else {
      blog.likes.push(user._id)
    }

    await blog.save()
    return Response.json({ success: true, liked: !liked, likeCount: blog.likes.length })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}