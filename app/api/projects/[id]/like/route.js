import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import User from '@/models/User'
import { createNotification } from '@/lib/createNotification'
export async function POST(req, { params }) {
  try {
    const { id } = await params
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const user = await User.findOne({ clerkId: userId })
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const project = await Project.findById(id)
    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 })
    }

    const alreadyLiked = project.likes.includes(user._id)

    if (alreadyLiked) {
      project.likes = project.likes.filter(
        id => id.toString() !== user._id.toString()
      )
    } else {
      project.likes.push(user._id)
    }

    await project.save()
    if (!alreadyLiked) {
  await createNotification({
    recipient: project.author,
    sender: user._id,
    type: 'like',
    message: user.firstName + ' liked your project ' + project.title,
    link: '/projects/' + id,
  })
}

    return Response.json({
      success: true,
      liked: !alreadyLiked,
      likeCount: project.likes.length
    })
  } catch (err) {
    console.error(err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}