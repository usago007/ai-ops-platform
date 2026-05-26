import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Spin, Typography, Tag, Divider, Space, Button, Popover } from 'antd'
import { ArrowUpOutlined, BarChartOutlined, PlusOutlined, BulbOutlined } from '@/iconMap'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { FunnelChart } from '../../../components/FunnelChart/FunnelChart'
import { CapabilityBanner } from '../../../components/CapabilityBanner/CapabilityBanner'
import { EmptyState } from '../../../components/EmptyState'
import { marketingService } from '../../../services'
import styles from '../MktOverviewPage.module.css'
import { CHART_COLORS, CHART_LABEL_COLOR, STATUS_COLORS } from '../../../styles/chartColors'

const { Text } = Typography

interface FunnelStage {
  name: string
  count: number
  rate: number
}

interface FunnelData {
  stages: FunnelStage[]
  ab_test?: {
    version_a: { name: string; conversion: number; data: number[] }
    version_b: { name: string; conversion: number; data: number[] }
    significant: boolean
  }
}

const OPTIMIZATION_SUGGESTIONS: Record<string, string> = {
  '展现': '使用AI生成更具吸引力的标题和主图',
  '点击': '优化卖点展示，突出核心差异化优势',
  '加购': '使用AI生成更具说服力的商品详情页',
  '成交': '应用智能优惠策略和限时促销话术',
}

export const ConversionTab: React.FC = () => {
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const result = await marketingService.getConversionFunnel()
      if (result.success) setFunnelData(result.data)
    } catch { console.error(e) }
    finally { setLoading(false) }
  }

  if (loading) {
    return <div className={styles.center}><Spin size="large" tip="加载转化数据..." /></div>
  }

  if (!funnelData) {
    return (
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
    )
  }

  const funnelStageData = funnelData.stages.map((s: FunnelStage) => ({ stage: s.name, count: s.count }))
  const funnelColors = [CHART_COLORS[1], CHART_COLORS[2], STATUS_COLORS.warning, STATUS_COLORS.success]

  const lineData: Array<{ week: string; [key: string]: string | number }> = []
  if (funnelData.ab_test) {
    const ab = funnelData.ab_test
    ab.version_a.data.forEach((v: number, i: number) => {
      const row: Record<string, string | number> = { week: `W${i + 1}` }
      row[ab.version_a.name] = v
      row[ab.version_b.name] = ab.version_b.data[i]
      lineData.push(row)
    })
  }

  return (
    <>
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

      <Row gutter={[16, 16]}>
        <Col span={10}>
          <Card title="全链路转化漏斗" className={styles.card}>
            <FunnelChart data={funnelStageData} colors={funnelColors} height={300} />
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
                  className={styles.versionAStat}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={funnelData.ab_test?.version_b.name}
                  value={funnelData.ab_test?.version_b.conversion}
                  precision={1}
                  suffix="%"
                  className={styles.versionBStat}
                />
                <Tag color="green" className={styles.tagMarginTop}>
                  <ArrowUpOutlined /> 胜出
                </Tag>
              </Col>
            </Row>
            <Divider />
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="week" tick={{ fill: CHART_LABEL_COLOR }} />
                <YAxis tick={{ fill: CHART_LABEL_COLOR }} />
                <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'CTR']} />
                <Legend />
                {lineData.length > 0 && Object.keys(lineData[0]!).filter(k => k !== 'week').map((key, idx) => (
                  <Line key={key} type="monotone" dataKey={key} stroke={idx === 0 ? CHART_LABEL_COLOR : STATUS_COLORS.success} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card title="📊 AI 辅助效果归因" className={styles.card}>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <div className={styles.attrItem}>
              <div className={styles.attrIconInfo}><BulbOutlined className={styles.attrIconInfo} /></div>
              <Text strong className={styles.attrLabel}>点击率提升</Text>
              <div className={styles.attrValueLg}>+42%</div>
              <Text type="secondary" className={styles.attrNote}>AI 优化文案</Text>
            </div>
          </Col>
          <Col span={8}>
            <div className={styles.attrItem}>
              <div className={styles.attrIconSuccess}><BulbOutlined className={styles.attrIconSuccess} /></div>
              <Text strong className={styles.attrLabel}>加购率提升</Text>
              <div className={styles.attrValueLg}>+18%</div>
              <Text type="secondary" className={styles.attrNote}>AI 优化卖点</Text>
            </div>
          </Col>
          <Col span={8}>
            <div className={styles.attrItem}>
              <div className={styles.attrIconChart5}><BulbOutlined className={styles.attrIconChart5} /></div>
              <Text strong className={styles.attrLabel}>成交率提升</Text>
              <div className={styles.attrValueLg}>+12%</div>
              <Text type="secondary" className={styles.attrNote}>AI 优化落地页</Text>
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        {funnelData.stages.map((stage: FunnelStage, i: number) => {
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
    </>
  )
}
