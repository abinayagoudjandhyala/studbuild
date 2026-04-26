import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'

export async function GET(req, { params }) {
  try {
    const { id } = await params
    await connectDB()
    const project = await Project.findById(id)
      .populate('author', 'firstName lastName avatar university bio skills username clerkId')
    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 })
    }
    return Response.json({ project })
  } catch (err) {
    console.error(err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const project = await Project.findById(id)

    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.clerkId !== userId) {
      return Response.json({ error: 'Not your project' }, { status: 403 })
    }

    await Project.findByIdAndDelete(id)
    return Response.json({ success: true })
  } catch (err) {
    console.error(err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
export async function PUT(req, { params }) {
  try {
    const { id } = await params
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    await connectDB()

    const project = await Project.findById(id)
    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.clerkId !== userId) {
      return Response.json({ error: 'Not your project' }, { status: 403 })
    }

    const updated = await Project.findByIdAndUpdate(
      id,
      {
        title: body.title,
        description: body.description,
        coverImage: body.coverImage,
        tags: body.tags,
        githubUrl: body.githubUrl,
        liveUrl: body.liveUrl,
      },
      { new: true }
    )

    return Response.json({ success: true, project: updated })
  } catch (err) {
    console.error(err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}