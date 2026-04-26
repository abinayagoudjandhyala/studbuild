import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Project from '@/models/Project'

export async function GET(req, { params }) {
  try {
    const { username } = await params
    await connectDB()

    const user = await User.findOne({
      $or: [{ username }, { clerkId: username }]
    })

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const projects = await Project.find({
      author: user._id,
      isPublished: true
    }).sort({ createdAt: -1 })

    return Response.json({ user, projects })
  } catch (err) {
    console.error(err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}