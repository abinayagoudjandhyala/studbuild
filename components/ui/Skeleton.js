export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style = {} }) {
  return (
    <div style={{
      width, height, borderRadius,
      background: 'linear-gradient(90deg, #111827 25%, #1f2d45 50%, #111827 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      ...style
    }} />
  )
}

export function ProjectCardSkeleton() {
  return (
    <div style={{
      background: '#111827', border: '1px solid #1f2d45',
      borderRadius: 16, overflow: 'hidden'
    }}>
      <Skeleton height={160} borderRadius={0} />
      <div style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <Skeleton width={60} height={22} borderRadius={6} />
          <Skeleton width={80} height={22} borderRadius={6} />
        </div>
        <Skeleton height={18} style={{ marginBottom: 8 }} />
        <Skeleton height={14} width="80%" style={{ marginBottom: 6 }} />
        <Skeleton height={14} width="60%" style={{ marginBottom: 12 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Skeleton width={22} height={22} borderRadius="50%" />
          <Skeleton width={100} height={14} />
        </div>
      </div>
    </div>
  )
}

export function BlogCardSkeleton() {
  return (
    <div style={{
      background: '#111827', border: '1px solid #1f2d45',
      borderRadius: 14, padding: '1.1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Skeleton width={24} height={24} borderRadius="50%" />
        <Skeleton width={120} height={14} />
        <Skeleton width={60} height={14} style={{ marginLeft: 'auto' }} />
      </div>
      <Skeleton height={20} style={{ marginBottom: 8 }} />
      <Skeleton height={14} style={{ marginBottom: 6 }} />
      <Skeleton height={14} width="70%" />
    </div>
  )
}

export function QuestionCardSkeleton() {
  return (
    <div style={{
      background: '#111827', border: '1px solid #1f2d45',
      borderRadius: 14, padding: '1rem 1.2rem',
      display: 'flex', gap: '1rem'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', minWidth: 52 }}>
        <Skeleton width={32} height={32} borderRadius="50%" />
        <Skeleton width={32} height={32} borderRadius="50%" />
      </div>
      <div style={{ flex: 1 }}>
        <Skeleton height={18} style={{ marginBottom: 8 }} />
        <Skeleton height={14} width="80%" style={{ marginBottom: 10 }} />
        <div style={{ display: 'flex', gap: 6 }}>
          <Skeleton width={70} height={22} borderRadius={6} />
          <Skeleton width={90} height={22} borderRadius={6} />
        </div>
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div style={{
      background: '#111827', border: '1px solid #1f2d45',
      borderRadius: 20, padding: '2rem', marginBottom: '1.5rem'
    }}>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        <Skeleton width={90} height={90} borderRadius="50%" />
        <div style={{ flex: 1 }}>
          <Skeleton height={24} width="40%" style={{ marginBottom: 10 }} />
          <Skeleton height={16} width="30%" style={{ marginBottom: 10 }} />
          <Skeleton height={14} style={{ marginBottom: 6 }} />
          <Skeleton height={14} width="80%" style={{ marginBottom: 16 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <Skeleton width={80} height={32} borderRadius={8} />
            <Skeleton width={80} height={32} borderRadius={8} />
            <Skeleton width={80} height={32} borderRadius={8} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Skeleton