'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'
const langs = [
  { name: 'React', color: '#61dafb' },
  { name: 'Python', color: '#ffd43b' },
  { name: 'TypeScript', color: '#3178c6' },
  { name: 'Node.js', color: '#68a063' },
  { name: 'Rust', color: '#f74c00' },
  { name: 'Go', color: '#00add8' },
  { name: 'Vue', color: '#42b883' },
  { name: 'Flutter', color: '#54c5f8' },
  { name: 'Swift', color: '#ff6b35' },
  { name: 'Kotlin', color: '#7f52ff' },
  { name: 'Java', color: '#f89820' },
  { name: 'Next.js', color: '#ffffff' },
]

const projects = [
  { title: 'DevBoard', desc: 'Real-time collaborative kanban board', tags: ['React', 'Node.js'], emoji: '🗂️', bg: '#1a2a4a', author: 'Priya K', av: 'PK', avColor: '#2563eb' },
  { title: 'AlgoVisual', desc: 'Interactive sorting algorithm visualizer', tags: ['Python', 'FastAPI'], emoji: '📊', bg: '#1a3a2a', author: 'Rahul M', av: 'RM', avColor: '#059669' },
  { title: 'CampusEats', desc: 'Food ordering app for college canteens', tags: ['Flutter', 'Firebase'], emoji: '🍱', bg: '#3a1a2a', author: 'Sneha R', av: 'SR', avColor: '#7c3aed' },
  { title: 'StudySync', desc: 'Pomodoro timer with flashcard system', tags: ['TypeScript', 'Next.js'], emoji: '⏱️', bg: '#2a1a3a', author: 'Aditya P', av: 'AP', avColor: '#dc2626' },
  { title: 'PlantID AI', desc: 'Identify plants using camera + AI', tags: ['Python', 'React'], emoji: '🌿', bg: '#1a3a1a', author: 'Kavya S', av: 'KS', avColor: '#16a34a' },
  { title: 'CryptoLite', desc: 'Minimal crypto portfolio tracker', tags: ['Go', 'Vue'], emoji: '₿', bg: '#2a2a1a', author: 'Arjun T', av: 'AT', avColor: '#d97706' },
]

const filters = ['All', 'React', 'Python', 'TypeScript', 'Flutter', 'Go']

