'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Navbar from '@/components/layout/Navbar'

const blogTags = [
  'Web Dev', 'DSA', 'Interview', 'Career', 'Machine Learning',
  'Open Source', 'Tips', 'Project', 'College Life', 'Internship',
  'App Dev', 'DevOps', 'Mistakes', 'Learning', 'Hackathon'
]

export default function NewBlogPage() {
  const { user } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [form, setForm] = useState({
    title: '',
    content: '',
    coverImage: '',
    tags: [],
  })

  const update = (field, value) => setForm(p => ({ ...p, [field]: value }))

  const toggleTag = (tag) => {
    setForm(p => ({
      ...p,
      tags: p.tags.includes(tag)
        ? p.tags.filter(t => t !== tag)
        : [...p.tags, tag]
    }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) update('coverImage', data.url)
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const wordCount = form.content.split(' ').filter(w => w).length
  const readTime = Math.max(1, Math.ceil(wordCount / 200))

  const handleSubmit = async () => {
    if (!form.title || !form.content) {
      alert('Please add a title and content!')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) router.push(`/blogs/${data.blog._id}`)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
    border: '1px solid #1f2d45', background: '#0d1120',
    color: '#f0f4ff', fontSize: '0.92rem', outline: 'none',
    fontFamily: 'inherit', marginTop: 6,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#06080f', fontFamily: 'var(--font-dm), DM Sans, sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '3rem 2rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-syne), Syne, sans-serif',
            fontSize: '2rem', fontWeight: 700, marginBottom: 6
          }}>Write a Blog 📝</h1>
          <p style={{ color: '#8896b0', fontSize: '0.9rem' }}>
            Share your experience, mistakes, tips with fellow students
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Cover Image */}
          <div>
            <label style={{ fontSize: '0.82rem', color: '#8896b0', fontWeight: 500 }}>
              Cover Image (optional)
            </label>
            <div
              onClick={() => document.getElementById('blog-img').click()}
              style={{
                marginTop: 8, height: 180, borderRadius: 12,
                border: '2px dashed #1f2d45', background: '#0d1120',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', overflow: 'hidden', position: 'relative',
                transition: 'border-color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#4f8ef7'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1f2d45'}
            >
              {preview ? (
                <img src={preview} alt="cover"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', color: '#8896b0' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>🖼️</div>
                  <div style={{ fontSize: '0.88rem' }}>Click to upload cover image</div>
                </div>
              )}
              {uploading && (
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#4f8ef7', fontSize: '0.88rem'
                }}>Uploading...</div>
              )}
            </div>
            <input id="blog-img" type="file" accept="image/*"
              onChange={handleImageUpload} style={{ display: 'none' }} />
          </div>

          {/* Title */}
          <div>
            <label style={{ fontSize: '0.82rem', color: '#8896b0', fontWeight: 500 }}>
              Blog Title *
            </label>
            <input
              placeholder="eg. 5 mistakes I made in my first internship..."
              value={form.title}
              onChange={e => update('title', e.target.value)}
              style={{ ...inputStyle, fontSize: '1.1rem' }}
            />
          </div>

          {/* Content */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.82rem', color: '#8896b0', fontWeight: 500 }}>
                Content *
              </label>
              <span style={{ fontSize: '0.75rem', color: '#8896b0' }}>
                {wordCount} words · {readTime} min read
              </span>
            </div>
            <textarea
              rows={16}
              placeholder={`Share your story here...\n\nYou can write about:\n- What you built and how\n- Mistakes you made and what you learned\n- Tips for other students\n- Your internship/placement experience\n- Learning roadmap that worked for you`}
              value={form.content}
              onChange={e => update('content', e.target.value)}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.8 }}
            />
          </div>

          {/* Tags */}
          <div>
            <label style={{ fontSize: '0.82rem', color: '#8896b0', fontWeight: 500 }}>
              Tags — pick relevant ones
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {blogTags.map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)} style={{
                  padding: '0.35rem 0.9rem', borderRadius: 999, fontSize: '0.82rem',
                  cursor: 'pointer', fontFamily: 'inherit',
                  border: `1px solid ${form.tags.includes(tag) ? '#34d399' : '#1f2d45'}`,
                  background: form.tags.includes(tag) ? 'rgba(52,211,153,0.1)' : 'transparent',
                  color: form.tags.includes(tag) ? '#34d399' : '#8896b0',
                }}>{tag}</button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading || uploading}
            style={{
              width: '100%', padding: '0.85rem', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
              color: '#fff', fontSize: '1rem', fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, fontFamily: 'inherit'
            }}
          >{loading ? 'Publishing...' : 'Publish Blog 📝'}</button>

        </div>
      </div>
    </div>
  )
}