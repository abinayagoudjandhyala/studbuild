import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { createNotification } from '@/lib/createNotification'

export async function POST(req, { params }) {
  try {
    const { username } = await params
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const currentUser = await User.findOne({ clerkId: userId })
    const targetUser = await User.findOne({
      $or: [{ username }, { clerkId: username }]
    })

    if (!currentUser || !targetUser) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    if (currentUser._id.toString() === targetUser._id.toString()) {
      return Response.json({ error: 'Cannot follow yourself' }, { status: 400 })
    }

    const isFollowing = currentUser.following.includes(targetUser._id)

    if (isFollowing) {
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== targetUser._id.toString()
      )
      targetUser.followers = targetUser.followers.filter(
        id => id.toString() !== currentUser._id.toString()
      )
    } else {
      currentUser.following.push(targetUser._id)
      targetUser.followers.push(currentUser._id)
    }
    if (!isFollowing) {
  await createNotification({
    recipient: targetUser._id,
    sender: currentUser._id,
    type: 'follow',
    message: currentUser.firstName + ' started following you',
    link: '/profile/' + currentUser.clerkId,
  })
}
    await currentUser.save()
    await targetUser.save()

    return Response.json({
      success: true,
      following: !isFollowing,
      followersCount: targetUser.followers.length
    })
  } catch (err) {
    console.error(err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}