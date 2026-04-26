'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Navbar from '@/components/layout/Navbar'
export default function EditProfilePage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [profile, setProfile] = useState(null)
  const [editField, setEditField] = useState(null)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    university: '',
    graduationYear: '',
    github: '',
    linkedin: '',
    leetcode: '',
    portfolio: '',
    skills: [],
  })

  const skills = [
    'React', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Express',
    'Python', 'Django', 'FastAPI', 'Java', 'Spring', 'Go',
    'Rust', 'TypeScript', 'MongoDB', 'PostgreSQL', 'MySQL',
    'Firebase', 'Flutter', 'React Native', 'Swift', 'Kotlin',
    'Docker', 'AWS', 'GraphQL', 'Redis', 'C++', 'C#'
  ]

  useEffect(() => {
    if (isLoaded && user) fetchProfile()
  }, [isLoaded, user])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users/me')
      const data = await res.json()
      if (data.user) {
        setProfile(data.user)
        setForm({
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          bio: data.user.bio || '',
          university: data.user.university || '',
          graduationYear: data.user.graduationYear || '',
          github: data.user.github || '',
          linkedin: data.user.linkedin || '',
          leetcode: data.user.leetcode || '',
          portfolio: data.user.portfolio || '',
          skills: data.user.skills || [],
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.url) {
        setProfile(p => ({ ...p, avatar: data.url }))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/users/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, clerkId: user.id }),
      })
      const data = await res.json()
      if (data.success) {
        setEditField(null)
        fetchProfile()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const toggleSkill = (skill) => {
    setForm(p => ({
      ...p,
      skills: p.skills.includes(skill)
        ? p.skills.filter(s => s !== skill)
        : [...p.skills, skill]
    }))
  }

  const inputStyle = {
    width: '100%', padding: '0.7rem 1rem', borderRadius: 10,
    border: '1px solid #1f2d45', background: '#0d1120',
    color: '#f0f4ff', fontSize: '0.92rem', outline: 'none',
    fontFamily: 'inherit', marginTop: 6,
  }

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: '#06080f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#8896b0'
    }}>Loading...</div>
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
          fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem'
        }}>Edit Profile</h1>
        <p style={{ color: '#8896b0', marginBottom: '2.5rem', fontSize: '0.9rem' }}>
          Click any field to edit it
        </p>

        {/* Avatar Section */}
        <div style={{
          background: '#111827', border: '1px solid #1f2d45',
          borderRadius: 16, padding: '1.5rem', marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              {profile?.avatar ? (
                <img src={profile.avatar} alt="avatar"
                  style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'rgba(79,142,247,0.15)',
                  border: '2px solid rgba(79,142,247,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', fontWeight: 700, color: '#4f8ef7'
                }}>
                  {form.firstName?.[0]}{form.lastName?.[0]}
                </div>
              )}
              <div
                onClick={() => document.getElementById('avatar-upload').click()}
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 26, height: 26, borderRadius: '50%',
                  background: '#4f8ef7', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', border: '2px solid #06080f'
                }}>✏️</div>
            </div>
            <div>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>Profile Photo</div>
              <div style={{ color: '#8896b0', fontSize: '0.85rem' }}>
                {avatarUploading ? 'Uploading...' : 'Click the pencil to upload a new photo'}
              </div>
            </div>
          </div>
          <input id="avatar-upload" type="file" accept="image/*"
            onChange={handleAvatarUpload} style={{ display: 'none' }} />
        </div>

        {/* Name Section */}
        <div style={{
          background: '#111827', border: '1px solid #1f2d45',
          borderRadius: 16, padding: '1.5rem', marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: '1rem', fontWeight: 600 }}>Name</h3>
            <button onClick={() => setEditField(editField === 'name' ? null : 'name')} style={{
              padding: '0.3rem 0.8rem', borderRadius: 8, fontSize: '0.82rem',
              border: '1px solid #1f2d45', background: 'transparent',
              color: '#4f8ef7', cursor: 'pointer', fontFamily: 'inherit'
            }}>{editField === 'name' ? 'Cancel' : 'Edit'}</button>
          </div>
          {editField === 'name' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: '#8896b0' }}>First Name</label>
                <input value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', color: '#8896b0' }}>Last Name</label>
                <input value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} style={inputStyle} />
              </div>
            </div>
          ) : (
            <div style={{ color: '#8896b0', fontSize: '0.9rem' }}>
              {form.firstName || form.lastName ? `${form.firstName} ${form.lastName}` : 'Not set'}
            </div>
          )}
        </div>

        {/* Bio Section */}
        <div style={{
          background: '#111827', border: '1px solid #1f2d45',
          borderRadius: 16, padding: '1.5rem', marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: '1rem', fontWeight: 600 }}>Bio</h3>
            <button onClick={() => setEditField(editField === 'bio' ? null : 'bio')} style={{
              padding: '0.3rem 0.8rem', borderRadius: 8, fontSize: '0.82rem',
              border: '1px solid #1f2d45', background: 'transparent',
              color: '#4f8ef7', cursor: 'pointer', fontFamily: 'inherit'
            }}>{editField === 'bio' ? 'Cancel' : 'Edit'}</button>
          </div>
          {editField === 'bio' ? (
            <textarea rows={3} value={form.bio}
              onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
              style={{ ...inputStyle, resize: 'vertical' }} />
          ) : (
            <div style={{ color: '#8896b0', fontSize: '0.9rem' }}>{form.bio || 'Not set'}</div>
          )}
        </div>

        {/* University Section */}
        <div style={{
          background: '#111827', border: '1px solid #1f2d45',
          borderRadius: 16, padding: '1.5rem', marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: '1rem', fontWeight: 600 }}>University</h3>
            <button onClick={() => setEditField(editField === 'uni' ? null : 'uni')} style={{
              padding: '0.3rem 0.8rem', borderRadius: 8, fontSize: '0.82rem',
              border: '1px solid #1f2d45', background: 'transparent',
              color: '#4f8ef7', cursor: 'pointer', fontFamily: 'inherit'
            }}>{editField === 'uni' ? 'Cancel' : 'Edit'}</button>
          </div>
          {editField === 'uni' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input placeholder="University name" value={form.university}
                onChange={e => setForm(p => ({ ...p, university: e.target.value }))} style={inputStyle} />
              <select value={form.graduationYear}
                onChange={e => setForm(p => ({ ...p, graduationYear: e.target.value }))}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Graduation year</option>
                {['2025', '2026', '2027', '2028', '2029'].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          ) : (
            <div style={{ color: '#8896b0', fontSize: '0.9rem' }}>
              {form.university ? `${form.university} ${form.graduationYear ? `· Class of ${form.graduationYear}` : ''}` : 'Not set'}
            </div>
          )}
        </div>

        {/* Social Links Section */}
        <div style={{
          background: '#111827', border: '1px solid #1f2d45',
          borderRadius: 16, padding: '1.5rem', marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: '1rem', fontWeight: 600 }}>Social Links</h3>
            <button onClick={() => setEditField(editField === 'social' ? null : 'social')} style={{
              padding: '0.3rem 0.8rem', borderRadius: 8, fontSize: '0.82rem',
              border: '1px solid #1f2d45', background: 'transparent',
              color: '#4f8ef7', cursor: 'pointer', fontFamily: 'inherit'
            }}>{editField === 'social' ? 'Cancel' : 'Edit'}</button>
          </div>
          {editField === 'social' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { field: 'github', label: 'GitHub username', placeholder: 'john-doe' },
                { field: 'linkedin', label: 'LinkedIn URL', placeholder: 'linkedin.com/in/johndoe' },
                { field: 'leetcode', label: 'LeetCode username', placeholder: 'john_doe' },
                { field: 'portfolio', label: 'Portfolio URL', placeholder: 'johndoe.dev' },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label style={{ fontSize: '0.82rem', color: '#8896b0' }}>{label}</label>
                  <input placeholder={placeholder} value={form[field]}
                    onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                    style={inputStyle} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'GitHub', value: form.github },
                { label: 'LinkedIn', value: form.linkedin },
                { label: 'LeetCode', value: form.leetcode },
                { label: 'Portfolio', value: form.portfolio },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', gap: 8, fontSize: '0.88rem' }}>
                  <span style={{ color: '#8896b0', minWidth: 80 }}>{label}</span>
                  <span style={{ color: value ? '#f0f4ff' : '#3d4f6e' }}>{value || 'Not set'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Skills Section */}
        <div style={{
          background: '#111827', border: '1px solid #1f2d45',
          borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: '1rem', fontWeight: 600 }}>Skills</h3>
            <button onClick={() => setEditField(editField === 'skills' ? null : 'skills')} style={{
              padding: '0.3rem 0.8rem', borderRadius: 8, fontSize: '0.82rem',
              border: '1px solid #1f2d45', background: 'transparent',
              color: '#4f8ef7', cursor: 'pointer', fontFamily: 'inherit'
            }}>{editField === 'skills' ? 'Cancel' : 'Edit'}</button>
          </div>
          {editField === 'skills' ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {skills.map(skill => (
                <button key={skill} onClick={() => toggleSkill(skill)} style={{
                  padding: '0.35rem 0.9rem', borderRadius: 999, fontSize: '0.82rem',
                  cursor: 'pointer', fontFamily: 'inherit',
                  border: `1px solid ${form.skills.includes(skill) ? '#4f8ef7' : '#1f2d45'}`,
                  background: form.skills.includes(skill) ? 'rgba(79,142,247,0.15)' : 'transparent',
                  color: form.skills.includes(skill) ? '#4f8ef7' : '#8896b0',
                }}>{skill}</button>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {form.skills.length > 0 ? form.skills.map(skill => (
                <span key={skill} style={{
                  padding: '0.3rem 0.8rem', borderRadius: 999, fontSize: '0.82rem',
                  background: 'rgba(79,142,247,0.1)', color: '#4f8ef7',
                  border: '1px solid rgba(79,142,247,0.2)'
                }}>{skill}</span>
              )) : <span style={{ color: '#8896b0', fontSize: '0.9rem' }}>No skills added</span>}
            </div>
          )}
        </div>

        {/* Save Button */}
        <button onClick={handleSave} disabled={saving} style={{
          width: '100%', padding: '0.85rem', borderRadius: 10, border: 'none',
          background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
          color: '#fff', fontSize: '1rem', fontWeight: 500,
          cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.7 : 1, fontFamily: 'inherit'
        }}>{saving ? 'Saving...' : 'Save Changes ✓'}</button>

      </div>
      
    </div>
    {/* Danger Zone */}
<div style={{
  background: 'rgba(236,72,153,0.04)',
  border: '1px solid rgba(236,72,153,0.2)',
  borderRadius: 16, padding: '1.5rem', marginTop: '1rem'
}}>
  <h3 style={{
    fontFamily: 'var(--font-syne), Syne, sans-serif',
    fontSize: '1rem', fontWeight: 600, color: '#ec4899', marginBottom: 8
  }}>⚠️ Danger Zone</h3>
  <p style={{ color: '#8896b0', fontSize: '0.88rem', marginBottom: '1rem', lineHeight: 1.6 }}>
    Permanently delete your account and all your data including projects, blogs, questions and messages.
    This action cannot be undone.
  </p>
  <button
    onClick={async () => {
      const confirmed = confirm('Are you absolutely sure? This will permanently delete your account and ALL your data. This cannot be undone.')
      if (!confirmed) return
      const doubleConfirm = confirm('Last chance — delete everything permanently?')
      if (!doubleConfirm) return
      const res = await fetch('/api/users/delete', { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        window.location.href = '/'
      } else {
        alert('Failed to delete account: ' + data.error)
      }
    }}
    style={{
      padding: '0.7rem 1.5rem', borderRadius: 10,
      border: '1px solid rgba(236,72,153,0.4)',
      background: 'rgba(236,72,153,0.08)',
      color: '#ec4899', cursor: 'pointer', fontSize: '0.9rem',
      fontFamily: 'inherit', fontWeight: 500
    }}
  >🗑️ Delete My Account</button>
</div>
  )
}