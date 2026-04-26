import { v2 as cloudinary } from 'cloudinary'
import { auth } from '@clerk/nextjs/server'

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
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const base64 = buffer.toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'studbuild/projects',
      transformation: [
        { width: 1200, height: 630, crop: 'fill' },
        { quality: 'auto' },
        { format: 'webp' },
      ],
    })

    console.log('Cloudinary upload success:', result.secure_url)
    return Response.json({ url: result.secure_url })

  } catch (err) {
    console.error('Upload error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}