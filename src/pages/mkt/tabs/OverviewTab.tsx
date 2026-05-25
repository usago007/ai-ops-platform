import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Typography, Tag, Spin, Divider, Table } from 'antd'
import {
  RocketOutlined,
  ScanOutlined,
  BarChartOutlined,
  SendOutlined,
  StarOutlined,
  DollarOutlined,
  InboxOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { Line } from '@ant-design/charts'
import { MetricCard } from '../../../components/MetricCard'
import { ProcessFlow } from '../../../components/ProcessFlow/ProcessFlow'
import { CapabilityBanner } from '../../../components/CapabilityBanner/CapabilityBanner'
import { mktService } from '../../../services'
import styles from '../MktOverviewPage.module.css'
import { CHART_COLORS, CHART_LABEL_COLOR } from '../../../styles/chartColors'

const { Text } = Typography

export const OverviewTab: React.FC = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState<any>(null)
  const [templates, setTemplates] = useState<any[]>([])
  const [trend, setTrend] = useState<any>(null)
  const [attribution, setAttribution] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statsRes, templatesRes, trendRes, attrRes] = await Promise.all([
        mktService.getStats(),
        mktService.getTemplates(),
        mktService.getTrend(),
        mktService.getAttribution(),
      ])
      if (statsRes.success) setStats(statsRes.data)
      if (templatesRes.success) setTemplates(templatesRes.data.templates || [])
      if (trendRes.success) setTrend(trendRes.data.trend)
      if (attrRes.success) setAttribution(attrRes.data.items || [])
    } catch (e) {
      console.error(e)
      setStats({ generated: 0, avg_latency: 0, compliance_rate: 0, ctr_lift: 0 })
      setTemplates([])
      setTrend({ dates: [], ctr: [], ai_ctr: [] })
      setAttribution([])
    } finally {
      setLoading(false)
    }
  }

  const useTemplate = (tpl: any) => {
    navigate('/marketing/create', { state: { template: tpl } })
  }

  if (loading) {
    return <div className={styles.center}><Spin size="large" tip="加载营销数据..." /></div>
  }

  const chartConfig = trend ? {
    data: [
      ...trend.dates.map((d: string, i: number) => ({
        week: d,
        rate: trend.ctr[i],
        type: '自然流量',
      })),
      ...trend.dates.map((d: string, i: number) => ({
        week: d,
        rate: trend.ai_ctr[i],
        type: 'AI辅助内容',
      })),
    ],
    xField: 'week',
    yField: 'rate',
    seriesField: 'type',
    smooth: true,
    color: [CHART_LABEL_COLOR, CHART_COLORS[1]],
    point: { size: 5, shape: 'circle' },
    animation: { appear: { animation: 'fade-in', duration: 1000 } },
  } : {}

  const attributionColumns = [
    { title: '营销活动', dataIndex: 'name', key: 'name' },
    { title: '渠道', dataIndex: 'channel', key: 'channel', width: 90 },
    { title: '曝光量', dataIndex: 'impressions', key: 'impressions', width: 100 },
    { title: '点击率', dataIndex: 'ctr', key: 'ctr', width: 90, render: (v: number) => `${v}%` },
    { title: '转化率', dataIndex: 'cvr', key: 'cvr', width: 90, render: (v: number) => `${v}%` },
    { title: 'AI辅助', dataIndex: 'ai_assisted', key: 'ai_assisted', width: 80, render: (v: boolean) => v ? <Tag color="blue">是</Tag> : <Tag>否</Tag> },
    {
      title: '成单金额', dataIndex: 'amount', key: 'amount', width: 120,
      render: (v: number) => v ? <Text strong className={styles.amountSuccess}>¥{v.toLocaleString()}</Text> : '-',
    },
  ]

  return (
    <>
      <CapabilityBanner
        title="✨ 营销提效模块能力说明"
        icon={<RocketOutlined />}
        capabilities={[
          '内容生成：标题 + 副标题 + 正文 + CTA 按钮文案',
          '场景模板：节日促销 / 新品发布 / 限时秒杀 / 会员专属',
          '多渠道：落地页 / 短信 / Push / 社交媒体',
          '合规检测：广告法 / 行业规范 / 平台规则自动扫描',
          '效果归因：CTR/CVR 提升追踪与 A/B 测试',
          '业务联动：营销内容效果与询价线索转化归因',
        ]}
        limits={[
          '预计耗时：3-5 秒/版本',
          '一次生成：3-5 个版本供选择',
          '合规检测覆盖中国大陆地区广告法规',
        ]}
        storageKey="mkt-overview-banner-dismissed"
      />

      <Card title="营销全链路" className={styles.card} size="small">
        <ProcessFlow
          steps={[
            { key: 'selling-point', label: '卖点提炼', route: '/selling-point/SKU-1000', status: 'completed', icon: <StarOutlined />, description: 'AI 智能提炼 Top3 核心卖点' },
            { key: 'content-gen', label: '内容生成', route: '/marketing/create', status: 'completed', icon: <RocketOutlined />, description: '基于卖点生成多版本文案' },
            { key: 'compliance', label: '合规检测', route: '/marketing/create', status: 'active', icon: <ScanOutlined />, description: '自动扫描违禁词和违规内容' },
            { key: 'publish', label: '多渠道发布', route: '/marketing/create', status: 'pending', icon: <SendOutlined />, description: '一键推送至多渠道' },
            { key: 'track', label: '转化追踪', route: '/mkt/overview', status: 'pending', icon: <BarChartOutlined />, description: 'CTR/CVR 效果归因分析' },
            { key: 'attribution', label: '业务归因', route: '/biz/overview', status: 'pending', icon: <DollarOutlined />, description: '营销效果与询价成单关联' },
          ]}
        />
      </Card>

      <Row gutter={[16, 16]} className={styles.metricsRow}>
        <Col span={6}>
          <MetricCard
            title="累计生成内容"
            value={stats?.generated || 0}
            suffix=" 篇"
            trend={{ value: 34, positive: true }}
            tooltip="AI 辅助生成的营销内容总数"
          />
        </Col>
        <Col span={6}>
          <MetricCard
            title="平均生成耗时"
            value={stats?.avg_latency || 0}
            suffix=" ms"
            trend={{ value: 20, positive: true }}
            tooltip="从配置参数到生成完整内容的平均耗时"
          />
        </Col>
        <Col span={6}>
          <MetricCard
            title="合规通过率"
            value={stats?.compliance_rate || 0}
            suffix="%"
            trend={{ value: 3, positive: true }}
            tooltip="生成内容通过合规检测的比例"
          />
        </Col>
        <Col span={6}>
          <MetricCard
            title="CTR 提升比例"
            value={stats?.ctr_lift || 0}
            suffix="%"
            trend={{ value: 12, positive: true }}
            tooltip="使用 AI 辅助内容相比原始内容的 CTR 提升"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card title="场景模板库" className={styles.card}
            extra={<Text type="secondary">点击模板直接使用并预填参数</Text>}>
            {templates.length === 0 ? (
              <div className={styles.emptyState}>
                <InboxOutlined className={styles.emptyIcon} />
                <p className={styles.emptyTitle}>暂无数据</p>
                <p className={styles.emptyDesc}>开始使用后，这里将展示您的数据概览</p>
              </div>
            ) : (
              <Row gutter={[16, 16]}>
                {templates.map(tpl => (
                  <Col span={8} key={tpl.id}>
                    <Card
                      hoverable
                      className={styles.templateCard}
                      title={tpl.name}
                      extra={<Tag color="blue">{tpl.scene}</Tag>}
                      onClick={() => useTemplate(tpl)}
                    >
                      <p className={styles.templateDesc}>{tpl.description}</p>
                      <Divider />
                      <div className={styles.templateMeta}>
                        <Tag>{tpl.style}</Tag>
                        <span className={styles.expected}>预期 CTR: {tpl.expected_ctr}</span>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Card>
        </Col>

        <Col span={8}>
          <Card title="效果归因看板" className={styles.card}>
            <div className={styles.attribution}>
              <div className={styles.attrItem}>
                <Text strong>点击率提升</Text>
                <Tag color="green" className={styles.attrValue}>+42%</Tag>
                <Text type="secondary" className={styles.attrNote}>AI 优化文案</Text>
              </div>
              <div className={styles.attrItem}>
                <Text strong>加购率提升</Text>
                <Tag color="blue" className={styles.attrValue}>+18%</Tag>
                <Text type="secondary" className={styles.attrNote}>AI 优化卖点</Text>
              </div>
              <div className={styles.attrItem}>
                <Text strong>成交率提升</Text>
                <Tag color="purple" className={styles.attrValue}>+12%</Tag>
                <Text type="secondary" className={styles.attrNote}>AI 优化落地页</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {chartConfig && (
        <Card title="CTR 趋势对比（AI 辅助 vs 自然流量）" className={styles.card}>
          <Line {...chartConfig} height={250} containerStyle={{ height: 250 }} />
        </Card>
      )}

      <Card title="营销活动效果归因" className={styles.card} size="small"
        extra={<Text type="secondary">展示营销活动对询价和成单的贡献</Text>}>
        {attribution.length === 0 ? (
          <div className={styles.emptyState}>
            <InboxOutlined className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>暂无数据</p>
            <p className={styles.emptyDesc}>开始使用后，这里将展示您的数据概览</p>
          </div>
        ) : (
          <Table
            columns={attributionColumns}
            dataSource={attribution}
            rowKey="name"
            size="small"
            pagination={{ pageSize: 5 }}
          />
        )}
      </Card>
    </>
  )
}
