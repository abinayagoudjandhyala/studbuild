import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Blog from '@/models/Blog'
import User from '@/models/User'

export async function POST(req, { params }) {
  try {
    const { id } = await params
    const { userId } = await auth()
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { content } = await req.json()
    await connectDB()

    const user = await User.findOne({ clerkId: userId })
    const blog = await Blog.findById(id)
    if (!user || !blog) return Response.json({ error: 'Not found' }, { status: 404 })

    blog.comments.push({ author: user._id, content })
    await blog.save()

    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params
    const { userId } = await auth()
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { commentId } = await req.json()
    await connectDB()

    const user = await User.findOne({ clerkId: userId })
    const blog = await Blog.findById(id)
    if (!user || !blog) return Response.json({ error: 'Not found' }, { status: 404 })

    const comment = blog.comments.id(commentId)
    if (!comment) return Response.json({ error: 'Comment not found' }, { status: 404 })

    if (comment.author.toString() !== user._id.toString()) {
      return Response.json({ error: 'Not your comment' }, { status: 403 })
    }

    comment.deleteOne()
    await blog.save()

    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params
    const { userId } = await auth()
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { commentId, content } = await req.json()
    await connectDB()

    const user = await User.findOne({ clerkId: userId })
    const blog = await Blog.findById(id)
    if (!user || !blog) return Response.json({ error: 'Not found' }, { status: 404 })

    const comment = blog.comments.id(commentId)
    if (!comment) return Response.json({ error: 'Comment not found' }, { status: 404 })

    if (comment.author.toString() !== user._id.toString()) {
      return Response.json({ error: 'Not your comment' }, { status: 403 })
    }

    comment.content = content
    await blog.save()

    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}