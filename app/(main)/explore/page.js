'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import useIsMobile from '@/hooks/useIsMobile'
const categories = ['Trending', 'Newest', 'Most Liked', 'Most Viewed']
const languages = [
  'All', 'React', 'Next.js', 'Python', 'Node.js', 'Flutter',
  'TypeScript', 'Go', 'Java', 'Vue', 'Rust', 'C++', 'Firebase'
]

export default function ExplorePage() {
  const router = useRouter()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('Trending')
  const [language, setLanguage] = useState('All')
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [searching, setSearching] = useState(false)
const isMobile = useIsMobile()
  useEffect(() => {
    fetchProjects()
  }, [category, language])

  useEffect(() => {
    if (search.trim() === '') {
      setSearchResults(null)
      return
    }
    const timer = setTimeout(() => handleSearch(), 500)
    return () => clearTimeout(timer)
  }, [search])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (language !== 'All') params.append('tag', language)
      params.append('sort', category)
      params.append('limit', '12')

      const res = await fetch(`/api/projects?${params}`)
      const data = await res.json()
      setProjects(data.projects || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!search.trim()) return
    setSearching(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(search)}`)
      const data = await res.json()
      setSearchResults(data)
    } catch (err) {
      console.error(err)
    } finally {
      setSearching(false)
    }
  }

  const displayProjects = searchResults ? searchResults.projects : projects

  return (
    <div style={{
      minHeight: '100vh', background: '#06080f',
      fontFamily: 'var(--font-dm), DM Sans, sans-serif'
    }}>
      <Navbar />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-syne), Syne, sans-serif',
            fontSize: '2rem', fontWeight: 700, marginBottom: 8
          }}>Explore 🔍</h1>
          <p style={{ color: '#8896b0', fontSize: '0.9rem' }}>
            Discover the best student projects from around the world
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Search projects, users, technologies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '0.9rem 1.2rem 0.9rem 3rem',
              borderRadius: 12, border: '1px solid #1f2d45',
              background: '#111827', color: '#f0f4ff',
              fontSize: '0.95rem', outline: 'none',
              fontFamily: 'inherit', transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = '#4f8ef7'}
            onBlur={e => e.target.style.borderColor = '#1f2d45'}
          />
          <span style={{
            position: 'absolute', left: '1rem', top: '50%',
            transform: 'translateY(-50%)', fontSize: '1rem', color: '#8896b0'
          }}>🔍</span>
          {searching && (
            <span style={{
              position: 'absolute', right: '1rem', top: '50%',
              transform: 'translateY(-50%)', fontSize: '0.8rem', color: '#4f8ef7'
            }}>Searching...</span>
          )}
        </div>

        {/* Search Results */}
        {searchResults && (
          <div style={{ marginBottom: '2rem' }}>
            {/* Users Results */}
            {searchResults.users?.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{
                  fontFamily: 'var(--font-syne), Syne, sans-serif',
                  fontSize: '1rem', fontWeight: 600,
                  marginBottom: '1rem', color: '#8896b0'
                }}>USERS ({searchResults.users.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {searchResults.users.map(u => (
                    <div
                      key={u._id}
                      onClick={() => router.push(`/profile/${u.clerkId}`)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '0.9rem 1.2rem',
                        background: '#111827', border: '1px solid #1f2d45',
                        borderRadius: 12, cursor: 'pointer',
                        transition: 'border-color 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(79,142,247,0.4)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#1f2d45'}
                    >
                      {u.avatar ? (
                        <img src={u.avatar} alt="avatar"
                          style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%',
                          background: 'rgba(79,142,247,0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.9rem', fontWeight: 600, color: '#4f8ef7'
                        }}>{u.firstName?.[0]}{u.lastName?.[0]}</div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: '0.92rem' }}>
                          {u.firstName} {u.lastName}
                        </div>
                        <div style={{ color: '#8896b0', fontSize: '0.8rem' }}>
                          {u.university || 'Student'} · {u.skills?.slice(0, 3).join(', ')}
                        </div>
                      </div>
                      <div style={{ color: '#4f8ef7', fontSize: '0.82rem' }}>View →</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects Results Header */}
            {searchResults.projects?.length > 0 && (
              <h3 style={{
                fontFamily: 'var(--font-syne), Syne, sans-serif',
                fontSize: '1rem', fontWeight: 600,
                marginBottom: '1rem', color: '#8896b0'
              }}>PROJECTS ({searchResults.projects.length})</h3>
            )}

            {searchResults.projects?.length === 0 && searchResults.users?.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#8896b0' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🔍</div>
                <p>No results found for "{search}"</p>
              </div>
            )}
          </div>
        )}

        {/* Filters — only show when not searching */}
        {!searchResults && (
          <>
            {/* Category Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: '1.2rem', flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)} style={{
                  padding: '0.5rem 1.2rem', borderRadius: 999, fontSize: '0.88rem',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                  border: `1px solid ${category === cat ? '#4f8ef7' : '#1f2d45'}`,
                  background: category === cat ? 'rgba(79,142,247,0.1)' : 'transparent',
                  color: category === cat ? '#4f8ef7' : '#8896b0',
                }}>{cat}</button>
              ))}
            </div>

            {/* Language Filter */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '2rem' }}>
              {languages.map(lang => (
                <button key={lang} onClick={() => setLanguage(lang)} style={{
                  padding: '0.35rem 0.9rem', borderRadius: 999, fontSize: '0.82rem',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                  border: `1px solid ${language === lang ? '#a78bfa' : '#1f2d45'}`,
                  background: language === lang ? 'rgba(167,139,250,0.1)' : 'transparent',
                  color: language === lang ? '#a78bfa' : '#8896b0',
                }}>{lang}</button>
              ))}
            </div>
          </>
        )}

        {/* Projects Grid */}
        {loading ? (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.2rem'
          }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                background: '#111827', border: '1px solid #1f2d45',
                borderRadius: 16, overflow: 'hidden'
              }}>
                <div style={{ height: 160, background: '#1f2d45', animation: 'pulse 1.5s infinite' }} />
                <div style={{ padding: '1rem' }}>
                  <div style={{ height: 14, background: '#1f2d45', borderRadius: 6, marginBottom: 8, width: '60%' }} />
                  <div style={{ height: 12, background: '#1f2d45', borderRadius: 6, width: '90%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : displayProjects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏗️</div>
            <h3 style={{
              fontFamily: 'var(--font-syne), Syne, sans-serif',
              fontSize: '1.3rem', marginBottom: 8
            }}>No projects found</h3>
            <p style={{ color: '#8896b0', fontSize: '0.9rem' }}>
              Try a different filter or be the first to upload!
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.2rem'
          }}>
            {displayProjects.map(project => (
              <ProjectCard key={project._id} project={project} router={router} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

function ProjectCard({ project, router }) {
  const bgColors = ['#1a2a4a', '#1a3a2a', '#3a1a2a', '#2a1a3a', '#1a3a3a', '#2a2a1a']
  const bg = bgColors[Math.abs(project._id?.charCodeAt(0) || 0) % bgColors.length]

  return (
    <div
      onClick={() => router.push(`/projects/${project._id}`)}
      style={{
        background: '#111827', border: '1px solid #1f2d45',
        borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
        transition: 'transform 0.3s, border-color 0.3s'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-5px)'
        e.currentTarget.style.borderColor = 'rgba(79,142,247,0.4)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = '#1f2d45'
      }}
    >
      <div style={{
        height: 160, overflow: 'hidden',
        background: project.coverImage ? 'transparent' : bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {project.coverImage ? (
          <img src={project.coverImage} alt={project.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ fontSize: '3rem' }}>🚀</div>
        )}
      </div>
      <div style={{ padding: '1rem 1.2rem' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          {project.tags?.slice(0, 3).map(tag => (
            <span key={tag} style={{
              padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.72rem',
              fontWeight: 500, background: 'rgba(79,142,247,0.12)',
              color: '#4f8ef7', border: '1px solid rgba(79,142,247,0.2)'
            }}>{tag}</span>
          ))}
        </div>
        <div style={{
          fontFamily: 'var(--font-syne), Syne, sans-serif',
          fontSize: '0.95rem', fontWeight: 600, marginBottom: 4,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
        }}>{project.title}</div>
        <div style={{
          fontSize: '0.82rem', color: '#8896b0', marginBottom: 10,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>{project.description}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: 'rgba(79,142,247,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.65rem', fontWeight: 600, color: '#4f8ef7'
          }}>
            {project.author?.firstName?.[0]}{project.author?.lastName?.[0]}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#8896b0', flex: 1 }}>
            {project.author?.firstName} {project.author?.lastName}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#ec4899' }}>
            ❤️ {project.likes?.length || 0}
          </span>
        </div>
      </div>
    </div>
  )
}