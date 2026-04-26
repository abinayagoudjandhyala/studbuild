import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Question from '@/models/Question'

export async function GET(req, { params }) {
  try {
    const { id } = await params
    await connectDB()
    const question = await Question.findByIdAndUpdate(
      id, { $inc: { views: 1 } }, { new: true }
    )
      .populate('author', 'firstName lastName avatar clerkId university')
      .populate('answers.author', 'firstName lastName avatar clerkId')
    if (!question) return Response.json({ error: 'Not found' }, { status: 404 })
    return Response.json({ question })
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
    const question = await Question.findById(id)
    if (!question) return Response.json({ error: 'Not found' }, { status: 404 })
    if (question.clerkId !== userId) return Response.json({ error: 'Not your question' }, { status: 403 })

    await Question.findByIdAndDelete(id)
    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}