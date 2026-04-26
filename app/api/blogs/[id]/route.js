import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Blog from '@/models/Blog'

export async function GET(req, { params }) {
  try {
    const { id } = await params
    await connectDB()
    const blog = await Blog.findByIdAndUpdate(
      id, { $inc: { views: 1 } }, { new: true }
    )
      .populate('author', 'firstName lastName avatar university bio clerkId')
      .populate('comments.author', 'firstName lastName avatar clerkId')
    if (!blog) return Response.json({ error: 'Blog not found' }, { status: 404 })
    return Response.json({ blog })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params
    const { userId } = await auth()
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    await connectDB()

    const blog = await Blog.findById(id)
    if (!blog) return Response.json({ error: 'Not found' }, { status: 404 })
    if (blog.clerkId !== userId) return Response.json({ error: 'Not your blog' }, { status: 403 })

    const wordCount = body.content?.split(' ').length || 0
    const readTime = Math.max(1, Math.ceil(wordCount / 200))

    blog.title = body.title
    blog.content = body.content
    blog.excerpt = body.content?.slice(0, 200)
    blog.tags = body.tags || []
    blog.coverImage = body.coverImage || blog.coverImage
    blog.readTime = readTime
    await blog.save()

    return Response.json({ success: true, blog })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params
    const { userId } = await auth()
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const blog = await Blog.findById(id)
    if (!blog) return Response.json({ error: 'Not found' }, { status: 404 })
    if (blog.clerkId !== userId) return Response.json({ error: 'Not your blog' }, { status: 403 })

    await Blog.findByIdAndDelete(id)
    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}