'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'

const typeIcon = {
  like: '❤️',
  comment: '💬',
  follow: '👥',
  message: '✉️',
  answer: '✅',
  blog_like: '❤️',
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      setNotifications(data.notifications || [])
      await fetch('/api/notifications/read', { method: 'POST' })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#06080f', fontFamily: 'var(--font-dm), DM Sans, sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '3rem 2rem' }}>

        <h1 style={{
          fontFamily: 'var(--font-syne), Syne, sans-serif',
          fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem'
        }}>Notifications 🔔</h1>
        <p style={{ color: '#8896b0', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Stay updated with your activity
        </p>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{
                height: 72, borderRadius: 14,
                background: 'linear-gradient(90deg,#111827 25%,#1f2d45 50%,#111827 75%)',
                backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite'
              }} />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '4rem 2rem',
            background: '#111827', borderRadius: 20,
            border: '1px dashed #1f2d45'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
            <h3 style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: '1.2rem', marginBottom: 8 }}>
              No notifications yet
            </h3>
            <p style={{ color: '#8896b0', fontSize: '0.9rem' }}>
              When someone likes or follows you, it'll show up here
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notifications.map(n => (
              <div
                key={n._id}
                onClick={() => n.link && router.push(n.link)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '1rem 1.2rem',
                  background: n.read ? '#111827' : 'rgba(79,142,247,0.06)',
                  border: '1px solid ' + (n.read ? '#1f2d45' : 'rgba(79,142,247,0.2)'),
                  borderRadius: 14, cursor: n.link ? 'pointer' : 'default',
                  transition: 'border-color 0.2s'
                }}
                onMouseEnter={e => n.link && (e.currentTarget.style.borderColor = 'rgba(79,142,247,0.4)')}
                onMouseLeave={e => e.currentTarget.style.borderColor = n.read ? '#1f2d45' : 'rgba(79,142,247,0.2)'}
              >
                {/* Sender avatar */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  {n.sender?.avatar ? (
                    <img src={n.sender.avatar} alt="av"
                      style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%',
                      background: 'rgba(79,142,247,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.9rem', fontWeight: 600, color: '#4f8ef7'
                    }}>
                      {n.sender?.firstName?.[0]}{n.sender?.lastName?.[0]}
                    </div>
                  )}
                  <div style={{
                    position: 'absolute', bottom: -2, right: -2,
                    width: 18, height: 18, borderRadius: '50%',
                    background: '#111827', border: '1px solid #1f2d45',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem'
                  }}>
                    {typeIcon[n.type] || '🔔'}
                  </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.88rem', color: '#f0f4ff', lineHeight: 1.5 }}>
                    {n.message}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#8896b0', marginTop: 2 }}>
                    {new Date(n.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>

                {/* Unread dot */}
                {!n.read && (
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#4f8ef7', flexShrink: 0
                  }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}