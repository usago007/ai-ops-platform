import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Spin, Typography, Tag, Divider, Space, Button, Collapse, Popover } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, BarChartOutlined, PlusOutlined, BulbOutlined } from '@ant-design/icons'
import { Funnel, Line } from '@ant-design/charts'
import { CapabilityBanner } from '../../components/CapabilityBanner/CapabilityBanner'
import styles from './ConversionDashboard.module.css'
import { EmptyState } from '../../components/EmptyState'
import { marketingService } from '../../services'

const { Title, Text } = Typography

const OPTIMIZATION_SUGGESTIONS: Record<string, string> = {
  '展现': '使用AI生成更具吸引力的标题和主图',
  '点击': '优化卖点展示，突出核心差异化优势',
  '加购': '使用AI生成更具说服力的商品详情页',
  '成交': '应用智能优惠策略和限时促销话术',
}

export const ConversionDashboard: React.FC = () => {
  const [funnelData, setFunnelData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const result = await marketingService.getConversionFunnel()
      if (result.success) setFunnelData(result.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  if (loading) {
    return <div className={styles.center}><Spin size="large" tip="加载转化数据..." /></div>
  }

  if (!funnelData) {
    return (
      <div className={styles.container}>
        <Title level={3}>转化漏斗仪表盘</Title>
        <EmptyState
          icon={<BarChartOutlined />}
          title="暂无转化数据"
          description="请确保已配置转化跟踪并收集到足够的数据"
          actionButton={
            <Button type="primary" onClick={loadData}>
              重新加载
            </Button>
          }
        />
      </div>
    )
  }

  const funnelConfig = {
    data: funnelData.stages.map((s: any) => ({ stage: s.name, count: s.count })),
    xField: 'stage',
    yField: 'count',
    legend: false,
    label: {
      style: { fill: '#fff', fontSize: 14 },
      content: ({ stage, count }: any) => `${stage}\n${count.toLocaleString()}`,
    },
    style: {
      fill: (d: any) => {
        const colors = ['#1890ff', '#36cfc9', '#faad14', '#52c41a']
        const idx = funnelData.stages.findIndex((s: any) => s.stage === d.stage)
        return colors[idx] || '#d9d9d9'
      },
    },
    animation: {
      appear: { animation: 'fade-in', duration: 800 },
    },
  }

  const lineData: any[] = []
  if (funnelData.ab_test) {
    const ab = funnelData.ab_test
    ab.version_a.data.forEach((v: number, i: number) => {
      lineData.push({ week: `W${i + 1}`, conversion: v, version: ab.version_a.name })
    })
    ab.version_b.data.forEach((v: number, i: number) => {
      lineData.push({ week: `W${i + 1}`, conversion: v, version: ab.version_b.name })
    })
  }

  const lineConfig = {
    data: lineData,
    xField: 'week',
    yField: 'conversion',
    seriesField: 'version',
    smooth: true,
    color: ['#d9d9d9', '#52c41a'],
    point: { size: 5, shape: 'circle' },
    animation: { appear: { animation: 'fade-in', duration: 1000 } },
  }

  return (
    <div className={styles.container}>
      <CapabilityBanner
        title="📊 转化漏斗能力说明"
        icon={<BarChartOutlined />}
        capabilities={[
          '全链路追踪：展现 → 点击 → 加购 → 成交',
          'A/B 测试：智能分流与统计显著性检测',
          '效果归因：AI辅助内容带来的CTR/CVR提升',
          '优化建议：基于各阶段流失率生成针对性建议',
        ]}
        limits={[
          '数据更新频率：每 5 分钟',
          'A/B 测试需至少运行 7 天以确保统计显著性',
        ]}
        storageKey="conversion-banner-dismissed"
      />

      <Title level={3}>转化漏斗仪表盘</Title>

      <Row gutter={[16, 16]}>
        <Col span={10}>
          <Card title="全链路转化漏斗" className={styles.card}>
            <Funnel {...funnelConfig} height={300} />
          </Card>
        </Col>

        <Col span={14}>
          <Card
            title="A/B 测试结果"
            className={styles.card}
            extra={
              <Space>
                {funnelData.ab_test?.significant && (
                  <Tag color="green">已收敛至胜出版本</Tag>
                )}
                <Button size="small" icon={<PlusOutlined />}>创建新测试</Button>
              </Space>
            }
          >
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title={funnelData.ab_test?.version_a.name}
                  value={funnelData.ab_test?.version_a.conversion}
                  precision={1}
                  suffix="%"
                  valueStyle={{ color: '#999' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={funnelData.ab_test?.version_b.name}
                  value={funnelData.ab_test?.version_b.conversion}
                  precision={1}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                />
                <Tag color="green" style={{ marginTop: 8 }}>
                  <ArrowUpOutlined /> 胜出
                </Tag>
              </Col>
            </Row>
            <Divider />
            <Line {...lineConfig} height={200} />
          </Card>
        </Col>
      </Row>

      <Card title="📊 AI 辅助效果归因" className={styles.attributionCard}>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <div className={styles.attrItem}>
              <div className={styles.attrIcon}><BulbOutlined style={{ color: '#1890ff' }} /></div>
              <Text strong className={styles.attrLabel}>点击率提升</Text>
              <div className={styles.attrValue}>+42%</div>
              <Text type="secondary" className={styles.attrNote}>AI 优化文案</Text>
            </div>
          </Col>
          <Col span={8}>
            <div className={styles.attrItem}>
              <div className={styles.attrIcon}><BulbOutlined style={{ color: '#52c41a' }} /></div>
              <Text strong className={styles.attrLabel}>加购率提升</Text>
              <div className={styles.attrValue}>+18%</div>
              <Text type="secondary" className={styles.attrNote}>AI 优化卖点</Text>
            </div>
          </Col>
          <Col span={8}>
            <div className={styles.attrItem}>
              <div className={styles.attrIcon}><BulbOutlined style={{ color: '#722ed1' }} /></div>
              <Text strong className={styles.attrLabel}>成交率提升</Text>
              <div className={styles.attrValue}>+12%</div>
              <Text type="secondary" className={styles.attrNote}>AI 优化落地页</Text>
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        {funnelData.stages.map((stage: any, i: number) => {
          const prev = i > 0 ? funnelData.stages[i - 1] : null
          const lossRate = prev ? (((prev.count - stage.count) / prev.count) * 100).toFixed(1) : '0'
          const suggestion = OPTIMIZATION_SUGGESTIONS[stage.name]
          
          const stageCard = (
            <Col span={6} key={stage.name}>
              <Card className={styles.statCard}>
                <Statistic
                  title={stage.name}
                  value={stage.count}
                  precision={0}
                  groupSeparator=","
                  valueStyle={{ fontSize: 28 }}
                />
                <Divider />
                <Space>
                  <Tag>转化率 {stage.rate}%</Tag>
                  {i > 0 && <Tag color="red">流失 {lossRate}%</Tag>}
                </Space>
              </Card>
            </Col>
          )

          if (suggestion) {
            return (
              <Popover
                key={stage.name}
                title={<Text strong>优化建议</Text>}
                content={<Text>{suggestion}</Text>}
                trigger="click"
              >
                {stageCard}
              </Popover>
            )
          }

          return stageCard
        })}
      </Row>
    </div>
  )
}
