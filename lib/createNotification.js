import connectDB from './mongodb'
import Notification from '@/models/Notification'

export async function createNotification({ recipient, sender, type, message, link }) {
  try {
    if (recipient.toString() === sender.toString()) return
    await connectDB()
    await Notification.create({ recipient, sender, type, message, link })
  } catch (err) {
    console.error('Notification error:', err)
  }
}