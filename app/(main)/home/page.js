'use client'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import { ProjectCardSkeleton, BlogCardSkeleton, QuestionCardSkeleton } from '@/components/ui/Skeleton'
import useIsMobile from '@/hooks/useIsMobile'

const techTrending = [
  { name: 'Next.js 15', change: '+24%' },
  { name: 'Rust', change: '+18%' },
  { name: 'Bun.js', change: '+31%' },
  { name: 'Astro', change: '+15%' },
  { name: 'Drizzle ORM', change: '+42%' },
  { name: 'shadcn/ui', change: '+28%' },
]

const tips = [
  "Pin your best project to get 3x more views 📌",
  "Add a live demo link to stand out 🚀",
  "Tag your projects correctly to get discovered 🔍",
  "Connect your GitHub to show your activity ⚡",
  "Write a blog about your project journey 📝",
  "Answer questions to build your reputation ❓",
  "Follow other builders to grow your network 👥",
]

export default function HomePage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const isMobile = useIsMobile()
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [blogs, setBlogs] = useState([])
  const [questions, setQuestions] = useState([])
  const [myProjects, setMyProjects] = useState([])
  const [suggested, setSuggested] = useState([])
  const [githubStats, setGithubStats] = useState(null)
  const [checking, setChecking] = useState(true)
  const [activeTab, setActiveTab] = useState('projects')
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [loadingBlogs, setLoadingBlogs] = useState(false)
  const [loadingQna, setLoadingQna] = useState(false)
  const [tip] = useState(tips[Math.floor(Math.random() * tips.length)])
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    if (isLoaded && !user) router.push('/')
  }, [isLoaded, user])

  useEffect(() => {
    if (isLoaded && user) {
      fetchProfile()
      fetchProjects()
    }
  }, [isLoaded, user])

  useEffect(() => {
    if (activeTab === 'blogs' && blogs.length === 0) fetchBlogs()
    if (activeTab === 'qna' && questions.length === 0) fetchQuestions()
  }, [activeTab])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/users/me')
      const data = await res.json()
      if (!data.user || !data.user.isOnboarded) {
        router.push('/onboarding')
        return
      }
      setProfile(data.user)
      if (data.user?.github) fetchGithubStats(data.user.github)
      if (data.user?.clerkId) fetchMyProjects(data.user.clerkId)
      fetchSuggested()
    } catch (err) {
      console.error(err)
    } finally {
      setChecking(false)
    }
  }

  const fetchGithubStats = async (username) => {
    try {
      const res = await fetch('/api/github/' + username)
      const data = await res.json()
      if (!data.error) setGithubStats(data)
    } catch (err) { console.error(err) }
  }

  const fetchMyProjects = async (clerkId) => {
    try {
      const res = await fetch('/api/users/' + clerkId + '/projects')
      const data = await res.json()
      setMyProjects(data.projects || [])
    } catch (err) { console.error(err) }
  }

  const fetchSuggested = async () => {
    try {
      const res = await fetch('/api/users/suggested')
      const data = await res.json()
      setSuggested(data.users || [])
    } catch (err) { console.error(err) }
  }

  const fetchProjects = async () => {
    setLoadingProjects(true)
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data.projects || [])
    } catch (err) { console.error(err) }
    finally { setLoadingProjects(false) }
  }

  const fetchBlogs = async () => {
    setLoadingBlogs(true)
    try {
      const res = await fetch('/api/blogs')
      const data = await res.json()
      setBlogs(data.blogs || [])
    } catch (err) { console.error(err) }
    finally { setLoadingBlogs(false) }
  }

  const fetchQuestions = async () => {
    setLoadingQna(true)
    try {
      const res = await fetch('/api/questions')
      const data = await res.json()
      setQuestions(data.questions || [])
    } catch (err) { console.error(err) }
    finally { setLoadingQna(false) }
  }

  const totalLikes = myProjects.reduce((sum, p) => sum + (p.likes?.length || 0), 0)

  if (!isLoaded || checking) return (
    <div style={{
      minHeight: '100vh', background: '#06080f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid #1f2d45', borderTop: '3px solid #4f8ef7',
        animation: 'spin 0.8s linear infinite'
      }} />
      <div style={{ color: '#8896b0', fontSize: '0.88rem' }}>Loading StudBuild...</div>
      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#06080f', fontFamily: 'var(--font-dm), DM Sans, sans-serif' }}>
      <Navbar />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>

        {/* Hero Welcome Card */}
        <div style={{
          position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, #0d1529 0%, #0a0f1a 50%, #0d1120 100%)',
          border: '1px solid rgba(79,142,247,0.2)',
          borderRadius: 24, padding: isMobile ? '1.5rem' : '2rem 2.5rem',
          marginBottom: '1.5rem',
          animation: 'fadeUp 0.5s ease both'
        }}>
          {/* Animated background blobs */}
          {/* Top row — greeting + stats */}
<div style={{
  position: 'relative', display: 'flex',
  alignItems: 'flex-start', justifyContent: 'space-between',
  flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem'
}}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{
        position: 'absolute', inset: -3, borderRadius: '50%',
        background: 'linear-gradient(135deg,#4f8ef7,#a78bfa,#34d399)',
        animation: 'spin 4s linear infinite', opacity: 0.6
      }} />
      {profile?.avatar || user?.imageUrl ? (
        <img src={profile?.avatar || user?.imageUrl} alt="avatar"
          style={{
            position: 'relative', width: 56, height: 56,
            borderRadius: '50%', objectFit: 'cover', border: '3px solid #06080f'
          }} />
      ) : (
        <div style={{
          position: 'relative', width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.2rem', fontWeight: 700, color: '#fff', border: '3px solid #06080f'
        }}>{user?.firstName?.[0]}</div>
      )}
      <div style={{
        position: 'absolute', bottom: 2, right: 2, width: 12, height: 12,
        borderRadius: '50%', background: '#34d399', border: '2px solid #06080f'
      }} />
    </div>
    <div>
      <p style={{ color: '#4f8ef7', fontSize: '0.75rem', fontWeight: 500, marginBottom: 2, letterSpacing: '0.05em' }}>
        {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
      </p>
      <h1 style={{
        fontFamily: 'var(--font-syne), Syne, sans-serif',
        fontSize: isMobile ? '1.3rem' : '1.6rem',
        fontWeight: 800, marginBottom: 3, letterSpacing: '-0.02em'
      }}>
        {greeting}, {profile?.firstName || user?.firstName}! 👋
      </h1>
      <p style={{ color: '#8896b0', fontSize: '0.82rem' }}>💡 {tip}</p>
    </div>
  </div>

  {/* Stats */}
  {!isMobile && (
    <div style={{ display: 'flex', gap: '0.6rem' }}>
      {[
        { icon: '🚀', value: myProjects.length, label: 'Projects', color: '#4f8ef7' },
        { icon: '❤️', value: totalLikes, label: 'Likes', color: '#ec4899' },
        { icon: '👥', value: profile?.followers?.length || 0, label: 'Followers', color: '#a78bfa' },
      ].map(({ icon, value, label, color }) => (
        <div key={label} style={{
          padding: '0.7rem 1rem', borderRadius: 12, textAlign: 'center',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)', minWidth: 75
        }}>
          <div style={{ fontSize: '0.95rem', marginBottom: 2 }}>{icon}</div>
          <div style={{
            fontFamily: 'var(--font-syne), Syne, sans-serif',
            fontSize: '1.2rem', fontWeight: 700, color
          }}>{value}</div>
          <div style={{ fontSize: '0.65rem', color: '#8896b0' }}>{label}</div>
        </div>
      ))}
    </div>
  )}
