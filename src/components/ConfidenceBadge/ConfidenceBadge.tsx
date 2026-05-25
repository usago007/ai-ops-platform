import React from 'react'
import { Tag } from 'antd'
import styles from './ConfidenceBadge.module.css'
import { STATUS_COLORS } from '../../styles/chartColors'

interface ConfidenceBadgeProps {
  confidence: number
  showBar?: boolean
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ confidence, showBar = false }) => {
  const percentage = Math.round(confidence * 100)
  const color = confidence >= 0.9 ? STATUS_COLORS.success : confidence >= 0.8 ? STATUS_COLORS.warning : STATUS_COLORS.error
  const text = confidence >= 0.9 ? '高置信' : confidence >= 0.8 ? '中置信' : '低置信'
  const barClass = confidence >= 0.9 ? styles.barFillHigh : confidence >= 0.8 ? styles.barFillMedium : styles.barFillLow

  return (
    <div className={styles.container}>
      <Tag color={color}>{text} {percentage}%</Tag>
      {showBar && (
        <div className={styles.bar}>
          <div className={`${styles.barFill} ${barClass}`} style={{ width: `${percentage}%` }} />
        </div>
      )}
    </div>
  )
}
