'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Navbar from '@/components/layout/Navbar'

const techTags = [
  'React', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Express',
  'Python', 'Django', 'FastAPI', 'Java', 'Spring', 'Go',
  'Rust', 'TypeScript', 'MongoDB', 'PostgreSQL', 'MySQL',
  'Firebase', 'Flutter', 'React Native', 'Swift', 'Kotlin',
  'Docker', 'AWS', 'GraphQL', 'Redis', 'C++', 'C#', 'Tailwind'
]

export default function EditProjectPage() {
  const { user } = useUser()
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [preview, setPreview] = useState(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    coverImage: '',
    tags: [],
    githubUrl: '',
    liveUrl: '',
  })

  useEffect(() => {
    if (params.id) fetchProject()
  }, [params.id])

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${params.id}`)
      const data = await res.json()

      if (!data.project) {
        router.push('/home')
        return
      }

      if (data.project.clerkId !== user?.id) {
        router.push('/home')
        return
      }

      const p = data.project
      setForm({
        title: p.title || '',
        description: p.description || '',
        coverImage: p.coverImage || '',
        tags: p.tags || [],
        githubUrl: p.githubUrl || '',
        liveUrl: p.liveUrl || '',
      })
      if (p.coverImage) setPreview(p.coverImage)
    } catch (err) {
      console.error(err)
    } finally {
      setFetching(false)
    }
  }

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
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.url) update('coverImage', data.url)
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.title || !form.description) {
      alert('Please add a title and description!')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        router.push(`/projects/${params.id}`)
      }
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

  const labelStyle = {
    fontSize: '0.82rem', color: '#8896b0', fontWeight: 500
  }

  if (fetching) return (
    <div style={{
      minHeight: '100vh', background: '#06080f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#8896b0'
    }}>Loading project...</div>
  )

  return (
    <div style={{
      minHeight: '100vh', background: '#06080f',
      fontFamily: 'var(--font-dm), DM Sans, sans-serif'
    }}>
      <Navbar />

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '3rem 2rem' }}>
        <h1 style={{
          fontFamily: 'var(--font-syne), Syne, sans-serif',
          fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem'
        }}>Edit Project ✏️</h1>
        <p style={{ color: '#8896b0', marginBottom: '2.5rem', fontSize: '0.9rem' }}>
          Update your project details
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Cover Image */}
          <div>
            <label style={labelStyle}>Cover Image</label>
            <div
              onClick={() => document.getElementById('img-upload-edit').click()}
              style={{
                marginTop: 8, height: 200, borderRadius: 12,
                border: '2px dashed #1f2d45', background: '#0d1120',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', overflow: 'hidden', position: 'relative',
                transition: 'border-color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#4f8ef7'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1f2d45'}
            >
              {preview ? (
                <img src={preview} alt="preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', color: '#8896b0' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>🖼️</div>
                  <div style={{ fontSize: '0.88rem' }}>Click to upload new cover image</div>
                </div>
              )}
              {uploading && (
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#4f8ef7', fontSize: '0.88rem'
                }}>Uploading...</div>
              )}
              {preview && !uploading && (
                <div style={{
                  position: 'absolute', bottom: 8, right: 8,
                  background: 'rgba(0,0,0,0.7)', color: '#f0f4ff',
                  fontSize: '0.75rem', padding: '0.3rem 0.7rem',
                  borderRadius: 8
                }}>Click to change</div>
              )}
            </div>
            <input
              id="img-upload-edit"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </div>

          {/* Title */}
          <div>
            <label style={labelStyle}>Project Title *</label>
            <input
              placeholder="eg. AI Study Planner, Campus Food App..."
              value={form.title}
              onChange={e => update('title', e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description *</label>
            <textarea
              rows={4}
              placeholder="What does your project do?"
              value={form.description}
              onChange={e => update('description', e.target.value)}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* GitHub URL */}
          <div>
            <label style={labelStyle}>GitHub Repository URL</label>
            <input
              placeholder="https://github.com/username/project"
              value={form.githubUrl}
              onChange={e => update('githubUrl', e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Live URL */}
          <div>
            <label style={labelStyle}>Live Demo URL</label>
            <input
              placeholder="https://myproject.vercel.app"
              value={form.liveUrl}
              onChange={e => update('liveUrl', e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Tags */}
          <div>
            <label style={labelStyle}>Tech Stack</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {techTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  style={{
                    padding: '0.35rem 0.9rem', borderRadius: 999, fontSize: '0.82rem',
                    cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
                    border: `1px solid ${form.tags.includes(tag) ? '#4f8ef7' : '#1f2d45'}`,
                    background: form.tags.includes(tag) ? 'rgba(79,142,247,0.15)' : 'transparent',
                    color: form.tags.includes(tag) ? '#4f8ef7' : '#8896b0',
                  }}
                >{tag}</button>
              ))}
            </div>
            {form.tags.length > 0 && (
              <p style={{ color: '#34d399', fontSize: '0.82rem', marginTop: 8 }}>
                ✓ {form.tags.length} tech selected
              </p>
            )}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => router.push(`/projects/${params.id}`)}
              style={{
                flex: 1, padding: '0.85rem', borderRadius: 10,
                border: '1px solid #1f2d45', background: 'transparent',
                color: '#f0f4ff', fontSize: '1rem', cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={loading || uploading}
              style={{
                flex: 2, padding: '0.85rem', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
                color: '#fff', fontSize: '1rem', fontWeight: 500,
                cursor: loading || uploading ? 'not-allowed' : 'pointer',
                opacity: loading || uploading ? 0.7 : 1,
                fontFamily: 'inherit'
              }}
            >{loading ? 'Saving...' : 'Save Changes ✓'}</button>
          </div>

        </div>
      </div>
    </div>
  )
}