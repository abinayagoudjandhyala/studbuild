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

    if (!user) return Response.json({ projects: [] })

    const projects = await Project.find({
      author: user._id,
      isPublished: true
    }).sort({ createdAt: -1 })

    return Response.json({ projects })
  } catch (err) {
    console.error(err)
    return Response.json({ projects: [] })
  }
}