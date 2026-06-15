'use client'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import useIsMobile from '@/hooks/useIsMobile'

const TAGS = ['All', 'Web Dev', 'AI/ML', 'DevOps', 'Open Source', 'Career', 'Tutorial', 'Projects']

export default function BlogsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const isMobile = useIsMobile()
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTag, setActiveTag] = useState('All')
  const [sort, setSort] = useState('newest')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (isLoaded && !user) router.push('/')
  }, [isLoaded, user])

  useEffect(() => { fetchBlogs() }, [])

  const fetchBlogs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/blogs')
      const data = await res.json()
      setBlogs(data.blogs || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const filtered = blogs
    .filter(b => {
      const matchTag = activeTag === 'All' || b.tags?.includes(activeTag)
      const matchSearch = !search.trim() ||
        b.title?.toLowerCase().includes(search.toLowerCase()) ||
        b.excerpt?.toLowerCase().includes(search.toLowerCase()) ||
        `${b.author?.firstName} ${b.author?.lastName}`.toLowerCase().includes(search.toLowerCase())
      return matchTag && matchSearch
    })
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
      if (sort === 'popular') return (b.likes?.length || 0) - (a.likes?.length || 0)
      return 0
    })

  function timeAgo(date) {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  const totalLikes = blogs.reduce((s, b) => s + (b.likes?.length || 0), 0)
  const contributors = new Set(blogs.map(b => b.author?._id || b.author?.clerkId)).size

  const featured = filtered[0]
  const rest = filtered.slice(1)

  return (
    <div style={{
      minHeight: '100vh', background: '#06080f',
      fontFamily: 'var(--font-dm), DM Sans, sans-serif'
    }}>
      <Navbar />

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: isMobile ? '1.5rem 1rem' : '2rem 1.5rem' }}>

        {/* Page hero */}
        <div style={{
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid #111827'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-syne), Syne, sans-serif',
                fontSize: isMobile ? '1.4rem' : '1.8rem',
                fontWeight: 800,
                background: 'linear-gradient(120deg,#f0f4ff,#a7c4ff)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em', marginBottom: 6
              }}>
                Student Blogs
              </h1>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: '#4f6070' }}>
                  <span style={{ color: '#f0f4ff', fontWeight: 600 }}>{blogs.length}</span> posts
                </span>
                <span style={{ fontSize: '0.8rem', color: '#4f6070' }}>
                  <span style={{ color: '#ec4899', fontWeight: 600 }}>{totalLikes}</span> likes
                </span>
                <span style={{ fontSize: '0.8rem', color: '#4f6070' }}>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>{contributors}</span> writers
                </span>
              </div>
            </div>
            <button
              onClick={() => router.push('/blogs/new')}
              style={{
                padding: '0.6rem 1.3rem', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
                color: '#fff', cursor: 'pointer', fontSize: '0.88rem',
                fontWeight: 600, fontFamily: 'inherit', flexShrink: 0,
                boxShadow: '0 4px 16px rgba(79,142,247,0.3)',
                transition: 'transform 0.15s, box-shadow 0.15s'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(79,142,247,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(79,142,247,0.3)' }}
            >+ Write a Blog</button>
          </div>
        </div>

        {/* Search + sort */}
        <div style={{ display: 'flex', gap: 10, marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f6070"
              strokeWidth="2.2" strokeLinecap="round"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search blogs..."
              style={{
                width: '100%', padding: '0.65rem 1rem 0.65rem 2.3rem',
                background: '#0d1120', border: '1px solid #1a2540',
                borderRadius: 10, color: '#f0f4ff', fontSize: '0.85rem',
                outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                transition: 'border-color 0.2s, background 0.2s'
              }}
              onFocus={e => { e.target.style.borderColor = '#4f8ef7'; e.target.style.background = '#0f1628' }}
              onBlur={e => { e.target.style.borderColor = '#1a2540'; e.target.style.background = '#0d1120' }}
            />
          </div>

          {/* Sort pill group */}
          <div style={{
            display: 'flex', borderRadius: 10,
            border: '1px solid #1a2540', overflow: 'hidden',
            background: '#0d1120', flexShrink: 0
          }}>
            {[
              { id: 'newest', label: '🕐 Newest' },
              { id: 'popular', label: '❤️ Liked' },
            ].map((f, i) => (
              <button key={f.id} onClick={() => setSort(f.id)} style={{
                padding: '0.6rem 1rem',
                background: sort === f.id ? 'rgba(79,142,247,0.15)' : 'transparent',
                border: 'none',
                borderLeft: i > 0 ? '1px solid #1a2540' : 'none',
                color: sort === f.id ? '#7cb4ff' : '#4f6070',
                cursor: 'pointer', fontSize: '0.8rem',
                fontFamily: 'inherit', fontWeight: sort === f.id ? 600 : 400,
                transition: 'all 0.15s', whiteSpace: 'nowrap'
              }}>{f.label}</button>
            ))}
          </div>
        </div>

        {/* Tag filters */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {TAGS.map(tag => (
            <button key={tag} onClick={() => setActiveTag(tag)} style={{
              padding: '0.32rem 0.85rem', borderRadius: 999,
              border: activeTag === tag ? '1px solid rgba(79,142,247,0.4)' : '1px solid #1a2540',
              background: activeTag === tag ? 'rgba(79,142,247,0.12)' : '#0d1120',
              color: activeTag === tag ? '#7cb4ff' : '#4f6070',
              cursor: 'pointer', fontSize: '0.76rem',
              fontFamily: 'inherit', transition: 'all 0.15s',
              fontWeight: activeTag === tag ? 600 : 400
            }}>{tag}</button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{
                height: 110, borderRadius: 12,
                background: 'linear-gradient(90deg,#0d1120 25%,#0f1628 50%,#0d1120 75%)',
                backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite'
              }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '4rem 2rem',
            background: '#0a0f1a', borderRadius: 16,
            border: '1px dashed #1a2540'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📝</div>
            <p style={{ color: '#8896b0', fontSize: '0.95rem', marginBottom: 4 }}>
              {search ? `No results for "${search}"` : 'No blogs yet'}
            </p>
            <p style={{ color: '#4f6070', fontSize: '0.82rem', marginBottom: '1.2rem' }}>
              {search ? 'Try different keywords' : 'Be the first to share your journey!'}
            </p>
            {!search && (
              <button onClick={() => router.push('/blogs/new')} style={{
                padding: '0.6rem 1.4rem', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
                color: '#fff', fontSize: '0.88rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit'
              }}>Write the first blog</button>
            )}
          </div>
        ) : (
          <>
            {/* Featured */}
            {featured && (
              <div
                onClick={() => router.push('/blogs/' + featured._id)}
                style={{
                  display: 'flex', flexDirection: isMobile ? 'column' : 'row',
                  gap: 0, alignItems: 'stretch',
                  background: '#0a0f1a', border: '1px solid rgba(79,142,247,0.2)',
                  borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
                  marginBottom: '1.5rem',
                  borderLeft: '3px solid #4f8ef7',
                  transition: 'border-color 0.18s, background 0.18s'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(79,142,247,0.5)'; e.currentTarget.style.background = '#0d1322' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(79,142,247,0.2)'; e.currentTarget.style.background = '#0a0f1a' }}
              >
                {featured.coverImage && (
                  <div style={{
                    flexShrink: 0,
                    width: isMobile ? '100%' : 280,
                    height: isMobile ? 160 : 'auto',
                    overflow: 'hidden'
                  }}>
                    <img src={featured.coverImage} alt={featured.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ padding: isMobile ? '1.2rem' : '1.4rem 1.6rem', flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'inline-block', marginBottom: 8,
                    background: 'rgba(79,142,247,0.1)',
                    border: '1px solid rgba(79,142,247,0.25)',
                    padding: '2px 10px', borderRadius: 999,
                    fontSize: '0.68rem', color: '#7cb4ff', fontWeight: 600
                  }}>✨ Featured</div>
                  <h2 style={{
                    fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: 600,
                    color: '#c8d8f8', marginBottom: 6, lineHeight: 1.4,
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>{featured.title}</h2>
                  <p style={{
                    color: '#3d5070', fontSize: '0.82rem', lineHeight: 1.6,
                    marginBottom: 10,
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>{featured.excerpt || featured.content?.slice(0, 180)}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {featured.tags?.slice(0, 2).map(tag => (
                      <span key={tag} style={{
                        padding: '2px 8px', borderRadius: 5, fontSize: '0.68rem',
                        background: 'rgba(52,211,153,0.07)', color: '#5fcf9f',
                        border: '1px solid rgba(52,211,153,0.15)'
                      }}>{tag}</span>
                    ))}
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.78rem', color: '#ec4899' }}>❤️ {featured.likes?.length || 0}</span>
                      {featured.author?.avatar
                        ? <img src={featured.author.avatar} alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
                        : <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(79,142,247,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#4f8ef7', fontWeight: 700 }}>{featured.author?.firstName?.[0]}</div>
                      }
                      <span style={{ fontSize: '0.72rem', color: '#2d3a50' }}>
                        {featured.author?.firstName} · {featured.readTime || 5} min
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rest — list rows in q&a card style */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rest.map((blog) => (
                <div
                  key={blog._id}
                  onClick={() => router.push('/blogs/' + blog._id)}
                  style={{
                    display: 'flex', gap: 14, alignItems: 'center',
                    padding: '1rem 1.1rem',
                    background: '#0a0f1a',
                    border: '1px solid #111827',
                    borderRadius: 12, cursor: 'pointer',
                    transition: 'border-color 0.18s, background 0.18s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(79,142,247,0.35)'; e.currentTarget.style.background = '#0d1322' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#111827'; e.currentTarget.style.background = '#0a0f1a' }}
                >
                  {/* Cover thumb or icon */}
                  <div style={{
                    flexShrink: 0, width: 64, height: 64,
                    borderRadius: 10, overflow: 'hidden',
                    background: blog.coverImage ? 'transparent' : 'rgba(79,142,247,0.08)',
                    border: blog.coverImage ? 'none' : '1px solid rgba(79,142,247,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {blog.coverImage
                      ? <img src={blog.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: '1.4rem' }}>📝</span>}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      fontSize: '0.95rem', fontWeight: 600,
                      color: '#c8d8f8', marginBottom: 4, lineHeight: 1.45,
                      display: '-webkit-box', WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>{blog.title}</h3>
                    <p style={{
                      fontSize: '0.78rem', color: '#3d5070',
                      marginBottom: 6, lineHeight: 1.55,
                      display: '-webkit-box', WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>{blog.excerpt || blog.content?.slice(0, 120)}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                      {blog.tags?.slice(0, 2).map(tag => (
                        <span key={tag} style={{
                          padding: '2px 8px', borderRadius: 5, fontSize: '0.68rem',
                          background: 'rgba(52,211,153,0.07)', color: '#5fcf9f',
                          border: '1px solid rgba(52,211,153,0.15)'
                        }}>{tag}</span>
                      ))}
                      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {blog.author?.avatar
                          ? <img src={blog.author.avatar} alt="" style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }} />
                          : <div style={{
                              width: 18, height: 18, borderRadius: '50%',
                              background: 'rgba(79,142,247,0.12)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.55rem', color: '#4f8ef7', fontWeight: 700
                            }}>{blog.author?.firstName?.[0]}</div>
                        }
                        <span style={{ fontSize: '0.7rem', color: '#2d3a50' }}>
                          {blog.author?.firstName}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: '#1e2a3a' }}>·</span>
                        <span style={{ fontSize: '0.7rem', color: '#2d3a50' }}>{timeAgo(blog.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Likes + read time */}
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 8, flexShrink: 0, width: 48
                  }}>
                    <div style={{
                      textAlign: 'center',
                      background: (blog.likes?.length || 0) > 0 ? 'rgba(236,72,153,0.08)' : 'transparent',
                      border: `1px solid ${(blog.likes?.length || 0) > 0 ? 'rgba(236,72,153,0.2)' : '#1a2540'}`,
                      borderRadius: 8, padding: '4px 6px', width: '100%'
                    }}>
                      <div style={{
                        fontSize: '1rem', fontWeight: 700, lineHeight: 1,
                        color: (blog.likes?.length || 0) > 0 ? '#ec4899' : '#2d3a50',
                        fontFamily: 'var(--font-syne), Syne, sans-serif'
                      }}>{blog.likes?.length || 0}</div>
                      <div style={{ fontSize: '0.6rem', color: '#2d3a50', marginTop: 2 }}>likes</div>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#2d3a50', textAlign: 'center' }}>
                      {blog.readTime || 5}m read
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <p style={{
            textAlign: 'center', marginTop: '1.5rem',
            fontSize: '0.78rem', color: '#1e2a3a'
          }}>{filtered.length} of {blogs.length} blogs</p>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
      `}</style>
    </div>
  )
}