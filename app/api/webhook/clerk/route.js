import { Webhook } from 'svix'
import { headers } from 'next/headers'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    return new Response('Webhook secret missing', { status: 400 })
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err) {
    return new Response('Invalid webhook', { status: 400 })
  }

  const { id } = evt.data
  const eventType = evt.type

  await connectDB()

  if (eventType === 'user.created') {
  const { id, email_addresses, image_url, first_name, last_name, username } = evt.data

  const email = email_addresses && email_addresses.length > 0 && email_addresses[0].email_address
    ? email_addresses[0].email_address
    : null

  try {
    await User.create({
      clerkId: id,
      email: email,
      firstName: first_name || '',
      lastName: last_name || '',
      avatar: image_url || '',
      username: username || id,
      isOnboarded: false,
    })
  } catch (createErr) {
    if (createErr.code === 11000) {
      console.log('User already exists, skipping...')
    } else {
      throw createErr
    }
  }
}

  if (eventType === 'user.deleted') {
    await User.findOneAndDelete({ clerkId: id })
  }

  return new Response('OK', { status: 200 })
}