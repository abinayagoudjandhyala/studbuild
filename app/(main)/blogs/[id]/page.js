'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Navbar from '@/components/layout/Navbar'

export default function BlogDetailPage() {
  const { user } = useUser()
  const router = useRouter()
  const params = useParams()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingComment, setEditingComment] = useState(null)
const [editCommentText, setEditCommentText] = useState('')
  useEffect(() => {
    if (params.id) fetchBlog()
  }, [params.id])

  useEffect(() => {
    if (blog && user) {
      setLiked(blog.likes?.some(l => l === user.id || l?._id === user.id))
      setLikeCount(blog.likes?.length || 0)
    }
  }, [blog, user])

  const fetchBlog = async () => {
    try {
      const res = await fetch(`/api/blogs/${params.id}`)
      const data = await res.json()
      setBlog(data.blog)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    try {
      const res = await fetch(`/api/blogs/${params.id}/like`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setLiked(data.liked)
        setLikeCount(data.likeCount)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleComment = async () => {
    if (!comment.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/blogs/${params.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment }),
      })
      const data = await res.json()
      if (data.success) {
        setComment('')
        fetchBlog()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#06080f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8896b0' }}>
      Loading blog...
    </div>
  )

  if (!blog) return (
    <div style={{ minHeight: '100vh', background: '#06080f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8896b0' }}>
      Blog not found
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#06080f', fontFamily: 'var(--font-dm), DM Sans, sans-serif' }}>
      <Navbar />

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '3rem 2rem' }}>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {blog.tags?.map(tag => (
            <span key={tag} style={{
              padding: '0.25rem 0.8rem', borderRadius: 999, fontSize: '0.78rem',
              background: 'rgba(52,211,153,0.1)', color: '#34d399',
              border: '1px solid rgba(52,211,153,0.2)'
            }}>{tag}</span>
          ))}
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: 'var(--font-syne), Syne, sans-serif',
          fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800,
          lineHeight: 1.2, marginBottom: '1.5rem', letterSpacing: '-0.02em'
        }}>{blog.title}</h1>

        {/* Author + Meta */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          marginBottom: '2rem', paddingBottom: '1.5rem',
          borderBottom: '1px solid #1f2d45'
        }}>
          {blog.author?.avatar ? (
            <img src={blog.author.avatar} alt="av"
              style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
              onClick={() => router.push(`/profile/${blog.author.clerkId}`)} />
          ) : (
            <div
              onClick={() => router.push(`/profile/${blog.author?.clerkId}`)}
              style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(79,142,247,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', fontWeight: 600, color: '#4f8ef7', cursor: 'pointer'
              }}>{blog.author?.firstName?.[0]}</div>
          )}
          <div style={{ flex: 1 }}>
            <div
              onClick={() => router.push(`/profile/${blog.author?.clerkId}`)}
              style={{ fontWeight: 500, fontSize: '0.95rem', cursor: 'pointer' }}
            >{blog.author?.firstName} {blog.author?.lastName}</div>
            <div style={{ color: '#8896b0', fontSize: '0.8rem' }}>
              {blog.author?.university} · {blog.readTime} min read · {blog.views} views
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleLike} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0.45rem 1rem', borderRadius: 10,
              border: `1px solid ${liked ? '#ec4899' : '#1f2d45'}`,
              background: liked ? 'rgba(236,72,153,0.1)' : 'transparent',
              color: liked ? '#ec4899' : '#8896b0',
              cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit'
            }}>{liked ? '❤️' : '🤍'} {likeCount}</button>
          </div>
          {user?.id === blog.clerkId && (
  <div style={{ display: 'flex', gap: 8, marginLeft: 8 }}>
    <button
      onClick={() => router.push('/blogs/' + params.id + '/edit')}
      style={{
        padding: '0.45rem 1rem', borderRadius: 10,
        border: '1px solid #1f2d45', background: 'transparent',
        color: '#4f8ef7', cursor: 'pointer', fontSize: '0.85rem',
        fontFamily: 'inherit'
      }}
    >✏️ Edit</button>
    <button
      onClick={async () => {
        if (!confirm('Delete this blog? This cannot be undone.')) return
        const res = await fetch('/api/blogs/' + params.id, { method: 'DELETE' })
        const data = await res.json()
        if (data.success) router.push('/home')
      }}
      style={{
        padding: '0.45rem 1rem', borderRadius: 10,
        border: '1px solid rgba(236,72,153,0.3)',
        background: 'rgba(236,72,153,0.06)',
        color: '#ec4899', cursor: 'pointer', fontSize: '0.85rem',
        fontFamily: 'inherit'
      }}
    >🗑️ Delete</button>
  </div>
)}
        </div>

        {/* Cover Image */}
        {blog.coverImage && (
          <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: '2rem' }}>
            <img src={blog.coverImage} alt={blog.title}
              style={{ width: '100%', maxHeight: 400, objectFit: 'cover' }} />
          </div>
        )}

        {/* Content */}
        <div style={{
          color: '#c8d4e8', fontSize: '1rem', lineHeight: 2,
          marginBottom: '3rem', whiteSpace: 'pre-wrap'
        }}>{blog.content}</div>

        {/* Comments */}
        <div style={{ borderTop: '1px solid #1f2d45', paddingTop: '2rem' }}>
          <h3 style={{
            fontFamily: 'var(--font-syne), Syne, sans-serif',
            fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem'
          }}>Comments ({blog.comments?.length || 0})</h3>

          {/* Add Comment */}
          {user && (
            <div style={{ marginBottom: '2rem' }}>
              <textarea
                rows={3}
                placeholder="Share your thoughts or ask a question..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
                  border: '1px solid #1f2d45', background: '#0d1120',
                  color: '#f0f4ff', fontSize: '0.92rem', outline: 'none',
                  fontFamily: 'inherit', resize: 'vertical', marginBottom: 8
                }}
              />
              <button onClick={handleComment} disabled={submitting || !comment.trim()} style={{
                padding: '0.6rem 1.5rem', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
                color: '#fff', cursor: 'pointer', fontSize: '0.88rem',
                fontWeight: 500, fontFamily: 'inherit',
                opacity: submitting || !comment.trim() ? 0.7 : 1
              }}>{submitting ? 'Posting...' : 'Post Comment'}</button>
            </div>
          )}

          {/* Comments List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {blog.comments?.map((c, i) => (
  <div key={i} style={{
    display: 'flex', gap: 12, padding: '1rem',
    borderRadius: 12, background: '#111827', border: '1px solid #1f2d45'
  }}>
    {c.author?.avatar ? (
      <img src={c.author.avatar} alt="av"
        style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
    ) : (
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'rgba(79,142,247,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.75rem', fontWeight: 600, color: '#4f8ef7', flexShrink: 0
      }}>{c.author?.firstName?.[0]}</div>
    )}
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
          {c.author?.firstName} {c.author?.lastName}
        </span>
        <span style={{ fontSize: '0.75rem', color: '#8896b0' }}>
          {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
        {/* Edit/Delete buttons — only for comment author */}
        {user?.id === c.author?.clerkId && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <button
              onClick={() => {
                setEditingComment(c._id)
                setEditCommentText(c.content)
              }}
              style={{
                padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.72rem',
                border: '1px solid #1f2d45', background: 'transparent',
                color: '#4f8ef7', cursor: 'pointer', fontFamily: 'inherit'
              }}
            >Edit</button>
            <button
              onClick={async () => {
                if (!confirm('Delete this comment?')) return
                await fetch('/api/blogs/' + params.id + '/comment', {
                  method: 'DELETE',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ commentId: c._id }),
                })
                fetchBlog()
              }}
              style={{
                padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.72rem',
                border: '1px solid rgba(236,72,153,0.3)',
                background: 'rgba(236,72,153,0.06)',
                color: '#ec4899', cursor: 'pointer', fontFamily: 'inherit'
              }}
            >Delete</button>
          </div>
        )}
      </div>

      {/* Edit mode */}
      {editingComment === c._id ? (
        <div>
          <textarea
            rows={2}
            value={editCommentText}
            onChange={e => setEditCommentText(e.target.value)}
            style={{
              width: '100%', padding: '0.6rem 0.8rem', borderRadius: 8,
              border: '1px solid #1f2d45', background: '#0d1120',
              color: '#f0f4ff', fontSize: '0.88rem', outline: 'none',
              fontFamily: 'inherit', resize: 'vertical', marginBottom: 6
            }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={async () => {
                await fetch('/api/blogs/' + params.id + '/comment', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ commentId: c._id, content: editCommentText }),
                })
                setEditingComment(null)
                fetchBlog()
              }}
              style={{
                padding: '0.35rem 0.9rem', borderRadius: 8, border: 'none',
                background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
                color: '#fff', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit'
              }}
            >Save</button>
            <button
              onClick={() => setEditingComment(null)}
              style={{
                padding: '0.35rem 0.9rem', borderRadius: 8,
                border: '1px solid #1f2d45', background: 'transparent',
                color: '#8896b0', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit'
              }}
            >Cancel</button>
          </div>
        </div>
      ) : (
        <p style={{ color: '#8896b0', fontSize: '0.88rem', lineHeight: 1.6 }}>{c.content}</p>
      )}
    </div>
  </div>
))}
          </div>
        </div>
      </div>
    </div>
  )
}