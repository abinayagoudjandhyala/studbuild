import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import User from '@/models/User'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')

    if (!q || q.trim() === '') {
      return Response.json({ projects: [], users: [] })
    }

    await connectDB()

    const regex = new RegExp(q, 'i')

    const [projects, users] = await Promise.all([
      Project.find({
        $or: [
          { title: regex },
          { description: regex },
          { tags: regex },
        ],
        isPublished: true,
      })
        .populate('author', 'firstName lastName avatar university username clerkId')
        .sort({ createdAt: -1 })
        .limit(12),

      User.find({
        $or: [
          { firstName: regex },
          { lastName: regex },
          { university: regex },
          { skills: regex },
          { github: regex },
        ],
        isOnboarded: true,
      })
        .select('firstName lastName avatar university skills clerkId username')
        .limit(8),
    ])

    return Response.json({ projects, users })
  } catch (err) {
    console.error(err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}