</div>

{/* Divider */}
<div style={{ height: 1, background: 'linear-gradient(90deg,rgba(79,142,247,0.3),rgba(167,139,250,0.2),transparent)', marginBottom: '1.2rem', position: 'relative' }} />

{/* Quick actions */}
<div style={{ position: 'relative', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
  <p style={{ width: '100%', fontSize: '0.72rem', color: '#8896b0', marginBottom: 2, letterSpacing: '0.06em' }}>
    QUICK ACTIONS
  </p>
  {[
    { label: '🚀 New Project', path: '/projects/new', primary: true },
    { label: '📝 Write Blog', path: '/blogs/new', primary: false },
    { label: '❓ Ask Question', path: '/questions/ask', primary: false },
    { label: '🔍 Explore All', path: '/explore', primary: false },
    { label: '👤 My Profile', path: '/profile/' + (profile?.clerkId || ''), primary: false },
  ].map(({ label, path, primary }) => (
    <button key={path} onClick={() => router.push(path)} style={{
      padding: '0.48rem 1rem', borderRadius: 10,
      border: primary ? 'none' : '1px solid rgba(255,255,255,0.1)',
      background: primary
        ? 'linear-gradient(135deg,#4f8ef7,#7c5cfc)'
        : 'rgba(255,255,255,0.04)',
      color: primary ? '#fff' : '#8896b0',
      cursor: 'pointer', fontSize: '0.82rem',
      fontFamily: 'inherit', fontWeight: primary ? 600 : 400,
      transition: 'all 0.2s',
      boxShadow: primary ? '0 4px 15px rgba(79,142,247,0.3)' : 'none'
    }}
      onMouseEnter={e => {
        if (!primary) {
          e.currentTarget.style.borderColor = 'rgba(79,142,247,0.4)'
          e.currentTarget.style.color = '#f0f4ff'
          e.currentTarget.style.background = 'rgba(79,142,247,0.08)'
        }
      }}
      onMouseLeave={e => {
        if (!primary) {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
          e.currentTarget.style.color = '#8896b0'
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
        }
      }}
    >{label}</button>
  ))}
</div>
        </div>

        {/* Main Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 300px',
          gap: '1.5rem', alignItems: 'start'
        }}>

          {/* LEFT FEED */}
          <div>

            {/* My Projects Strip */}
            {myProjects.length > 0 && (
              <div style={{
                background: '#0d1120', border: '1px solid #1f2d45',
                borderRadius: 16, padding: '1.2rem', marginBottom: '1.2rem',
                animation: 'fadeUp 0.5s 0.1s ease both'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: '0.88rem', fontWeight: 600 }}>
                    Your Projects
                  </h3>
                  <span onClick={() => router.push('/profile/' + profile?.clerkId)}
                    style={{ color: '#4f8ef7', fontSize: '0.78rem', cursor: 'pointer' }}>
                    View all →
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                  {myProjects.slice(0, 5).map(p => (
                    <div key={p._id} onClick={() => router.push('/projects/' + p._id)}
                      style={{
                        minWidth: 140, background: '#111827', border: '1px solid #1f2d45',
                        borderRadius: 12, overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(79,142,247,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#1f2d45'; e.currentTarget.style.transform = 'translateY(0)' }}
                    >
                      <div style={{
                        height: 70, background: p.coverImage ? 'transparent' : 'linear-gradient(135deg,#1a2a4a,#2a1a4a)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                      }}>
                        {p.coverImage
                          ? <img src={p.coverImage} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ fontSize: '1.4rem' }}>🚀</span>}
                      </div>
                      <div style={{ padding: '0.5rem 0.6rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                        <div style={{ fontSize: '0.68rem', color: '#8896b0', marginTop: 2 }}>❤️ {p.likes?.length || 0}</div>
                      </div>
                    </div>
                  ))}
                  <div onClick={() => router.push('/projects/new')}
                    style={{
                      minWidth: 140, height: 112, background: '#111827',
                      border: '2px dashed #1f2d45', borderRadius: 12,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexDirection: 'column', gap: 4, cursor: 'pointer', flexShrink: 0,
                      transition: 'border-color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#4f8ef7'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#1f2d45'}
                  >
                    <span style={{ fontSize: '1.3rem', color: '#4f8ef7' }}>+</span>
                    <span style={{ fontSize: '0.72rem', color: '#8896b0' }}>New project</span>
                  </div>
                </div>
              </div>
            )}

            {/* Feed Tabs */}
            <div style={{
              display: 'flex', gap: 4, background: '#0d1120',
              border: '1px solid #1f2d45', borderRadius: 14,
              padding: 4, marginBottom: '1.2rem',
              animation: 'fadeUp 0.5s 0.15s ease both'
            }}>
              {[
                { id: 'projects', label: '🚀 Projects' },
{ id: 'blogs', label: '📝 Blogs' },
{ id: 'qna', label: '❓ Q&A' },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  flex: 1, padding: '0.6rem 0.8rem', borderRadius: 10,
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: isMobile ? '0.78rem' : '0.88rem', fontWeight: 500,
                  transition: 'all 0.25s',
                  background: activeTab === tab.id ? 'linear-gradient(135deg,#4f8ef7,#7c5cfc)' : 'transparent',
                  color: activeTab === tab.id ? '#fff' : '#8896b0',
                  boxShadow: activeTab === tab.id ? '0 4px 12px rgba(79,142,247,0.25)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5
                }}>
                  {tab.label}
                  
                </button>
              ))}
            </div>

            {/* PROJECTS TAB */}
            {activeTab === 'projects' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                {loadingProjects ? (
                  <>
                    <div style={{
                      background: '#111827', border: '1px solid #1f2d45',
                      borderRadius: 20, overflow: 'hidden', marginBottom: '1rem'
                    }}>
                      <div style={{ height: 260, background: 'linear-gradient(90deg,#111827 25%,#1f2d45 50%,#111827 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                      <div style={{ padding: '1.5rem' }}>
                        <div style={{ height: 24, width: '50%', borderRadius: 8, background: 'linear-gradient(90deg,#111827 25%,#1f2d45 50%,#111827 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', marginBottom: 12 }} />
                        <div style={{ height: 14, borderRadius: 6, background: 'linear-gradient(90deg,#111827 25%,#1f2d45 50%,#111827 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1rem' }}>
                      {[...Array(4)].map((_, i) => <ProjectCardSkeleton key={i} />)}
                    </div>
                  </>
                ) : projects.length === 0 ? (
                  <EmptyState icon="🏗️" title="No projects yet" desc="Be the first to upload a project!" action="+ Upload Project" onClick={() => router.push('/projects/new')} />
                ) : (
                  <>
                    {/* Featured Big Card */}
                    <div onClick={() => router.push('/projects/' + projects[0]._id)}
                      style={{
                        background: '#111827', border: '1px solid #1f2d45',
                        borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
                        marginBottom: '1rem', transition: 'all 0.3s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(79,142,247,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#1f2d45'; e.currentTarget.style.transform = 'translateY(0)' }}
                    >
                      <div style={{
                        height: isMobile ? 180 : 260, overflow: 'hidden', position: 'relative',
                        background: projects[0].coverImage ? 'transparent' : 'linear-gradient(135deg,#0d1a35,#1a0d35)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {projects[0].coverImage
                          ? <img src={projects[0].coverImage} alt={projects[0].title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ fontSize: '5rem' }}>🚀</div>}
                        <div style={{
                          position: 'absolute', top: 12, left: 12,
                          background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
                          color: '#fff', fontSize: '0.72rem', fontWeight: 600,
                          padding: '0.25rem 0.75rem', borderRadius: 999,
                          boxShadow: '0 4px 12px rgba(79,142,247,0.4)'
                        }}>✨ Featured</div>
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'linear-gradient(to top, rgba(17,24,39,0.9) 0%, transparent 60%)'
                        }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem' }}>
                          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                            {projects[0].tags?.slice(0, 3).map(tag => (
                              <span key={tag} style={{
                                padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.72rem',
                                background: 'rgba(79,142,247,0.25)', color: '#93c5fd',
                                border: '1px solid rgba(79,142,247,0.3)', backdropFilter: 'blur(4px)'
                              }}>{tag}</span>
                            ))}
                          </div>
                          <h2 style={{
                            fontFamily: 'var(--font-syne), Syne, sans-serif',
                            fontSize: isMobile ? '1.1rem' : '1.4rem', fontWeight: 700, color: '#fff', marginBottom: 4
                          }}>{projects[0].title}</h2>
                          <p style={{
                            color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem',
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                          }}>{projects[0].description}</p>
                        </div>
                      </div>
                      <div style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                        {projects[0].author?.avatar
                          ? <img src={projects[0].author.avatar} alt="av" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                          : <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(79,142,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 600, color: '#4f8ef7' }}>{projects[0].author?.firstName?.[0]}</div>
                        }
                        <span style={{ fontSize: '0.85rem', color: '#8896b0', flex: 1 }}>
                          {projects[0].author?.firstName} {projects[0].author?.lastName}
                        </span>
                        <span style={{ fontSize: '0.82rem', color: '#ec4899' }}>❤️ {projects[0].likes?.length || 0}</span>
                        {projects[0].githubUrl && (
                          <span onClick={e => { e.stopPropagation(); window.open(projects[0].githubUrl, '_blank') }}
                            style={{ fontSize: '0.8rem', color: '#4f8ef7', cursor: 'pointer' }}>GitHub →</span>
                        )}
                        {projects[0].liveUrl && (
                          <span onClick={e => { e.stopPropagation(); window.open(projects[0].liveUrl, '_blank') }}
                            style={{ fontSize: '0.8rem', color: '#34d399', cursor: 'pointer' }}>Live →</span>
                        )}
                      </div>
                    </div>

                    {/* Grid of smaller cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill,minmax(220px,1fr))', gap: '1rem' }}>
                      {projects.slice(1).map(project => (
                        <div key={project._id} onClick={() => router.push('/projects/' + project._id)}
                          style={{
                            background: '#111827', border: '1px solid #1f2d45',
                            borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                            transition: 'all 0.25s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(79,142,247,0.4)' }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#1f2d45' }}
                        >
                          <div style={{
                            height: 120, overflow: 'hidden',
                            background: project.coverImage ? 'transparent' : 'linear-gradient(135deg,#1a2a4a,#2a1a4a)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            {project.coverImage
                              ? <img src={project.coverImage} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <div style={{ fontSize: '2rem' }}>🚀</div>}
                          </div>
                          <div style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 5 }}>
                              {project.tags?.slice(0, 2).map(tag => (
                                <span key={tag} style={{
                                  padding: '0.12rem 0.5rem', borderRadius: 6, fontSize: '0.68rem',
                                  background: 'rgba(79,142,247,0.1)', color: '#4f8ef7',
                                  border: '1px solid rgba(79,142,247,0.2)'
                                }}>{tag}</span>
                              ))}
                            </div>
                            <div style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: '0.88rem', fontWeight: 600, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.title}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: '0.72rem', color: '#8896b0', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {project.author?.firstName} {project.author?.lastName}
                              </span>
                              <span style={{ fontSize: '0.68rem', color: '#ec4899' }}>❤️ {project.likes?.length || 0}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* BLOGS TAB */}
            {activeTab === 'blogs' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <p style={{ color: '#8896b0', fontSize: '0.88rem' }}>Read what students are learning</p>
                  <button onClick={() => router.push('/blogs/new')} style={{
                    padding: '0.45rem 1rem', borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
                    color: '#fff', cursor: 'pointer', fontSize: '0.82rem',
                    fontWeight: 500, fontFamily: 'inherit'
                  }}>+ Write Blog</button>
                </div>
                {loadingBlogs ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[...Array(3)].map((_, i) => <BlogCardSkeleton key={i} />)}
                  </div>
                ) : blogs.length === 0 ? (
                  <EmptyState icon="📝" title="No blogs yet" desc="Share your journey — write the first blog!" action="+ Write a Blog" onClick={() => router.push('/blogs/new')} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {blogs.map((blog, i) => (
                      <div key={blog._id} onClick={() => router.push('/blogs/' + blog._id)}
                        style={{
                          background: '#111827', border: '1px solid #1f2d45',
                          borderRadius: i === 0 ? 20 : 14,
                          padding: i === 0 ? '1.5rem' : '1.1rem',
                          cursor: 'pointer', transition: 'border-color 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(79,142,247,0.4)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#1f2d45'}
                      >
                        {i === 0 && blog.coverImage && (
                          <div style={{ height: 180, borderRadius: 12, overflow: 'hidden', marginBottom: '1rem' }}>
                            <img src={blog.coverImage} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          {blog.author?.avatar
                            ? <img src={blog.author.avatar} alt="av" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                            : <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(79,142,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', fontWeight: 600, color: '#4f8ef7' }}>{blog.author?.firstName?.[0]}</div>
                          }
                          <span style={{ fontSize: '0.78rem', color: '#8896b0' }}>{blog.author?.firstName} {blog.author?.lastName}</span>
                          <span style={{ fontSize: '0.72rem', color: '#8896b0', marginLeft: 'auto' }}>{blog.readTime || 5} min read</span>
                        </div>
                        <h3 style={{
                          fontFamily: 'var(--font-syne), Syne, sans-serif',
                          fontSize: i === 0 ? '1.2rem' : '0.95rem', fontWeight: 600, marginBottom: 6,
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                        }}>{blog.title}</h3>
                        <p style={{
                          color: '#8896b0', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 8,
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                        }}>{blog.excerpt || blog.content?.slice(0, 150)}</p>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                          {blog.tags?.slice(0, 3).map(tag => (
                            <span key={tag} style={{
                              padding: '0.15rem 0.6rem', borderRadius: 999, fontSize: '0.72rem',
                              background: 'rgba(52,211,153,0.1)', color: '#34d399',
                              border: '1px solid rgba(52,211,153,0.2)'
                            }}>{tag}</span>
                          ))}
                          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#8896b0' }}>❤️ {blog.likes?.length || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* QNA TAB */}
            {activeTab === 'qna' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <p style={{ color: '#8896b0', fontSize: '0.88rem' }}>Ask questions, help others, earn reputation</p>
                  <button onClick={() => router.push('/questions/ask')} style={{
                    padding: '0.45rem 1rem', borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
                    color: '#fff', cursor: 'pointer', fontSize: '0.82rem',
                    fontWeight: 500, fontFamily: 'inherit'
                  }}>+ Ask Question</button>
                </div>
                {loadingQna ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {[...Array(3)].map((_, i) => <QuestionCardSkeleton key={i} />)}
                  </div>
                ) : questions.length === 0 ? (
                  <EmptyState icon="❓" title="No questions yet" desc="Ask anything — code, career, college!" action="+ Ask a Question" onClick={() => router.push('/questions/ask')} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {questions.map(q => (
                      <div key={q._id} onClick={() => router.push('/questions/' + q._id)}
                        style={{
                          background: '#111827', border: '1px solid #1f2d45',
                          borderRadius: 14, padding: '1rem 1.2rem',
                          cursor: 'pointer', transition: 'border-color 0.2s',
                          display: 'flex', gap: '1rem'
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(79,142,247,0.4)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#1f2d45'}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0, minWidth: 48 }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: q.votes > 0 ? '#f59e0b' : '#8896b0' }}>{q.votes || 0}</div>
                            <div style={{ fontSize: '0.62rem', color: '#8896b0' }}>votes</div>
                          </div>
                          <div style={{
                            textAlign: 'center', padding: '0.2rem 0.4rem', borderRadius: 6,
                            background: q.answers?.some(a => a.isAccepted) ? 'rgba(52,211,153,0.15)' : q.answers?.length > 0 ? 'rgba(79,142,247,0.1)' : 'transparent',
                            border: '1px solid ' + (q.answers?.some(a => a.isAccepted) ? 'rgba(52,211,153,0.3)' : q.answers?.length > 0 ? 'rgba(79,142,247,0.2)' : '#1f2d45')
                          }}>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: q.answers?.some(a => a.isAccepted) ? '#34d399' : q.answers?.length > 0 ? '#4f8ef7' : '#8896b0' }}>
                              {q.answers?.length || 0}
                            </div>
                            <div style={{ fontSize: '0.6rem', color: q.answers?.some(a => a.isAccepted) ? '#34d399' : '#8896b0' }}>
                              {q.answers?.some(a => a.isAccepted) ? 'solved' : 'ans'}
                            </div>
                          </div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{
                            fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: '0.92rem',
                            fontWeight: 600, marginBottom: 4,
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                          }}>{q.title}</h3>
                          <p style={{
                            color: '#8896b0', fontSize: '0.8rem', marginBottom: 6,
                            display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                          }}>{q.body}</p>
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                            {q.tags?.slice(0, 3).map(tag => (
                              <span key={tag} style={{
                                padding: '0.12rem 0.5rem', borderRadius: 6, fontSize: '0.68rem',
                                background: 'rgba(79,142,247,0.08)', color: '#4f8ef7',
                                border: '1px solid rgba(79,142,247,0.15)'
                              }}>{tag}</span>
                            ))}
                            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
                              {q.author?.avatar
                                ? <img src={q.author.avatar} alt="av" style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }} />
                                : <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(79,142,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', color: '#4f8ef7' }}>{q.author?.firstName?.[0]}</div>
                              }
                              <span style={{ fontSize: '0.72rem', color: '#8896b0' }}>{q.author?.firstName}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          {!isMobile && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* GitHub Stats */}
              {githubStats && (
                <div style={{
                  background: '#0d1120', border: '1px solid #1f2d45',
                  borderRadius: 16, padding: '1.2rem',
                  animation: 'fadeUp 0.5s 0.2s ease both'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                    <h3 style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: '0.85rem', fontWeight: 600 }}>⚡ GitHub</h3>
                    <a href={githubStats.profileUrl} target="_blank" rel="noreferrer"
                      style={{ color: '#4f8ef7', fontSize: '0.72rem', textDecoration: 'none' }}>View →</a>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { label: 'Repos', value: githubStats.publicRepos, icon: '📁' },
                      { label: 'Stars', value: githubStats.totalStars, icon: '⭐' },
                      { label: 'Followers', value: githubStats.followers, icon: '👥' },
                      { label: 'Following', value: githubStats.following, icon: '➕' },
                    ].map(({ label, value, icon }) => (
                      <div key={label} style={{
                        background: '#111827', borderRadius: 10, padding: '0.65rem',
                        border: '1px solid #1f2d45', textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '0.95rem', marginBottom: 2 }}>{icon}</div>
                        <div style={{
                          fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: '1rem', fontWeight: 700,
                          background: 'linear-gradient(120deg,#4f8ef7,#a78bfa)',
                          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>{value}</div>
                        <div style={{ fontSize: '0.65rem', color: '#8896b0' }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  {githubStats.languages?.length > 0 && (
                    <div style={{ marginTop: '0.8rem' }}>
                      <div style={{ fontSize: '0.68rem', color: '#8896b0', marginBottom: 5 }}>TOP LANGUAGES</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {githubStats.languages.slice(0, 4).map(lang => (
                          <span key={lang} style={{
                            padding: '0.15rem 0.55rem', borderRadius: 999, fontSize: '0.7rem',
                            background: '#111827', color: '#f0f4ff', border: '1px solid #1f2d45'
                          }}>{lang}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Trending Tech */}
              <div style={{
                background: '#0d1120', border: '1px solid #1f2d45',
                borderRadius: 16, padding: '1.2rem',
                animation: 'fadeUp 0.5s 0.25s ease both'
              }}>
                <h3 style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.8rem' }}>
                  🔥 Trending Tech
                </h3>
                {techTrending.map((tech, i) => (
                  <div key={tech.name} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '0.45rem 0',
                    borderBottom: i < techTrending.length - 1 ? '1px solid rgba(31,45,69,0.5)' : 'none'
                  }}>
                    <span style={{ fontSize: '0.68rem', color: '#8896b0', minWidth: 14 }}>{i + 1}</span>
                    <span style={{ fontSize: '0.82rem', flex: 1 }}>{tech.name}</span>
                    <span style={{
                      fontSize: '0.68rem', color: '#34d399',
                      background: 'rgba(52,211,153,0.1)', padding: '1px 6px', borderRadius: 999
                    }}>{tech.change}</span>
                  </div>
                ))}
              </div>

              {/* People you might know */}
              {suggested.length > 0 && (
                <div style={{
                  background: '#0d1120', border: '1px solid #1f2d45',
                  borderRadius: 16, padding: '1.2rem',
                  animation: 'fadeUp 0.5s 0.3s ease both'
                }}>
                  <h3 style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.8rem' }}>
                    👥 People you might know
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {suggested.slice(0, 4).map(u => (
                      <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {u.avatar
                          ? <img src={u.avatar} alt="av" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                          : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(79,142,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 600, color: '#4f8ef7', flexShrink: 0 }}>{u.firstName?.[0]}{u.lastName?.[0]}</div>
                        }
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.firstName} {u.lastName}</div>
                          <div style={{ fontSize: '0.7rem', color: '#8896b0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.university || 'Student'}</div>
                        </div>
                        <button onClick={() => router.push('/profile/' + u.clerkId)} style={{
                          padding: '0.22rem 0.65rem', borderRadius: 8,
                          border: '1px solid #1f2d45', background: 'transparent',
                          color: '#4f8ef7', cursor: 'pointer', fontSize: '0.7rem',
                          fontFamily: 'inherit', flexShrink: 0
                        }}>View</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Profile Completion */}
              {profile && (() => {
                const fields = [
                  { label: 'Avatar', done: !!profile.avatar },
                  { label: 'Bio', done: !!profile.bio },
                  { label: 'University', done: !!profile.university },
                  { label: 'GitHub', done: !!profile.github },
                  { label: 'LinkedIn', done: !!profile.linkedin },
                  { label: 'First project', done: myProjects.length > 0 },
                ]
                const done = fields.filter(f => f.done).length
                const pct = Math.round((done / fields.length) * 100)
                if (pct === 100) return null
                return (
                  <div style={{
                    background: '#0d1120', border: '1px solid #1f2d45',
                    borderRadius: 16, padding: '1.2rem',
                    animation: 'fadeUp 0.5s 0.35s ease both'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <h3 style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: '0.85rem', fontWeight: 600 }}>
                        Profile Strength
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: '#4f8ef7', fontWeight: 600 }}>{pct}%</span>
                    </div>
                    <div style={{ background: '#1f2d45', borderRadius: 999, height: 5, marginBottom: '0.8rem' }}>
                      <div style={{
                        background: 'linear-gradient(90deg,#4f8ef7,#7c5cfc)',
                        borderRadius: 999, height: 5, width: pct + '%',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                    {fields.filter(f => !f.done).slice(0, 3).map(({ label }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', marginBottom: 4 }}>
                        <span style={{ color: '#8896b0' }}>○</span>
                        <span style={{ color: '#8896b0', flex: 1 }}>Add {label}</span>
                        <span onClick={() => router.push('/settings/profile')} style={{ color: '#4f8ef7', cursor: 'pointer' }}>Fix →</span>
                      </div>
                    ))}
                  </div>
                )
              })()}

            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes float1 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(20px,20px); } }
        @keyframes float2 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(-15px,15px); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

function EmptyState({ icon, title, desc, action, onClick }) {
  return (
    <div style={{
      textAlign: 'center', padding: '4rem 2rem',
      background: '#111827', borderRadius: 20, border: '1px dashed #1f2d45'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
      <h3 style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: '1.2rem', marginBottom: 8 }}>{title}</h3>
      <p style={{ color: '#8896b0', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{desc}</p>
      <button onClick={onClick} style={{
        padding: '0.75rem 2rem', borderRadius: 10, border: 'none',
        background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
        color: '#fff', fontSize: '0.95rem', fontWeight: 500,
        cursor: 'pointer', fontFamily: 'inherit'
      }}>{action}</button>
    </div>
  )
}