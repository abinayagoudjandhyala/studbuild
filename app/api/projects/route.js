import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import User from '@/models/User'

export async function POST(req) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    await connectDB()

    const user = await User.findOne({ clerkId: userId })
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const project = await Project.create({
      title: body.title,
      description: body.description,
      coverImage: body.coverImage,
      tags: body.tags,
      githubUrl: body.githubUrl,
      liveUrl: body.liveUrl,
      author: user._id,
      clerkId: userId,
    })

    return Response.json({ success: true, project })
  } catch (err) {
    console.error('Project create error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const tag = searchParams.get('tag')
    const sort = searchParams.get('sort') || 'Newest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    const query = tag && tag !== 'All' ? { tags: tag, isPublished: true } : { isPublished: true }

    let sortOption = { createdAt: -1 }
    if (sort === 'Most Liked') sortOption = { likesCount: -1 }
    if (sort === 'Most Viewed') sortOption = { views: -1 }
    if (sort === 'Trending') sortOption = { createdAt: -1 }

    const projects = await Project.find(query)
  .populate('author', 'firstName lastName avatar university username clerkId')
  .sort({ isFeatured: -1, createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit)

    const total = await Project.countDocuments(query)

    return Response.json({ projects, total, page })
  } catch (err) {
    console.error('Projects fetch error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}