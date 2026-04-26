'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Navbar from '@/components/layout/Navbar'
import useIsMobile from '@/hooks/useIsMobile'
export default function ProjectDetailPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const params = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [liking, setLiking] = useState(false)
  const isMobile = useIsMobile()
  useEffect(() => {
    if (params.id) fetchProject()
  }, [params.id])

  useEffect(() => {
    if (project && user) {
      setLiked(project.likes?.includes(user.id))
      setLikeCount(project.likes?.length || 0)
    }
  }, [project, user])

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${params.id}`)
      const data = await res.json()
      setProject(data.project)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!user || liking) return
    setLiking(true)
    try {
      const res = await fetch(`/api/projects/${params.id}/like`, {
        method: 'POST',
      })
      const data = await res.json()
      if (data.success) {
        setLiked(data.liked)
        setLikeCount(data.likeCount)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLiking(false)
    }
  }

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: '#06080f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#8896b0', fontFamily: 'var(--font-dm), sans-serif'
    }}>Loading project...</div>
  )

  if (!project) return (
    <div style={{
      minHeight: '100vh', background: '#06080f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#8896b0', fontFamily: 'var(--font-dm), sans-serif'
    }}>Project not found</div>
  )

  return (
    <div style={{
      minHeight: '100vh', background: '#06080f',
      fontFamily: 'var(--font-dm), DM Sans, sans-serif'
    }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 2rem' }}>

        {/* Cover Image */}
        <div style={{
          width: '100%', height: 400, borderRadius: 20,
          overflow: 'hidden', marginBottom: '2.5rem',
          background: project.coverImage ? 'transparent' : '#1a2a4a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid #1f2d45'
        }}>
          {project.coverImage ? (
            <img
              src={project.coverImage}
              alt={project.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ fontSize: '5rem' }}>🚀</div>
          )}
        </div>

        {/* Title + Actions */}
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: '1rem',
          marginBottom: '1.5rem', flexWrap: 'wrap'
        }}>
          <h1 style={{
            fontFamily: 'var(--font-syne), Syne, sans-serif',
            fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
            fontWeight: 700, flex: 1
          }}>{project.title}</h1>

          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            {/* Like button */}
            <button
              onClick={handleLike}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '0.5rem 1.2rem', borderRadius: 10,
                border: `1px solid ${liked ? '#ec4899' : '#1f2d45'}`,
                background: liked ? 'rgba(236,72,153,0.1)' : 'transparent',
                color: liked ? '#ec4899' : '#8896b0',
                cursor: 'pointer', fontSize: '0.88rem',
                transition: 'all 0.2s', fontFamily: 'inherit'
              }}
            >
              {liked ? '❤️' : '🤍'} {likeCount}
            </button>

            {/* GitHub */}
            {project.githubUrl && (
              <button
                onClick={() => window.open(project.githubUrl, '_blank')}
                style={{
                  padding: '0.5rem 1.2rem', borderRadius: 10,
                  border: '1px solid #1f2d45', background: 'transparent',
                  color: '#f0f4ff', cursor: 'pointer', fontSize: '0.88rem',
                  fontFamily: 'inherit'
                }}
              >GitHub →</button>
            )}

            {/* Live Demo */}
            {project.liveUrl && (
              <button
                onClick={() => window.open(project.liveUrl, '_blank')}
                style={{
                  padding: '0.5rem 1.2rem', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
                  color: '#fff', cursor: 'pointer', fontSize: '0.88rem',
                  fontWeight: 500, fontFamily: 'inherit'
                }}
              >Live Demo →</button>
            )}
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '2rem' }}>
          {project.tags?.map(tag => (
            <span key={tag} style={{
              padding: '0.3rem 0.8rem', borderRadius: 999, fontSize: '0.82rem',
              fontWeight: 500, background: 'rgba(79,142,247,0.12)',
              color: '#4f8ef7', border: '1px solid rgba(79,142,247,0.2)'
            }}>{tag}</span>
          ))}
        </div>

        {/* Two column layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 300px',
          gap: '2rem',
          alignItems: 'start'
        }}>

          {/* Description */}
          <div style={{
            background: '#111827', border: '1px solid #1f2d45',
            borderRadius: 16, padding: '1.5rem'
          }}>
            <h2 style={{
              fontFamily: 'var(--font-syne), Syne, sans-serif',
              fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem'
            }}>About this project</h2>
            <p style={{
              color: '#8896b0', lineHeight: 1.8, fontSize: '0.95rem',
              whiteSpace: 'pre-wrap'
            }}>{project.description}</p>
          </div>

          {/* Author Card */}
          <div style={{
            background: '#111827', border: '1px solid #1f2d45',
            borderRadius: 16, padding: '1.5rem'
          }}>
            <h3 style={{
              fontFamily: 'var(--font-syne), Syne, sans-serif',
              fontSize: '0.9rem', fontWeight: 600,
              color: '#8896b0', marginBottom: '1rem',
              textTransform: 'uppercase', letterSpacing: '0.08em'
            }}>Built by</h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
              {project.author?.avatar ? (
                <img
                  src={project.author.avatar}
                  alt="avatar"
                  style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'rgba(79,142,247,0.15)',
                  border: '1px solid rgba(79,142,247,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', fontWeight: 600, color: '#4f8ef7'
                }}>
                  {project.author?.firstName?.[0]}{project.author?.lastName?.[0]}
                </div>
              )}
              <div>
                <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>
                  {project.author?.firstName} {project.author?.lastName}
                </div>
                <div style={{ color: '#8896b0', fontSize: '0.82rem' }}>
                  {project.author?.university || 'Student'}
                </div>
              </div>
            </div>

            {project.author?.bio && (
              <p style={{
                color: '#8896b0', fontSize: '0.85rem',
                lineHeight: 1.6, marginBottom: '1rem'
              }}>{project.author.bio}</p>
            )}

            {/* Skills */}
            {project.author?.skills?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1rem' }}>
                {project.author.skills.slice(0, 5).map(skill => (
                  <span key={skill} style={{
                    padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.72rem',
                    background: '#0d1120', color: '#8896b0',
                    border: '1px solid #1f2d45'
                  }}>{skill}</span>
                ))}
              </div>
            )}

            <button
  onClick={() => router.push(`/profile/${project.author?.username || project.clerkId}`)}
  style={{
    width: '100%', padding: '0.6rem', borderRadius: 10,
    border: '1px solid #1f2d45', background: 'transparent',
    color: '#f0f4ff', cursor: 'pointer', fontSize: '0.88rem',
    fontFamily: 'inherit', marginBottom: 8
  }}
>View Profile</button>

{user?.id === project.clerkId && (
  <div style={{ display: 'flex', gap: 8, width: '100%' }}>
    <button
      onClick={() => router.push(`/projects/${project._id}/edit`)}
      style={{
        flex: 1, padding: '0.6rem', borderRadius: 10,
        border: '1px solid #4f8ef7', background: 'transparent',
        color: '#4f8ef7', cursor: 'pointer', fontSize: '0.88rem',
        fontFamily: 'inherit'
      }}
    >✏️ Edit Project</button>
    <button
      onClick={async () => {
        if (!confirm('Are you sure you want to delete this project?')) return
        const res = await fetch(`/api/projects/${project._id}`, {
          method: 'DELETE'
        })
        const data = await res.json()
        if (data.success) {
          window.location.href = '/home'
        } else {
          alert('Failed to delete project')
        }
      }}
      style={{
        flex: 1, padding: '0.6rem', borderRadius: 10,
        border: '1px solid rgba(236,72,153,0.3)',
        background: 'rgba(236,72,153,0.06)',
        color: '#ec4899', cursor: 'pointer', fontSize: '0.88rem',
        fontFamily: 'inherit'
      }}
    >🗑️ Delete</button>
  </div>
)}
{user?.id === project.clerkId && (
  <div style={{ display: 'flex', gap: 8, width: '100%', marginBottom: 8 }}>
    <button
      onClick={async () => {
        const res = await fetch('/api/projects/' + project._id + '/feature', { method: 'POST' })
        const data = await res.json()
        if (data.success) {
          alert(data.isFeatured ? '⭐ Project is now featured on home page!' : 'Project unfeatured')
        }
      }}
      style={{
        width: '100%', padding: '0.6rem', borderRadius: 10,
        border: '1px solid rgba(245,158,11,0.3)',
        background: project.isFeatured ? 'rgba(245,158,11,0.15)' : 'transparent',
        color: '#f59e0b', cursor: 'pointer', fontSize: '0.88rem',
        fontFamily: 'inherit'
      }}
    >{project.isFeatured ? '⭐ Featured' : '☆ Set as Featured'}</button>
  </div>
)}
            {user?.id !== project.clerkId && (
  <button
    onClick={async () => {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetClerkId: project.clerkId }),
      })
      const data = await res.json()
      if (data.conversation) {
        router.push(`/messages?with=${project.clerkId}`)
      }
    }}
    style={{
      width: '100%', padding: '0.6rem', borderRadius: 10,
      border: 'none', background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
      color: '#fff', cursor: 'pointer', fontSize: '0.88rem',
      fontWeight: 500, fontFamily: 'inherit'
    }}
  >💬 Send Message</button>
)}

          </div>
        </div>

        {/* Posted date */}
        <div style={{ marginTop: '1.5rem', color: '#8896b0', fontSize: '0.82rem' }}>
          Posted on {new Date(project.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric'
          })}
        </div>

      </div>
    </div>
  )
}