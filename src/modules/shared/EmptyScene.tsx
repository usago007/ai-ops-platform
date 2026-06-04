/**
 * EmptyScene — 统一空状态
 */
import React from 'react'

interface EmptySceneProps {
  title?: string
  description?: string
  action?: React.ReactNode
}

export const EmptyScene: React.FC<EmptySceneProps> = ({
  title = '暂无数据',
  description,
  action,
}) => {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px', textAlign: 'center',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 'var(--radius-full)',
        background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 12,
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round">
          <path d="M13 2L3 7l10 5 10-5-10-5zM3 17l10 5 10-5M3 12l10 5 10-5" />
        </svg>
      </div>
      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>{title}</div>
      {description && <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', maxWidth: 280 }}>{description}</div>}
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  )
}

export default EmptyScene
