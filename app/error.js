'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Error({ error, reset }) {
  const router = useRouter()

  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div style={{
      minHeight: '100vh', background: '#06080f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-dm), DM Sans, sans-serif',
      padding: '2rem', textAlign: 'center'
    }}>
      <div>
        <div style={{
          fontSize: '5rem', marginBottom: '1rem',
          animation: 'shake 0.5s ease-in-out'
        }}>⚠️</div>

        <h2 style={{
          fontFamily: 'var(--font-syne), Syne, sans-serif',
          fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem'
        }}>Something went wrong</h2>

        <p style={{
          color: '#8896b0', fontSize: '0.95rem',
          maxWidth: 400, margin: '0 auto 2rem', lineHeight: 1.7
        }}>
          An unexpected error occurred. Don't worry — your data is safe.
          Try again or go back home.
        </p>

        {error?.message && (
          <div style={{
            background: 'rgba(236,72,153,0.06)',
            border: '1px solid rgba(236,72,153,0.2)',
            borderRadius: 10, padding: '0.8rem 1.2rem',
            marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem',
            fontSize: '0.82rem', color: '#ec4899', fontFamily: 'monospace',
            textAlign: 'left'
          }}>
            {error.message}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => reset()}
            style={{
              padding: '0.75rem 1.8rem', borderRadius: 10,
              border: '1px solid #1f2d45', background: 'transparent',
              color: '#f0f4ff', cursor: 'pointer', fontSize: '0.95rem',
              fontFamily: 'inherit'
            }}
          >Try again ↺</button>
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
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }
      `}</style>
    </div>
  )
}