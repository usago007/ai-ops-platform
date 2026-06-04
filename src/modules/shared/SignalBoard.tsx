import React from 'react'
import styles from './SignalBoard.module.css'

interface SignalItem {
  title: string
  description?: string
  status?: 'positive' | 'negative' | 'neutral' | 'warning'
  tags?: { label: string; color?: string }[]
  onClick?: () => void
}

interface SignalBoardProps {
  title?: string
  icon?: React.ReactNode
  items: SignalItem[]
  emptyText?: string
}

const STATUS_INDICATOR: Record<string, string> = {
  positive: 'var(--success)',
  negative: 'var(--error)',
  neutral: 'var(--brand-primary)',
  warning: 'var(--warning)',
}

export const SignalBoard: React.FC<SignalBoardProps> = ({
  title,
  icon,
  items,
  emptyText = '暂无数据',
}) => {
  return (
    <div className={styles.board}>
      {title && (
        <div className={styles.header}>
          {icon}
          {title}
        </div>
      )}
      {items.length === 0 ? (
        <div className={styles.empty}>{emptyText}</div>
      ) : (
        items.map((item, i) => (
          <div
            key={i}
            className={`${styles.item} ${item.onClick ? styles.clickable : ''}`}
            onClick={item.onClick}
          >
            {item.status && (
              <div
                className={styles.indicator}
                style={{ background: STATUS_INDICATOR[item.status] || 'var(--border-primary)' }}
              />
            )}
            <div className={styles.content}>
              <div className={styles.itemTitle}>{item.title}</div>
              {item.description && (
                <div className={styles.itemDesc}>{item.description}</div>
              )}
              {item.tags && item.tags.length > 0 && (
                <div className={styles.tags}>
                  {item.tags.map((tag, j) => (
                    <span
                      key={j}
                      className={styles.tag}
                      style={{
                        background: tag.color ? `${tag.color}20` : 'var(--bg-primary)',
                        color: tag.color || 'var(--text-secondary)',
                      }}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export type { SignalItem }
export default SignalBoard
