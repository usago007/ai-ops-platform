import React from 'react'
import { Card } from 'antd'
import styles from './QualityScore.module.css'

interface QualityScoreProps {
  score: number
  maxScore?: number
  threshold?: number
  size?: 'small' | 'default' | 'large'
}

export const QualityScore: React.FC<QualityScoreProps> = ({
  score,
  maxScore = 100,
  threshold = 60,
  size = 'default',
}) => {
  const percentage = (score / maxScore) * 100
  const color = percentage >= 80 ? '#52c41a' : percentage >= threshold ? '#faad14' : '#ff4d4f'
  const radius = size === 'large' ? 60 : size === 'small' ? 30 : 45
  const strokeWidth = size === 'large' ? 8 : size === 'small' ? 4 : 6

  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className={styles.container}>
      <svg width={radius * 2 + strokeWidth * 2} height={radius * 2 + strokeWidth * 2}>
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          fill="none"
          stroke="#f0f0f0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${radius + strokeWidth} ${radius + strokeWidth})`}
          className={styles.circle}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize={size === 'large' ? 24 : size === 'small' ? 14 : 18}
          fontWeight="bold"
        >
          {score}
        </text>
      </svg>
      {percentage < threshold && (
        <div className={styles.warning}>低于阈值，建议送审</div>
      )}
    </div>
  )
}