export default function LandingPage() {
 
  const [activeFilter, setActiveFilter] = useState('All')
  const router = useRouter()
 
  const { isSignedIn, user, isLoaded } = useUser()

useEffect(() => {
  if (isLoaded && isSignedIn) {
    router.push('/home')
  }
}, [isLoaded, isSignedIn])
 

  const filtered = activeFilter === 'All'
    ? projects
    : projects.filter(p => p.tags.some(t => t.toLowerCase().includes(activeFilter.toLowerCase())))

  return (
    <div style={{ fontFamily: 'var(--font-dm), DM Sans, sans-serif' }}>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 2.5rem',
        background: 'rgba(6,8,15,0.8)',
        backdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(79,142,247,0.08)'
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
  {isSignedIn ? (
    <>
      <span style={{ color: '#8896b0', fontSize: '0.88rem' }}>
        Hey, {user.firstName} 👋
      </span>
      <button onClick={() => router.push('/home')} style={{
        padding: '0.45rem 1.3rem', borderRadius: 8, border: 'none',
        background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
        color: '#fff', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500
      }}>Dashboard →</button>
    </>
  ) : (
    <>
      <button onClick={() => router.push('/sign-in')} style={{
        padding: '0.45rem 1.2rem', borderRadius: 8,
        border: '1px solid #1f2d45', background: 'transparent',
        color: '#f0f4ff', cursor: 'pointer', fontSize: '0.88rem'
      }}>Log in</button>
      <button onClick={() => router.push('/sign-up')} style={{
        padding: '0.45rem 1.3rem', borderRadius: 8, border: 'none',
        background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
        color: '#fff', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500
      }}>Get started</button>
    </>
  )}
</div>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '7rem 1.5rem 4rem',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* background orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: '#4f8ef7', filter: 'blur(80px)', opacity: 0.12, top: -100, left: -100 }} />
          <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: '#a78bfa', filter: 'blur(80px)', opacity: 0.12, bottom: -80, right: -80 }} />
          <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: '#34d399', filter: 'blur(80px)', opacity: 0.08, top: '50%', left: '55%' }} />
          {/* grid */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(79,142,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.04) 1px,transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '0.3rem 0.9rem', borderRadius: 999,
          background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.25)',
          color: '#4f8ef7', fontSize: '0.8rem', marginBottom: '1.5rem'
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
          Built for student developers
        </div>

        <h1 style={{
          fontFamily: 'var(--font-syne), Syne, sans-serif',
          fontSize: 'clamp(2.8rem,7vw,5.2rem)', fontWeight: 800,
          lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: '1.2rem'
        }}>
          Where student<br />
          projects{' '}
          <span style={{
            background: 'linear-gradient(120deg,#4f8ef7 0%,#a78bfa 50%,#34d399 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>get noticed</span>
        </h1>

        <p style={{ fontSize: '1.1rem', color: '#8896b0', maxWidth: 560, lineHeight: 1.7, marginBottom: '2.5rem', fontWeight: 300 }}>
          Showcase your work, connect with peers, and discover amazing projects from student developers around the world.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setModal('signup')} style={{
            padding: '0.75rem 2rem', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
            color: '#fff', fontSize: '1rem', fontWeight: 500, cursor: 'pointer'
          }}>Start showcasing free</button>
          <button style={{
            padding: '0.75rem 2rem', borderRadius: 10,
            border: '1px solid #1f2d45', background: 'transparent',
            color: '#f0f4ff', fontSize: '1rem', cursor: 'pointer'
          }}>Explore projects →</button>
        </div>

        {/* stats */}
        <div style={{ display: 'flex', gap: '2.5rem', justifyContent: 'center', marginTop: '3.5rem' }}>
          {[['12K+', 'Students'], ['38K+', 'Projects'], ['180+', 'Universities'], ['60+', 'Languages']].map(([num, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-syne), Syne, sans-serif',
                fontSize: '1.8rem', fontWeight: 700,
                background: 'linear-gradient(120deg,#4f8ef7,#a78bfa)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>{num}</div>
              <div style={{ fontSize: '0.8rem', color: '#8896b0', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{ overflow: 'hidden', borderTop: '1px solid #1f2d45', borderBottom: '1px solid #1f2d45', background: '#0d1120', padding: '1.5rem 0' }}>
        <div style={{ display: 'flex', gap: '1.5rem', animation: 'scroll 25s linear infinite', width: 'max-content' }}>
          {[...langs, ...langs].map((l, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '0.4rem 1.1rem', borderRadius: 999,
              border: '1px solid #1f2d45', background: '#111827',
              fontSize: '0.85rem', color: '#8896b0', whiteSpace: 'nowrap'
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, display: 'inline-block' }} />
              {l.name}
            </div>
          ))}
        </div>
      </div>

      {/* PROJECT FEED */}
      <section style={{ padding: '5rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4f8ef7', marginBottom: '0.75rem', fontWeight: 500 }}>Project Feed</div>
          <h2 style={{ fontFamily: 'var(--font-syne),Syne,sans-serif', fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 700, marginBottom: '0.75rem' }}>See what students are building</h2>
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            {filters.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)} style={{
                padding: '0.4rem 1rem', borderRadius: 999, fontSize: '0.85rem', cursor: 'pointer',
                border: `1px solid ${activeFilter === f ? '#4f8ef7' : '#1f2d45'}`,
                background: activeFilter === f ? 'rgba(79,142,247,0.08)' : 'transparent',
                color: activeFilter === f ? '#4f8ef7' : '#8896b0',
                transition: 'all 0.2s'
              }}>{f}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.2rem' }}>
          {(filtered.length ? filtered : projects).map((p, i) => (
            <div key={i} style={{
              background: '#111827', border: '1px solid #1f2d45',
              borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
              transition: 'transform 0.3s, border-color 0.3s'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'rgba(79,142,247,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#1f2d45' }}
            >
              <div style={{ height: 150, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>{p.emoji}</div>
              <div style={{ padding: '1rem 1.2rem' }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {p.tags.map(t => (
                    <span key={t} style={{ padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.72rem', fontWeight: 500, background: 'rgba(79,142,247,0.12)', color: '#4f8ef7', border: '1px solid rgba(79,142,247,0.2)' }}>{t}</span>
                  ))}
                </div>
                <div style={{ fontFamily: 'var(--font-syne),Syne,sans-serif', fontSize: '0.95rem', fontWeight: 600, marginBottom: 4 }}>{p.title}</div>
                <div style={{ fontSize: '0.82rem', color: '#8896b0', marginBottom: 12 }}>{p.desc}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#8896b0' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: p.avColor + '20', color: p.avColor, border: `1px solid ${p.avColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 600 }}>{p.av}</div>
                  {p.author}
                  <span style={{ marginLeft: 'auto', color: '#4f8ef7', cursor: 'pointer', fontSize: '0.75rem' }}>Message →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      

      {/* marquee animation */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}