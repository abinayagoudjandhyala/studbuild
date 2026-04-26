'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

const skills = [
  'React', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Express',
  'Python', 'Django', 'FastAPI', 'Java', 'Spring', 'Go',
  'Rust', 'TypeScript', 'MongoDB', 'PostgreSQL', 'MySQL',
  'Firebase', 'Flutter', 'React Native', 'Swift', 'Kotlin',
  'Docker', 'AWS', 'GraphQL', 'Redis', 'C++', 'C#'
]

export default function OnboardingPage() {
  const { user } = useUser()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
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
  const [customSkill, setCustomSkill] = useState('')

  const update = (field, value) => setForm(p => ({ ...p, [field]: value }))

  const toggleSkill = (skill) => {
    setForm(p => ({
      ...p,
      skills: p.skills.includes(skill)
        ? p.skills.filter(s => s !== skill)
        : [...p.skills, skill]
    }))
  }

const handleSubmit = async () => {
  setLoading(true)
  try {
    const res = await fetch('/api/users/onboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, clerkId: user.id }),
    })
    const data = await res.json()
    if (res.ok) {
      window.location.href = '/home'
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

  return (
    <div style={{
      minHeight: '100vh', background: '#06080f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', fontFamily: 'var(--font-dm), DM Sans, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: 560 }}>

        {/* header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            fontFamily: 'var(--font-syne), Syne, sans-serif',
            fontSize: '1.3rem', fontWeight: 800,
            background: 'linear-gradient(120deg,#4f8ef7,#a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '1rem'
          }}>StudBuild</div>
          <h1 style={{
            fontFamily: 'var(--font-syne), Syne, sans-serif',
            fontSize: '1.8rem', fontWeight: 700, marginBottom: 8
          }}>
            {step === 1 && 'Set up your profile'}
            {step === 2 && 'Add your social links'}
            {step === 3 && 'Pick your skills'}
          </h1>
          <p style={{ color: '#8896b0', fontSize: '0.9rem' }}>
            Step {step} of 3
          </p>
        </div>

        {/* progress bar */}
        <div style={{ background: '#1f2d45', borderRadius: 999, height: 4, marginBottom: '2rem' }}>
          <div style={{
            background: 'linear-gradient(90deg,#4f8ef7,#7c5cfc)',
            borderRadius: 999, height: 4,
            width: `${(step / 3) * 100}%`,
            transition: 'width 0.4s ease'
          }} />
        </div>

        {/* card */}
        <div style={{
          background: '#111827', border: '1px solid #1f2d45',
          borderRadius: 20, padding: '2rem'
        }}>

         {step === 1 && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <div>
        <label style={labelStyle}>First Name</label>
        <input
          placeholder="Abinaya"
          value={form.firstName}
          onChange={e => update('firstName', e.target.value)}
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>Last Name</label>
        <input
          placeholder="Goud"
          value={form.lastName}
          onChange={e => update('lastName', e.target.value)}
          style={inputStyle}
        />
      </div>
    </div>
    <div>
      <label style={labelStyle}>Bio — tell us about yourself</label>
      <textarea
        rows={3}
        placeholder="I'm a 2nd year CS student who loves building web apps..."
        value={form.bio}
        onChange={e => update('bio', e.target.value)}
        style={{ ...inputStyle, resize: 'vertical' }}
      />
    </div>
    <div>
      <label style={labelStyle}>University / College</label>
      <input
        placeholder="eg. IIT Hyderabad, BITS Pilani, VIT..."
        value={form.university}
        onChange={e => update('university', e.target.value)}
        style={inputStyle}
      />
    </div>
    <div>
      <label style={labelStyle}>Graduation Year</label>
      <select
        value={form.graduationYear}
        onChange={e => update('graduationYear', e.target.value)}
        style={{ ...inputStyle, cursor: 'pointer' }}
      >
        <option value="">Select year</option>
        {['2025', '2026', '2027', '2028', '2029'].map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  </div>
)}

          {/* STEP 2 */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {[
                { field: 'github', label: 'GitHub username', placeholder: 'eg. john-doe' },
                { field: 'linkedin', label: 'LinkedIn URL', placeholder: 'eg. linkedin.com/in/johndoe' },
                { field: 'leetcode', label: 'LeetCode username', placeholder: 'eg. john_doe' },
                { field: 'portfolio', label: 'Portfolio website', placeholder: 'eg. johndoe.dev' },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label style={labelStyle}>{label}</label>
                  <input
                    placeholder={placeholder}
                    value={form[field]}
                    onChange={e => update(field, e.target.value)}
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
  <div>
    <p style={{ color: '#8896b0', fontSize: '0.88rem', marginBottom: '1.2rem' }}>
      Pick all that apply — this helps others find your projects
    </p>

    {/* Custom skill input */}
    <div style={{ display: 'flex', gap: 8, marginBottom: '1.2rem' }}>
      <input
        placeholder="Add your own skill (eg. Solidity, Figma, Blender...)"
        value={customSkill}
        onChange={e => setCustomSkill(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && customSkill.trim()) {
            if (!form.skills.includes(customSkill.trim())) {
              setForm(p => ({ ...p, skills: [...p.skills, customSkill.trim()] }))
            }
            setCustomSkill('')
          }
        }}
        style={{
          flex: 1, padding: '0.6rem 1rem', borderRadius: 10,
          border: '1px solid #1f2d45', background: '#0d1120',
          color: '#f0f4ff', fontSize: '0.88rem', outline: 'none',
          fontFamily: 'inherit'
        }}
      />
      <button
        onClick={() => {
          if (customSkill.trim() && !form.skills.includes(customSkill.trim())) {
            setForm(p => ({ ...p, skills: [...p.skills, customSkill.trim()] }))
          }
          setCustomSkill('')
        }}
        style={{
          padding: '0.6rem 1.2rem', borderRadius: 10, border: 'none',
          background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
          color: '#fff', cursor: 'pointer', fontSize: '0.88rem',
          fontFamily: 'inherit', fontWeight: 500
        }}
      >+ Add</button>
    </div>

    {/* Predefined skills */}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {skills.map(skill => (
        <button
          key={skill}
          onClick={() => toggleSkill(skill)}
          style={{
            padding: '0.4rem 1rem', borderRadius: 999, fontSize: '0.85rem',
            cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
            border: '1px solid ' + (form.skills.includes(skill) ? '#4f8ef7' : '#1f2d45'),
            background: form.skills.includes(skill) ? 'rgba(79,142,247,0.15)' : 'transparent',
            color: form.skills.includes(skill) ? '#4f8ef7' : '#8896b0',
          }}
        >{skill}</button>
      ))}
    </div>

    {form.skills.length > 0 && (
      <div style={{ marginTop: '1rem' }}>
        <p style={{ color: '#34d399', fontSize: '0.82rem', marginBottom: 8 }}>
          ✓ {form.skills.length} skill{form.skills.length > 1 ? 's' : ''} selected
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {form.skills.map(skill => (
            <span key={skill} style={{
              padding: '0.3rem 0.8rem', borderRadius: 999, fontSize: '0.8rem',
              background: 'rgba(79,142,247,0.15)', color: '#4f8ef7',
              border: '1px solid rgba(79,142,247,0.2)',
              display: 'flex', alignItems: 'center', gap: 6
            }}>
              {skill}
              <span
                onClick={() => setForm(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }))}
                style={{ cursor: 'pointer', color: '#8896b0', fontSize: '0.9rem', lineHeight: 1 }}
              >×</span>
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
)}

        </div>

        {/* buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: '1.5rem' }}>
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} style={{
              flex: 1, padding: '0.75rem', borderRadius: 10,
              border: '1px solid #1f2d45', background: 'transparent',
              color: '#f0f4ff', cursor: 'pointer', fontSize: '0.95rem',
              fontFamily: 'inherit'
            }}>← Back</button>
          )}
          {step < 3 ? (
            <button onClick={() => setStep(s => s + 1)} style={{
              flex: 1, padding: '0.75rem', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
              color: '#fff', cursor: 'pointer', fontSize: '0.95rem',
              fontWeight: 500, fontFamily: 'inherit'
            }}>Continue →</button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} style={{
              flex: 1, padding: '0.75rem', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
              color: '#fff', cursor: 'pointer', fontSize: '0.95rem',
              fontWeight: 500, fontFamily: 'inherit',
              opacity: loading ? 0.7 : 1
            }}>{loading ? 'Saving...' : 'Complete setup 🚀'}</button>
          )}
        </div>

      </div>
    </div>
  )
}