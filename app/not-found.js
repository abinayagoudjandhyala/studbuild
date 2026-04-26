'use client'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <div style={{
      minHeight: '100vh', background: '#06080f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-dm), DM Sans, sans-serif',
      padding: '2rem', textAlign: 'center'
    }}>
      <div>
        {/* Animated 404 */}
        <div style={{
          fontFamily: 'var(--font-syne), Syne, sans-serif',
          fontSize: 'clamp(6rem,20vw,12rem)', fontWeight: 800,
          lineHeight: 1,
          background: 'linear-gradient(120deg,#4f8ef7,#a78bfa,#34d399)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '1rem',
          animation: 'float 3s ease-in-out infinite'
        }}>404</div>

        <h2 style={{
          fontFamily: 'var(--font-syne), Syne, sans-serif',
          fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem'
        }}>Page not found</h2>

        <p style={{
          color: '#8896b0', fontSize: '1rem',
          maxWidth: 400, margin: '0 auto 2rem', lineHeight: 1.7
        }}>
          Looks like this page doesn't exist or was moved.
          Let's get you back on track!
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => router.back()}
            style={{
              padding: '0.75rem 1.8rem', borderRadius: 10,
              border: '1px solid #1f2d45', background: 'transparent',
              color: '#f0f4ff', cursor: 'pointer', fontSize: '0.95rem',
              fontFamily: 'inherit'
            }}
          >← Go back</button>
          <button
            onClick={() => router.push('/home')}
            style={{
              padding: '0.75rem 1.8rem', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
              color: '#fff', cursor: 'pointer', fontSize: '0.95rem',
              fontWeight: 500, fontFamily: 'inherit'
            }}
          >Go to Home 🚀</button>
        </div>

        {/* Decorative orbs */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: -1 }}>
          <div style={{
            position: 'absolute', width: 400, height: 400, borderRadius: '50%',
            background: '#4f8ef7', filter: 'blur(80px)', opacity: 0.06,
            top: '-100px', left: '-100px'
          }} />
          <div style={{
            position: 'absolute', width: 300, height: 300, borderRadius: '50%',
            background: '#a78bfa', filter: 'blur(80px)', opacity: 0.06,
            bottom: '-80px', right: '-80px'
          }} />
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}