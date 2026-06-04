/**
 * FoundationSummary — 底座摘要面板
 */
import React from 'react'

interface FoundationItem {
  label: string
  value: string | number
  detail?: string
}

interface FoundationSummaryProps {
  title?: string
  items: FoundationItem[]
  columns?: 2 | 3
}

export const FoundationSummary: React.FC<FoundationSummaryProps> = ({
  title,
  items,
  columns = 3,
}) => {
  return (
    <div style={{ border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 16, background: 'var(--bg-surface)' }}>
      {title && <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>{title}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 12 }}>
        {items.map((item, i) => (
          <div key={i} style={{ padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</div>
            {item.detail && <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>{item.detail}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default FoundationSummary
