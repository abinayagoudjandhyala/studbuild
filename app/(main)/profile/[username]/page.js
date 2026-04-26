'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Navbar from '@/components/layout/Navbar'

const quotes = [
  { min: 0, text: "Every expert was once a beginner. Keep building! 🌱" },
  { min: 5, text: "You're consistently shipping. That's what separates builders from dreamers! 🚀" },
  { min: 10, text: "10+ repos? You're in the top tier of student developers! 🔥" },
  { min: 20, text: "Prolific builder! Your GitHub is a testament to your dedication 💪" },
  { min: 50, text: "Legendary contributor! You're an inspiration to other students 🏆" },
]

function getQuote(repos) {
  const matched = quotes.filter(q => repos >= q.min)
  return matched[matched.length - 1]?.text || quotes[0].text
}

export default function ProfilePage() {
  const { user: currentUser, isLoaded } = useUser()
  const router = useRouter()
  const params = useParams()
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [githubStats, setGithubStats] = useState(null)
  const [following, setFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followLoading, setFollowLoading] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (params.username) fetchProfile()
  }, [params.username])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/users/' + params.username)
      const data = await res.json()
      setProfile(data.user)
      setProjects(data.projects || [])
      setFollowersCount(data.user?.followers?.length || 0)
      if (data.user?.github) fetchGithubStats(data.user.github)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchGithubStats = async (username) => {
    try {
      const res = await fetch('/api/github/' + username)
      const data = await res.json()
      if (!data.error) setGithubStats(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleFollow = async () => {
    if (!currentUser || followLoading) return
    setFollowLoading(true)
    try {
      const res = await fetch('/api/users/' + params.username + '/follow', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setFollowing(data.following)
        setFollowersCount(data.followersCount)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setFollowLoading(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/users/avatar', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) setProfile(p => ({ ...p, avatar: data.url }))
    } catch (err) {
      console.error(err)
    } finally {
      setAvatarUploading(false)
    }
  }

  const openEdit = () => {
    setEditForm({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      bio: profile?.bio || '',
      university: profile?.university || '',
      github: profile?.github || '',
      linkedin: profile?.linkedin || '',
      leetcode: profile?.leetcode || '',
      portfolio: profile?.portfolio || '',
    })
    setEditOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/users/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editForm, skills: profile?.skills || [], graduationYear: profile?.graduationYear || '' }),
      })
      const data = await res.json()
      if (data.success) {
        setProfile(p => ({ ...p, ...editForm }))
        setEditOpen(false)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const projectTechs = [...new Set(projects.flatMap(p => p.tags || []))]
  const allSkills = [...new Set([...(profile?.skills || []), ...projectTechs])]
  const totalLikes = projects.reduce((sum, p) => sum + (p.likes?.length || 0), 0)
  const isOwnProfile = currentUser?.id === profile?.clerkId

  const inputStyle = {
    width: '100%', padding: '0.65rem 0.9rem', borderRadius: 10,
    border: '1px solid #1f2d45', background: '#0d1120',
    color: '#f0f4ff', fontSize: '0.9rem', outline: 'none',
    fontFamily: 'inherit', marginTop: 4
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#06080f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8896b0' }}>
      Loading profile...
    </div>
  )

  if (!profile) return (
    <div style={{ minHeight: '100vh', background: '#06080f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8896b0' }}>
      User not found
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#06080f', fontFamily: 'var(--font-dm), DM Sans, sans-serif' }}>
      <Navbar />

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '3rem 2rem' }}>

        {/* Profile Header */}
        <div style={{
          background: 'linear-gradient(135deg,rgba(79,142,247,0.06),rgba(167,139,250,0.04))',
          border: '1px solid rgba(79,142,247,0.15)',
          borderRadius: 24, padding: '2rem', marginBottom: '1.5rem',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle,rgba(167,139,250,0.08),transparent)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap', position: 'relative' }}>

            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {profile.avatar ? (
                <img src={profile.avatar} alt="avatar"
                  onClick={() => isOwnProfile && document.getElementById('profile-avatar-upload').click()}
                  style={{
                    width: 90, height: 90, borderRadius: '50%', objectFit: 'cover',
                    border: isOwnProfile ? '3px solid rgba(79,142,247,0.5)' : '2px solid rgba(79,142,247,0.2)',
                    cursor: isOwnProfile ? 'pointer' : 'default',
                    boxShadow: '0 0 20px rgba(79,142,247,0.15)'
                  }} />
              ) : (
                <div onClick={() => isOwnProfile && document.getElementById('profile-avatar-upload').click()}
                  style={{
                    width: 90, height: 90, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.8rem', fontWeight: 700, color: '#fff',
                    cursor: isOwnProfile ? 'pointer' : 'default',
                    boxShadow: '0 0 20px rgba(79,142,247,0.2)'
                  }}>
                  {profile.firstName?.[0]}{profile.lastName?.[0]}
                </div>
              )}
              {isOwnProfile && (
                <>
                  <div onClick={() => document.getElementById('profile-avatar-upload').click()}
                    style={{
                      position: 'absolute', inset: 0, borderRadius: '50%',
                      background: 'rgba(0,0,0,0.55)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: avatarUploading ? 1 : 0, transition: 'opacity 0.2s',
                      cursor: 'pointer', fontSize: '1.3rem'
                    }}
                    onMouseEnter={e => { if (!avatarUploading) e.currentTarget.style.opacity = 1 }}
                    onMouseLeave={e => { if (!avatarUploading) e.currentTarget.style.opacity = 0 }}>
                    {avatarUploading ? '⏳' : '📷'}
                  </div>
                  <input id="profile-avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                </>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: 'clamp(1.3rem,3vw,1.6rem)', fontWeight: 700 }}>
                  {profile.firstName} {profile.lastName}
                </h1>
                {isOwnProfile && (
                  <button onClick={openEdit} style={{
                    padding: '0.3rem 0.8rem', borderRadius: 8, fontSize: '0.78rem',
                    border: '1px solid rgba(79,142,247,0.3)', background: 'rgba(79,142,247,0.08)',
                    color: '#4f8ef7', cursor: 'pointer', fontFamily: 'inherit'
                  }}>✏️ Edit</button>
                )}
              </div>

              {profile.university && (
                <div style={{ color: '#8896b0', fontSize: '0.88rem', marginBottom: 8 }}>
                  🎓 {profile.university}{profile.graduationYear && ' · Class of ' + profile.graduationYear}
                </div>
              )}

              {profile.bio && (
                <p style={{ color: '#8896b0', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '1rem', maxWidth: 500 }}>
                  {profile.bio}
                </p>
              )}

              {/* Social Links */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {profile.github && (
                  <a href={'https://github.com/' + profile.github} target="_blank" rel="noreferrer"
                    style={{ padding: '0.3rem 0.9rem', borderRadius: 8, fontSize: '0.8rem', border: '1px solid #1f2d45', color: '#f0f4ff', textDecoration: 'none' }}>
                    ⚡ GitHub
                  </a>
                )}
                {profile.linkedin && (
                  <a href={profile.linkedin.startsWith('http') ? profile.linkedin : 'https://' + profile.linkedin} target="_blank" rel="noreferrer"
                    style={{ padding: '0.3rem 0.9rem', borderRadius: 8, fontSize: '0.8rem', border: '1px solid #1f2d45', color: '#0a66c2', textDecoration: 'none' }}>
                    💼 LinkedIn
                  </a>
                )}
                {profile.leetcode && (
                  <a href={'https://leetcode.com/' + profile.leetcode} target="_blank" rel="noreferrer"
                    style={{ padding: '0.3rem 0.9rem', borderRadius: 8, fontSize: '0.8rem', border: '1px solid #1f2d45', color: '#f89820', textDecoration: 'none' }}>
                    ⚔️ LeetCode
                  </a>
                )}
                {profile.portfolio && (
                  <a href={profile.portfolio.startsWith('http') ? profile.portfolio : 'https://' + profile.portfolio} target="_blank" rel="noreferrer"
                    style={{ padding: '0.3rem 0.9rem', borderRadius: 8, fontSize: '0.8rem', border: '1px solid #1f2d45', color: '#34d399', textDecoration: 'none' }}>
                    🌐 Portfolio
                  </a>
                )}
              </div>
            </div>

            {/* Stats + Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', gap: 20 }}>
                {[
                  { label: 'Projects', value: projects.length },
                  { label: 'Followers', value: followersCount },
                  { label: 'Likes', value: totalLikes },
                ].map(({ label, value }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{
                      fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: '1.4rem', fontWeight: 700,
                      background: 'linear-gradient(120deg,#4f8ef7,#a78bfa)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>{value}</div>
                    <div style={{ fontSize: '0.72rem', color: '#8896b0' }}>{label}</div>
                  </div>
                ))}
              </div>

              {!isOwnProfile && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleFollow} disabled={followLoading} style={{
                    padding: '0.5rem 1.2rem', borderRadius: 10,
                    border: '1px solid ' + (following ? '#4f8ef7' : '#1f2d45'),
                    background: following ? 'rgba(79,142,247,0.1)' : 'transparent',
                    color: following ? '#4f8ef7' : '#f0f4ff',
                    cursor: 'pointer', fontSize: '0.88rem', fontFamily: 'inherit'
                  }}>
                    {followLoading ? '...' : following ? '✓ Following' : '+ Follow'}
                  </button>
                  <button onClick={async () => {
                    const res = await fetch('/api/conversations', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ targetClerkId: profile.clerkId }),
                    })
                    const data = await res.json()
                    if (data.conversation) router.push('/messages?with=' + profile.clerkId)
                  }} style={{
                    padding: '0.5rem 1.2rem', borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
                    color: '#fff', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500, fontFamily: 'inherit'
                  }}>💬 Message</button>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(79,142,247,0.1)' }}>
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
    <div style={{ fontSize: '0.75rem', color: '#8896b0', fontWeight: 500, letterSpacing: '0.08em' }}>
      SKILLS & TECH STACK
    </div>
    {isOwnProfile && (
      <button onClick={openEdit} style={{
        padding: '0.2rem 0.7rem', borderRadius: 8, fontSize: '0.72rem',
        border: '1px solid rgba(79,142,247,0.3)',
        background: 'rgba(79,142,247,0.08)',
        color: '#4f8ef7', cursor: 'pointer', fontFamily: 'inherit'
      }}>+ Add Skills</button>
    )}
  </div>
  {allSkills.length > 0 ? (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {allSkills.map(skill => (
        <span key={skill} style={{
          padding: '0.3rem 0.8rem', borderRadius: 999, fontSize: '0.8rem',
          background: 'rgba(79,142,247,0.08)', color: '#4f8ef7',
          border: '1px solid rgba(79,142,247,0.2)'
        }}>{skill}</span>
      ))}
    </div>
  ) : (
    <p style={{ color: '#8896b0', fontSize: '0.85rem' }}>
      No skills added yet.
      {isOwnProfile && (
        <span onClick={openEdit} style={{ color: '#4f8ef7', cursor: 'pointer', marginLeft: 6 }}>
          Add skills →
        </span>
      )}
    </p>
  )}
</div>
        </div>

        {/* GitHub Stats */}
        {githubStats && (
          <div style={{
            background: '#111827', border: '1px solid #1f2d45',
            borderRadius: 20, padding: '1.5rem', marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
              <div style={{ fontSize: '1.2rem' }}>⚡</div>
              <h2 style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: '1rem', fontWeight: 600 }}>
                GitHub Activity
              </h2>
              <a href={githubStats.profileUrl} target="_blank" rel="noreferrer"
                style={{ marginLeft: 'auto', color: '#4f8ef7', fontSize: '0.82rem', textDecoration: 'none' }}>
                View on GitHub
              </a>
            </div>

            <div style={{
              background: 'rgba(79,142,247,0.06)', border: '1px solid rgba(79,142,247,0.15)',
              borderRadius: 12, padding: '0.8rem 1rem', marginBottom: '1.2rem',
              fontSize: '0.88rem', color: '#8896b0', fontStyle: 'italic'
            }}>
              "{getQuote(githubStats.publicRepos)}"
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: '1.2rem' }}>
              {[
                { label: 'Public Repos', value: githubStats.publicRepos, icon: '📁' },
                { label: 'Total Stars', value: githubStats.totalStars, icon: '⭐' },
                { label: 'Followers', value: githubStats.followers, icon: '👥' },
                { label: 'Following', value: githubStats.following, icon: '➕' },
              ].map(({ label, value, icon }) => (
                <div key={label} style={{
                  background: '#0d1120', borderRadius: 12, padding: '1rem',
                  border: '1px solid #1f2d45', textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>{icon}</div>
                  <div style={{
                    fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: '1.3rem', fontWeight: 700,
                    background: 'linear-gradient(120deg,#4f8ef7,#a78bfa)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                  }}>{value}</div>
                  <div style={{ fontSize: '0.72rem', color: '#8896b0', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>

            {githubStats.languages?.length > 0 && (
              <div>
                <div style={{ fontSize: '0.75rem', color: '#8896b0', marginBottom: 8 }}>TOP LANGUAGES</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {githubStats.languages.map(lang => (
                    <span key={lang} style={{
                      padding: '0.3rem 0.8rem', borderRadius: 999, fontSize: '0.8rem',
                      background: '#0d1120', color: '#f0f4ff', border: '1px solid #1f2d45'
                    }}>{lang}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
          {[
            { icon: '🚀', label: 'Projects Built', value: projects.length, color: '#4f8ef7' },
            { icon: '❤️', label: 'Total Likes', value: totalLikes, color: '#ec4899' },
            { icon: '👥', label: 'Followers', value: followersCount, color: '#a78bfa' },
            { icon: '🛠️', label: 'Tech Used', value: projectTechs.length, color: '#34d399' },
          ].map(({ icon, label, value, color }) => (
            <div key={label} style={{
              background: '#111827', border: '1px solid #1f2d45',
              borderRadius: 16, padding: '1.2rem', textAlign: 'center',
              transition: 'border-color 0.2s'
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = color + '40'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1f2d45'}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{icon}</div>
              <div style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: '1.6rem', fontWeight: 700, color, marginBottom: 4 }}>{value}</div>
              <div style={{ fontSize: '0.75rem', color: '#8896b0' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Projects */}
        <h2 style={{
          fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: '1.1rem',
          fontWeight: 600, marginBottom: '1.2rem',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          Projects
          <span style={{
            fontSize: '0.8rem', padding: '0.2rem 0.7rem', borderRadius: 999,
            background: 'rgba(79,142,247,0.1)', color: '#4f8ef7',
            border: '1px solid rgba(79,142,247,0.2)'
          }}>{projects.length}</span>
        </h2>

        {projects.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '3rem',
            background: '#111827', borderRadius: 16, border: '1px dashed #1f2d45'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🏗️</div>
            <p style={{ color: '#8896b0' }}>No projects uploaded yet</p>
            {isOwnProfile && (
              <button onClick={() => router.push('/projects/new')} style={{
                marginTop: '1rem', padding: '0.6rem 1.5rem', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
                color: '#fff', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, fontFamily: 'inherit'
              }}>+ Upload your first project</button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
            {projects.map(project => (
              <div key={project._id}
                onClick={() => router.push('/projects/' + project._id)}
                style={{
                  background: '#111827', border: '1px solid #1f2d45',
                  borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                  transition: 'transform 0.3s, border-color 0.3s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.borderColor = 'rgba(79,142,247,0.4)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = '#1f2d45'
                }}
              >
                <div style={{
                  height: 140, background: project.coverImage ? 'transparent' : '#1a2a4a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                }}>
                  {project.coverImage ? (
                    <img src={project.coverImage} alt={project.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ fontSize: '2.5rem' }}>🚀</div>
                  )}
                </div>
                <div style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                    {project.tags?.slice(0, 2).map(tag => (
                      <span key={tag} style={{
                        padding: '0.15rem 0.5rem', borderRadius: 6, fontSize: '0.7rem',
                        background: 'rgba(79,142,247,0.12)', color: '#4f8ef7',
                        border: '1px solid rgba(79,142,247,0.2)'
                      }}>{tag}</span>
                    ))}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: '0.92rem',
                    fontWeight: 600, marginBottom: 4,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>{project.title}</div>
                  <div style={{
                    fontSize: '0.8rem', color: '#8896b0',
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>{project.description}</div>
                  <div style={{ marginTop: 8, fontSize: '0.75rem', color: '#8896b0' }}>
                    ❤️ {project.likes?.length || 0} likes
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
 
      </div>
      

      {/* Edit Modal */}
      {editOpen && (
        <div onClick={() => setEditOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#111827', border: '1px solid #1f2d45',
            borderRadius: 20, padding: '2rem', width: '100%',
            maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', position: 'relative'
          }}>
            <button onClick={() => setEditOpen(false)} style={{
              position: 'absolute', top: '1rem', right: '1rem',
              background: 'transparent', border: 'none',
              color: '#8896b0', cursor: 'pointer', fontSize: '1.3rem'
            }}>✕</button>

            <h2 style={{
              fontFamily: 'var(--font-syne), Syne, sans-serif',
              fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem'
            }}>Edit Profile ✏️</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#8896b0' }}>First Name</label>
                  <input value={editForm.firstName || ''} onChange={e => setEditForm(p => ({ ...p, firstName: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#8896b0' }}>Last Name</label>
                  <input value={editForm.lastName || ''} onChange={e => setEditForm(p => ({ ...p, lastName: e.target.value }))} style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#8896b0' }}>Bio</label>
                <textarea rows={3} value={editForm.bio || ''} onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#8896b0' }}>University</label>
                <input value={editForm.university || ''} onChange={e => setEditForm(p => ({ ...p, university: e.target.value }))} style={inputStyle} />
              </div>
              {/* Skills in edit modal */}
<div>
  <label style={{ fontSize: '0.78rem', color: '#8896b0' }}>Skills</label>
  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
    <input
      placeholder="Add a skill..."
      id="skill-input-modal"
      onKeyDown={e => {
        if (e.key === 'Enter') {
          const val = e.target.value.trim()
          if (val && !profile?.skills?.includes(val)) {
            handleSave({ ...editForm, extraSkill: val })
          }
          e.target.value = ''
        }
      }}
      style={{
        flex: 1, padding: '0.55rem 0.9rem', borderRadius: 10,
        border: '1px solid #1f2d45', background: '#0d1120',
        color: '#f0f4ff', fontSize: '0.85rem', outline: 'none',
        fontFamily: 'inherit'
      }}
    />
  </div>
  {profile?.skills?.length > 0 && (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
      {profile.skills.map(skill => (
        <span key={skill} style={{
          padding: '0.25rem 0.7rem', borderRadius: 999, fontSize: '0.78rem',
          background: 'rgba(79,142,247,0.1)', color: '#4f8ef7',
          border: '1px solid rgba(79,142,247,0.2)',
          display: 'flex', alignItems: 'center', gap: 5
        }}>
          {skill}
        </span>
      ))}
    </div>
  )}
</div>

              {[
                { field: 'github', label: 'GitHub username' },
                { field: 'linkedin', label: 'LinkedIn URL' },
                { field: 'leetcode', label: 'LeetCode username' },
                { field: 'portfolio', label: 'Portfolio URL' },
                
              ].map(({ field, label }) => (
                <div key={field}>
                  <label style={{ fontSize: '0.78rem', color: '#8896b0' }}>{label}</label>
                  <input value={editForm[field] || ''} onChange={e => setEditForm(p => ({ ...p, [field]: e.target.value }))} style={inputStyle} />
                </div>
              ))}

              <button onClick={handleSave} disabled={saving} style={{
                width: '100%', padding: '0.8rem', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
                color: '#fff', fontSize: '0.95rem', fontWeight: 500,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1, fontFamily: 'inherit', marginTop: 4
              }}>{saving ? 'Saving...' : 'Save Changes ✓'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}