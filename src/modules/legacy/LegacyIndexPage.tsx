import React from 'react'
import { Button, Card, Space, Tag, Typography } from 'antd'
import { LinkOutlined, HistoryOutlined } from '@/iconMap'
import { useNavigate } from 'react-router-dom'
import { PageShell, SectionHeader } from '../shared/SharedUI'
import styles from './LegacyPages.module.css'

const { Paragraph, Text, Title } = Typography

const LEGACY_LINKS = [
  {
    key: '/legacy/inquiry/list',
    label: '询价线索池',
    note: '旧询价台账，仅保留历史演示。',
    recommendedLabel: '客服工作台',
    recommendedPath: '/cs/workspace',
  },
  {
    key: '/legacy/inquiry/quotation-list',
    label: '报价管理',
    note: '旧报价列表，仅供过渡查看。',
    recommendedLabel: '客服工作台',
    recommendedPath: '/cs/workspace',
  },
  {
    key: '/legacy/biz/overview',
    label: '业务概览',
    note: '旧业务看板，已被经营总览取代。',
    recommendedLabel: '经营总览',
    recommendedPath: '/overview',
  },
  {
    key: '/legacy/mkt/overview',
    label: '营销概览',
    note: '旧营销看板，暂作为历史入口保留。',
    recommendedLabel: '经营总览',
    recommendedPath: '/overview',
  },
]

export const LegacyIndexPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <PageShell title={<><HistoryOutlined style={{ marginRight: 8 }} />历史页面隔离区</>}>
      <div className={styles.hero}>
        <Title level={3} className={styles.title}>旧页面已冻结，不再属于主产品。</Title>
        <Paragraph className={styles.description}>
          这里仅保留少量历史入口，方便兼容旧链接和演示对照。正常使用请返回
          <Text strong>经营总览</Text>、<Text strong>客服工作台</Text> 或 <Text strong>AI 融入底座</Text>。
        </Paragraph>
        <div className={styles.ctaBar}>
          <Button type="primary" onClick={() => navigate('/overview')}>返回经营总览</Button>
          <Button onClick={() => navigate('/cs/workspace')}>进入客服工作台</Button>
        </div>
      </div>

      <Card className={styles.listCard}>
        <SectionHeader icon={<LinkOutlined />} title="保留中的历史入口" />
        <div className={styles.legacyList}>
          {LEGACY_LINKS.map((item) => (
            <div key={item.key} className={styles.legacyItem}>
              <div className={styles.linkRow}>
                <div className={styles.linkMeta}>
                  <Space>
                    <Text strong>{item.label}</Text>
                    <Tag>legacy</Tag>
                  </Space>
                  <Text type="secondary">{item.note}</Text>
                </div>
                <div className={styles.itemActions}>
                  <Button size="small" onClick={() => navigate(item.key)}>打开旧页</Button>
                  <Button type="link" size="small" onClick={() => navigate(item.recommendedPath)}>
                    去 {item.recommendedLabel}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </PageShell>
  )
}

export default LegacyIndexPage
