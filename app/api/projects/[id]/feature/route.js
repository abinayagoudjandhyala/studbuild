import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'

export async function POST(req, { params }) {
  try {
    const { id } = await params
    const { userId } = await auth()
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const project = await Project.findById(id)

    if (!project) return Response.json({ error: 'Not found' }, { status: 404 })
    if (project.clerkId !== userId) return Response.json({ error: 'Not your project' }, { status: 403 })

    await Project.updateMany({ clerkId: userId }, { isFeatured: false })
    project.isFeatured = !project.isFeatured
    await project.save()

    return Response.json({ success: true, isFeatured: project.isFeatured })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}