/**
 * FoundationSummary — 底座摘要面板
 */
import React from 'react'
import styles from './SharedUI.module.css'

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
    <div className={styles.foundationSummary}>
      {title && <div className={styles.foundationTitle}>{title}</div>}
      <div className={styles.foundationGrid} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {items.map((item, i) => (
          <div key={i} className={styles.foundationItem}>
            <div className={styles.foundationLabel}>{item.label}</div>
            <div className={styles.foundationValue}>{item.value}</div>
            {item.detail && <div className={styles.foundationDetail}>{item.detail}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default FoundationSummary
