import React from 'react'
import { Card, Tag, Modal, Typography } from 'antd'
import styles from './CaseCard.module.css'

const { Text } = Typography

interface CaseCardProps {
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  previewData: Record<string, unknown>
  onClick: () => void
}

export const CaseCard: React.FC<CaseCardProps> = ({
  title,
  description,
  difficulty,
  previewData,
  onClick,
}) => {
  const difficultyConfig = {
    easy: { color: 'green', label: '简单' },
    medium: { color: 'orange', label: '中等' },
    hard: { color: 'red', label: '复杂' },
  }

  const diff = difficultyConfig[difficulty]

  return (
    <>
      <Card
        className={styles.card}
        hoverable
        onClick={onClick}
        title={title}
        extra={<Tag color={diff.color}>{diff.label}</Tag>}
      >
        <p className={styles.description}>{description}</p>
        <div className={styles.preview}>
          <Text type="secondary" className={styles.previewHint}>点击查看详情 →</Text>
        </div>
      </Card>
    </>
  )
}
