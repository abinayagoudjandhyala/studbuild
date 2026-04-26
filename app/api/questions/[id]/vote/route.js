import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Question from '@/models/Question'
import User from '@/models/User'
import { createNotification } from '@/lib/createNotification'
export async function POST(req, { params }) {
  try {
    const { id } = await params
    const { userId } = await auth()
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { type, answerId } = await req.json()
    await connectDB()

    const user = await User.findOne({ clerkId: userId })
    const question = await Question.findById(id)

    if (!user || !question) return Response.json({ error: 'Not found' }, { status: 404 })

    if (answerId) {
      const answer = question.answers.id(answerId)
      if (!answer) return Response.json({ error: 'Answer not found' }, { status: 404 })

      const alreadyVoted = answer.voters.includes(user._id)
      if (!alreadyVoted) {
        answer.votes += type === 'up' ? 1 : -1
        answer.voters.push(user._id)
      }
    } else {
      const alreadyVoted = question.voters.includes(user._id)
      if (!alreadyVoted) {
        question.votes += type === 'up' ? 1 : -1
        question.voters.push(user._id)
      }
    }

    await question.save()
    if (!answerId && !alreadyVoted && type === 'up') {
  await createNotification({
    recipient: question.author,
    sender: user._id,
    type: 'like',
    message: user.firstName + ' upvoted your question: ' + question.title.slice(0, 50),
    link: '/questions/' + id,
  })
}
    return Response.json({ success: true, votes: answerId ? question.answers.id(answerId).votes : question.votes })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}