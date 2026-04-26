import { v2 as cloudinary } from 'cloudinary'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file')

    if (!file) {
      return Response.json({ error: 'No file' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'studbuild/avatars',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto' },
        { format: 'webp' },
      ],
    })

    await connectDB()
    await User.findOneAndUpdate(
      { clerkId: userId },
      { avatar: result.secure_url }
    )

    return Response.json({ url: result.secure_url })
  } catch (err) {
    console.error('Avatar upload error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}