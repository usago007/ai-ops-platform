import React from 'react'
import { Tag } from 'antd'
import styles from './ConfidenceBadge.module.css'

interface ConfidenceBadgeProps {
  confidence: number
  showBar?: boolean
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ confidence, showBar = false }) => {
  const percentage = Math.round(confidence * 100)
  const color = confidence >= 0.9 ? '#52c41a' : confidence >= 0.8 ? '#faad14' : '#ff4d4f'
  const text = confidence >= 0.9 ? '高置信' : confidence >= 0.8 ? '中置信' : '低置信'

  return (
    <div className={styles.container}>
      <Tag color={color}>{text} {percentage}%</Tag>
      {showBar && (
        <div className={styles.bar}>
          <div className={styles.barFill} style={{ width: `${percentage}%`, background: color }} />
        </div>
      )}
    </div>
  )
}
