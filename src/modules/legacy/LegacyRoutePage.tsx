import React from 'react'
import { Button, Card, Space, Tag, Typography } from 'antd'
import { HistoryOutlined } from '@/iconMap'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../shared/SharedUI'
import styles from './LegacyPages.module.css'

const { Paragraph, Text, Title } = Typography

interface LegacyRoutePageProps {
  title: string
  description: string
  replacementLabel: string
  replacementPath: string
}

export const LegacyRoutePage: React.FC<LegacyRoutePageProps> = ({
  title,
  description,
  replacementLabel,
  replacementPath,
}) => {
  const navigate = useNavigate()

  return (
    <PageShell title={<><HistoryOutlined style={{ marginRight: 8 }} />{title}</>}>
      <Card className={styles.noticeCard}>
        <Space orientation="vertical" size={12}>
          <Space>
            <Tag color="orange">legacy</Tag>
            <Text strong>该页面已冻结</Text>
          </Space>
          <Title level={4} className={styles.title}>{title}</Title>
          <Paragraph className={styles.description}>{description}</Paragraph>
          <div className={styles.ctaBar}>
            <Button type="primary" onClick={() => navigate(replacementPath)}>
              去 {replacementLabel}
            </Button>
            <Button onClick={() => navigate('/legacy')}>
              返回历史页面隔离区
            </Button>
          </div>
        </Space>
      </Card>
    </PageShell>
  )
}

export default LegacyRoutePage
