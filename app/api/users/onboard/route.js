import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(req) {
  try {
    console.log('Onboard API called')

    const authResult = await auth()
    const userId = authResult.userId
    console.log('UserId:', userId)

    if (!userId) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    console.log('Body:', body)

    await connectDB()
    console.log('DB connected')

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      {
        firstName: body.firstName,
        lastName: body.lastName,
        bio: body.bio,
        university: body.university,
        graduationYear: body.graduationYear,
        github: body.github,
        linkedin: body.linkedin,
        leetcode: body.leetcode,
        portfolio: body.portfolio,
        skills: body.skills || [],
        isOnboarded: true,
      },
      { new: true, upsert: true, returnDocument: 'after' }
    )

    console.log('User updated:', user?._id)
    return Response.json({ success: true, user })

  } catch (err) {
    console.error('Onboard error:', err.message)
    return Response.json({ success: false, error: err.message }, { status: 500 })
  }
}