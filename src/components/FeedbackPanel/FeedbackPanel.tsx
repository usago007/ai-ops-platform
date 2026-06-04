import React, { useState } from 'react'
import { Card, Rate, Button, Space, Typography } from 'antd'
import { LikeOutlined, DislikeOutlined } from '@/iconMap'
import styles from './FeedbackPanel.module.css'

const { Text } = Typography

interface FeedbackPanelProps {
  onFeedback?: (type: 'like' | 'dislike', rating?: number) => void
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ onFeedback }) => {
  const [rating, setRating] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const handleLike = () => {
    setSubmitted(true)
    onFeedback?.('like', rating)
  }

  const handleDislike = () => {
    setSubmitted(true)
    onFeedback?.('dislike', rating)
  }

  if (submitted) {
    return <div className={styles.submitted}>感谢您的反馈</div>
  }

  return (
    <Card size="small" className={styles.panel}>
      <Text type="secondary">对 AI 结果的反馈：</Text>
      <Space>
        <Button size="small" icon={<LikeOutlined />} onClick={handleLike}>有帮助</Button>
        <Button size="small" icon={<DislikeOutlined />} onClick={handleDislike}>需改进</Button>
        <Rate onChange={setRating} value={rating} />
      </Space>
    </Card>
  )
}
