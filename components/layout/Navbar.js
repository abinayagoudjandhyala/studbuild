'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUser, useClerk } from '@clerk/nextjs'
import useIsMobile from '@/hooks/useIsMobile'

export default function Navbar() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [unreadCount, setUnreadCount] = useState(0)
  const [profile, setProfile] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)
  useEffect(() => {
  if (isLoaded && user) {
    fetchProfile()
    fetchUnread()
    fetchNotifCount()
    const interval = setInterval(() => {
      fetchUnread()
      fetchNotifCount()
    }, 5000)
    return () => clearInterval(interval)
  }
}, [isLoaded, user])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/users/me')
      const data = await res.json()
      setProfile(data.user)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchUnread = async () => {
    try {
      const res = await fetch('/api/messages/unread')
      const data = await res.json()
      setUnreadCount(data.count || 0)
    } catch (err) {
      console.error(err)
    }
  }
  const fetchNotifCount = async () => {
  try {
    const res = await fetch('/api/notifications')
    const data = await res.json()
    setNotifCount(data.unreadCount || 0)
  } catch (err) {
    console.error(err)
  }
}

  return (
    <>
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '0.8rem 1rem' : '1rem 2.5rem',
        borderBottom: '1px solid #1f2d45',
        background: 'rgba(6,8,15,0.95)', backdropFilter: 'blur(18px)',
        position: 'sticky', top: 0, zIndex: 100,
        fontFamily: 'var(--font-dm), DM Sans, sans-serif'
      }}>
        {/* Logo */}
        <div onClick={() => router.push('/home')} style={{
          fontFamily: 'var(--font-syne), Syne, sans-serif',
          fontSize: isMobile ? '1.1rem' : '1.3rem', fontWeight: 800,
          background: 'linear-gradient(120deg,#4f8ef7,#a78bfa)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          cursor: 'pointer', flexShrink: 0
        }}>StudBuild</div>

        {/* Desktop Nav */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            
{[
  { label: 'Home', path: '/home' },
  { label: 'Explore', path: '/explore' },
  { label: 'Blogs', path: '/blogs' },
  { label: 'Q&A', path: '/questions' },
].map(link => (
              <span key={link.path} onClick={() => router.push(link.path)} style={{
                color: pathname === link.path ? '#f0f4ff' : '#8896b0',
                cursor: 'pointer', fontSize: '0.9rem', transition: 'color 0.2s',
                borderBottom: pathname === link.path ? '1px solid #4f8ef7' : 'none',
                paddingBottom: 2
              }}>{link.label}</span>
            ))}
          </div>
        )}

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12 }}>
          {/* Notifications Bell */}
<div
  onClick={() => router.push('/notifications')}
  style={{ position: 'relative', cursor: 'pointer' }}
>
  <div style={{
    padding: '0.45rem 0.8rem', borderRadius: 8,
    border: '1px solid #1f2d45',
    color: pathname === '/notifications' ? '#4f8ef7' : '#8896b0',
    fontSize: '1rem'
  }}>🔔</div>
  {notifCount > 0 && (
    <div style={{
      position: 'absolute', top: -4, right: -4,
      background: '#ec4899', color: '#fff',
      fontSize: '0.6rem', fontWeight: 700,
      padding: '1px 5px', borderRadius: 999,
      minWidth: 16, textAlign: 'center'
    }}>{notifCount > 99 ? '99+' : notifCount}</div>
  )}
</div>
          {/* Messages */}
          <div onClick={() => router.push('/messages')} style={{
            position: 'relative', cursor: 'pointer',
            padding: '0.45rem 0.8rem', borderRadius: 8,
            border: '1px solid #1f2d45',
            color: pathname === '/messages' ? '#4f8ef7' : '#8896b0',
            fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 4
          }}>
            💬
            {!isMobile && <span>Messages</span>}
            {unreadCount > 0 && (
              <span style={{
                background: '#ec4899', color: '#fff',
                fontSize: '0.62rem', fontWeight: 700,
                padding: '1px 5px', borderRadius: 999,
                minWidth: 16, textAlign: 'center'
              }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </div>

          {/* Add Project - hide on mobile */}
          {!isMobile && (
            <button onClick={() => router.push('/projects/new')} style={{
              padding: '0.45rem 1.1rem', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
              color: '#fff', cursor: 'pointer', fontSize: '0.88rem',
              fontWeight: 500, fontFamily: 'inherit'
            }}>+ Add Project</button>
          )}

          {/* Avatar */}
          <div onClick={() => router.push(`/profile/${profile?.clerkId || user?.id}`)}
            style={{ cursor: 'pointer' }}>
            {profile?.avatar || user?.imageUrl ? (
              <img src={profile?.avatar || user?.imageUrl} alt="avatar"
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  objectFit: 'cover', border: '2px solid #1f2d45'
                }} />
            ) : (
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'rgba(79,142,247,0.15)',
                border: '2px solid rgba(79,142,247,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 600, color: '#4f8ef7'
              }}>{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
            )}
          </div>

          {/* Mobile Menu Button */}
          {isMobile ? (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                padding: '0.4rem 0.6rem', borderRadius: 8,
                border: '1px solid #1f2d45', background: 'transparent',
                color: '#8896b0', cursor: 'pointer', fontSize: '1rem',
                fontFamily: 'inherit'
              }}
            >{menuOpen ? '✕' : '☰'}</button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              
              <button onClick={() => signOut(() => router.push('/'))} style={{
                padding: '0.45rem 0.8rem', borderRadius: 8,
                border: '1px solid rgba(236,72,153,0.3)',
                background: 'rgba(236,72,153,0.06)',
                color: '#ec4899', cursor: 'pointer', fontSize: '0.82rem',
                fontFamily: 'inherit'
              }}>Sign out</button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobile && menuOpen && (
        <div style={{
          position: 'fixed', top: 57, left: 0, right: 0, zIndex: 99,
          background: '#0d1120', borderBottom: '1px solid #1f2d45',
          padding: '1rem', display: 'flex', flexDirection: 'column', gap: 8
        }}>
         
{[
  { label: '🏠 Home', path: '/home' },
  { label: '🔍 Explore', path: '/explore' },
  { label: '📝 Blogs', path: '/blogs' },
  { label: '❓ Q&A', path: '/questions' },
  { label: '🚀 Add Project', path: '/projects/new' },
  { label: '⚙️ Edit Profile', path: '/settings/profile' },
  { label: '🔔 Notifications', path: '/notifications' },
].map(({ label, path }) => (
            <button key={path} onClick={() => { router.push(path); setMenuOpen(false) }} style={{
              padding: '0.75rem 1rem', borderRadius: 10,
              border: '1px solid #1f2d45', background: 'transparent',
              color: '#f0f4ff', cursor: 'pointer', fontSize: '0.9rem',
              fontFamily: 'inherit', textAlign: 'left'
            }}>{label}</button>
          ))}
          <button onClick={() => signOut(() => router.push('/'))} style={{
            padding: '0.75rem 1rem', borderRadius: 10,
            border: '1px solid rgba(236,72,153,0.3)',
            background: 'rgba(236,72,153,0.06)',
            color: '#ec4899', cursor: 'pointer', fontSize: '0.9rem',
            fontFamily: 'inherit', textAlign: 'left'
          }}>Sign out</button>
        </div>
      )}
    </>
  )
}