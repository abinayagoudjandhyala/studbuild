import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Question from '@/models/Question'
import User from '@/models/User'

export async function POST(req, { params }) {
  try {
    const { id } = await params
    const { userId } = await auth()
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { content } = await req.json()
    await connectDB()

    const user = await User.findOne({ clerkId: userId })
    const question = await Question.findById(id)
    if (!user || !question) return Response.json({ error: 'Not found' }, { status: 404 })

    question.answers.push({ author: user._id, content })
    await question.save()

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

    const { answerId, content } = await req.json()
    await connectDB()

    const user = await User.findOne({ clerkId: userId })
    const question = await Question.findById(id)
    if (!user || !question) return Response.json({ error: 'Not found' }, { status: 404 })

    const answer = question.answers.id(answerId)
    if (!answer) return Response.json({ error: 'Answer not found' }, { status: 404 })
    if (answer.author.toString() !== user._id.toString()) return Response.json({ error: 'Not your answer' }, { status: 403 })

    answer.content = content
    await question.save()

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

    const { answerId } = await req.json()
    await connectDB()

    const user = await User.findOne({ clerkId: userId })
    const question = await Question.findById(id)
    if (!user || !question) return Response.json({ error: 'Not found' }, { status: 404 })

    const answer = question.answers.id(answerId)
    if (!answer) return Response.json({ error: 'Answer not found' }, { status: 404 })
    if (answer.author.toString() !== user._id.toString()) return Response.json({ error: 'Not your answer' }, { status: 403 })

    answer.deleteOne()
    await question.save()

    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}