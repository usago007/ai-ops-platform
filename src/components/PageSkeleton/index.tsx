interface PageSkeletonProps {
  variant?: 'dashboard' | 'list' | 'detail' | 'form'
}

export const PageSkeleton: React.FC<PageSkeletonProps> = ({ variant = 'dashboard' }) => {
  if (variant === 'dashboard') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-2xl)' }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-2xl)' }} />
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="skeleton" style={{ height: '40px', width: '200px', borderRadius: 'var(--radius-md)' }} />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="skeleton" style={{ height: '56px', borderRadius: 'var(--radius-lg)' }} />
        ))}
      </div>
    )
  }

  if (variant === 'detail') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="skeleton" style={{ height: '32px', width: '60%', borderRadius: 'var(--radius-md)' }} />
        <div className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius-2xl)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="skeleton" style={{ height: '150px', borderRadius: 'var(--radius-2xl)' }} />
          <div className="skeleton" style={{ height: '150px', borderRadius: 'var(--radius-2xl)' }} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="skeleton" style={{ height: '32px', width: '40%', borderRadius: 'var(--radius-md)' }} />
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton" style={{ height: '44px', borderRadius: 'var(--radius-md)' }} />
      ))}
    </div>
  )
}
