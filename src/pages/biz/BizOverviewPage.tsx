import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Button, Space, Typography, Tag, Modal, Descriptions, Spin, Table, Divider } from 'antd'
import {
  InboxOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RocketOutlined,
  SearchOutlined,
  BookOutlined,
  DollarOutlined,
  SendOutlined,
  TrophyOutlined,
  FrownOutlined,
  FileTextOutlined,
  DatabaseOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { MetricCard } from '../../components/MetricCard'
import { ProcessFlow } from '../../components/ProcessFlow/ProcessFlow'
import { CaseCard } from '../../components/CaseCard/CaseCard'
import { CapabilityBanner } from '../../components/CapabilityBanner/CapabilityBanner'
import { bizService } from '../../services'
import styles from './BizOverviewPage.module.css'

const { Title, Text, Paragraph } = Typography

const KB_TYPE_CONFIG: Record<string, { color: string; label: string }> = {
  'pricing': { color: 'blue', label: '报价策略' },
  'lost_analysis': { color: 'red', label: '丢单分析' },
  'template': { color: 'green', label: '报价模板' },
  'service': { color: 'purple', label: '服务方案' },
}

export const BizOverviewPage: React.FC = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState<any>(null)
  const [cases, setCases] = useState<any[]>([])
  const [funnel, setFunnel] = useState<any>(null)
  const [sources, setSources] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [knowledgeBase, setKnowledgeBase] = useState<any[]>([])
  const [trend, setTrend] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCase, setSelectedCase] = useState<any>(null)
  const [selectedKB, setSelectedKB] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statsRes, casesRes, funnelRes, sourcesRes, categoriesRes, kbRes, trendRes] = await Promise.all([
        bizService.getOverviewStats(),
        bizService.getCases(),
        bizService.getAttributionFunnel(),
        bizService.getAttributionSource(),
        bizService.getAttributionCategory(),
        bizService.getKnowledgeBase(),
        bizService.getAttributionTrend(),
      ])
      if (statsRes.success) setStats(statsRes.data)
      if (casesRes.success) setCases(casesRes.data.cases)
      if (funnelRes.success) setFunnel(funnelRes.data)
      if (sourcesRes.success) setSources(sourcesRes.data.sources)
      if (categoriesRes.success) setCategories(categoriesRes.data.categories)
      if (kbRes.success) setKnowledgeBase(kbRes.data.items)
      if (trendRes.success) setTrend(trendRes.data.trend)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className={styles.center}><Spin size="large" tip="加载业务数据..." /></div>
  }

  const funnelSteps = [
    { key: 'lead', label: '线索获取', route: '/inquiry/list', status: 'completed', icon: <InboxOutlined />, description: '收集各渠道询价线索' },
    { key: 'transform', label: 'AI转化', route: '/inquiry/transform', status: 'completed', icon: <ThunderboltOutlined />, description: 'AI自动解析询价文本' },
    { key: 'classify', label: '解析确认', route: '/inquiry/result', status: 'active', icon: <SearchOutlined />, description: '智能类目分类' },
    { key: 'quotation', label: '报价准备', route: '/inquiry/quotation-list', status: 'completed', icon: <FileTextOutlined />, description: '推荐历史方案+编辑报价单' },
    { key: 'followup', label: '报价发送+跟进', route: '/inquiry/quotation-list', status: 'completed', icon: <SendOutlined />, description: '发送报价并持续跟进' },
    { key: 'result', label: '成单/丢单', route: '/inquiry/quotation-list', status: 'pending', icon: <DollarOutlined />, description: '标记结果沉淀知识' },
    { key: 'attribution', label: '转化归因', route: '/biz/overview', status: 'pending', icon: <DatabaseOutlined />, description: '数据归因看板分析' },
  ]

  const sourceColumns = [
    { title: '来源渠道', dataIndex: 'name', key: 'name' },
    { title: '线索数量', dataIndex: 'count', key: 'count', width: 100 },
    { title: '成单数', dataIndex: 'won', key: 'won', width: 90 },
    {
      title: '转化率', dataIndex: 'rate', key: 'rate', width: 100,
      render: (v: number) => <Tag color={v >= 20 ? 'green' : v >= 15 ? 'orange' : 'red'}>{v}%</Tag>,
    },
  ]

  const categoryColumns = [
    { title: '品类', dataIndex: 'name', key: 'name' },
    { title: '询价数', dataIndex: 'count', key: 'count', width: 90 },
    { title: '成单数', dataIndex: 'won', key: 'won', width: 90 },
    {
      title: '转化率', dataIndex: 'rate', key: 'rate', width: 100,
      render: (v: number) => <Tag color={v >= 20 ? 'green' : 'orange'}>{v}%</Tag>,
    },
    { title: '平均金额', dataIndex: 'avg_amount', key: 'avg_amount', width: 120, render: (v: number) => `¥${v.toLocaleString()}` },
  ]

  const kbColumns = [
    {
      title: '知识标题', dataIndex: 'title', key: 'title',
      render: (text: string, record: any) => (
        <Button type="link" className={styles.kbLinkButton} onClick={() => setSelectedKB(record)}>{text}</Button>
      ),
    },
    { title: '品类', dataIndex: 'category', key: 'category', width: 120 },
    {
      title: '类型', dataIndex: 'type', key: 'type', width: 100,
      render: (t: string) => <Tag color={KB_TYPE_CONFIG[t]?.color}>{KB_TYPE_CONFIG[t]?.label}</Tag>,
    },
    {
      title: '结果', dataIndex: 'outcome', key: 'outcome', width: 80,
      render: (o: string) => o === 'won' ? <Tag color="green" icon={<TrophyOutlined />}>成单</Tag> : <Tag color="red" icon={<FrownOutlined />}>丢单</Tag>,
    },
    { title: '金额', dataIndex: 'amount', key: 'amount', width: 110, render: (v: number) => v ? `¥${v.toLocaleString()}` : '-' },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 110 },
  ]

  return (
    <div className={styles.container}>
      <CapabilityBanner
        title="💡 业务提效模块能力说明"
        icon={<RocketOutlined />}
        capabilities={[
          '自动解析：品类 / 规格 / 数量 / 交期 / 地域 / 付款方式',
          '智能归类：基于行业知识图谱的二级类目分类',
          '相似推荐：历史询价方案智能匹配',
          '报价管理：历史方案推荐、编辑报价单、跟进时间线',
          '转化归因：线索到成单全链路数据分析',
        ]}
        limits={[
          '支持 PDF、Word、Excel、图片等多种格式',
          '单次处理最大 5000 字',
          '解析准确率 85%~98%（视文本质量而定）',
          '支持中文/英文/混合文本',
        ]}
        storageKey="biz-overview-banner-dismissed"
      />

      <Title level={3}>业务提效概览</Title>
      <Text type="secondary" className={styles.desc}>
        从线索获取到成单归因的端到端闭环，全面提升业务处理效率和转化率
      </Text>

      <Card title="完整业务处理链路" className={styles.card} size="small">
        <ProcessFlow steps={funnelSteps} />
      </Card>

      <Row gutter={[16, 16]} className={styles.metricsRow}>
        <Col span={6}>
          <MetricCard
            title="累计处理询价"
            value={stats?.processed || 0}
            suffix=" 条"
            trend={{ value: 23, positive: true }}
            tooltip="系统上线以来累计处理的询价总数"
          />
        </Col>
        <Col span={6}>
          <MetricCard
            title="成单转化率"
            value={funnel?.conversion_rate || 0}
            suffix="%"
            trend={{ value: 5, positive: true }}
            tooltip="从线索到成单的整体转化率"
          />
        </Col>
        <Col span={6}>
          <MetricCard
            title="平均报价周期"
            value={funnel?.avg_cycle_days || 0}
            suffix=" 天"
            trend={{ value: 15, positive: true }}
            tooltip="从线索获取到成单的平均天数"
          />
        </Col>
        <Col span={6}>
          <MetricCard
            title="知识库条目"
            value={knowledgeBase.length || 0}
            suffix=" 条"
            trend={{ value: 12, positive: true }}
            tooltip="沉淀的报价策略和案例分析数量"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="线索来源转化分析" className={styles.card} size="small">
            {sources.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', color: 'var(--text-tertiary)' }}>
                <InboxOutlined style={{ fontSize: 48, marginBottom: 16, color: 'var(--text-muted)' }} />
                <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 8 }}>暂无数据</p>
                <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>开始使用后，这里将展示您的数据概览</p>
              </div>
            ) : (
              <Table
                columns={sourceColumns}
                dataSource={sources}
                rowKey="name"
                size="small"
                pagination={false}
              />
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="品类转化分析" className={styles.card} size="small">
            <Table
              columns={categoryColumns}
              dataSource={categories}
              rowKey="name"
              size="small"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      <Card title="沉淀知识库" className={styles.card} size="small"
        extra={<Text type="secondary">基于成单/丢单结果自动沉淀</Text>}>
        {knowledgeBase.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', color: 'var(--text-tertiary)' }}>
            <InboxOutlined style={{ fontSize: 48, marginBottom: 16, color: 'var(--text-muted)' }} />
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 8 }}>暂无数据</p>
            <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>开始使用后，这里将展示您的数据概览</p>
          </div>
        ) : (
          <Table
            columns={kbColumns}
            dataSource={knowledgeBase}
            rowKey="id"
            size="small"
            pagination={false}
          />
        )}
      </Card>

      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card
            title="典型场景案例库"
            className={styles.card}
            extra={<Text type="secondary">点击案例查看完整解析流程</Text>}
          >
            {cases.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', color: 'var(--text-tertiary)' }}>
                <InboxOutlined style={{ fontSize: 48, marginBottom: 16, color: 'var(--text-muted)' }} />
                <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 8 }}>暂无数据</p>
                <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>开始使用后，这里将展示您的数据概览</p>
              </div>
            ) : (
              <Row gutter={[16, 16]}>
                {cases.map(c => (
                  <Col span={12} key={c.id}>
                    <CaseCard
                      title={c.title}
                      description={c.description}
                      difficulty={c.difficulty}
                      previewData={c}
                      onClick={() => setSelectedCase(c)}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </Card>
        </Col>

        <Col span={8}>
          <Card title="快捷入口" className={styles.card}>
            <Space direction="vertical" className={styles.quickLinks} size="middle">
              <Button type="primary" icon={<InboxOutlined />} block size="large" onClick={() => navigate('/inquiry/list')}>
                查看询价线索池
              </Button>
              <Button icon={<DollarOutlined />} block size="large" onClick={() => navigate('/inquiry/quotation-list')}>
                报价管理
              </Button>
              <Button icon={<SearchOutlined />} block size="large" onClick={() => navigate('/product/list')}>
                查看商品库
              </Button>
              <Button icon={<BookOutlined />} block size="large" onClick={() => navigate('/rules')}>
                浏览规则库
              </Button>
              <Button icon={<ThunderboltOutlined />} block size="large" onClick={() => navigate('/cs/workspace')}>
                客服工作台
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      <Modal
        title={`案例详情：${selectedCase?.title}`}
        open={!!selectedCase}
        onCancel={() => setSelectedCase(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedCase(null)}>关闭</Button>,
          <Button key="try" type="primary" onClick={() => { navigate('/inquiry/manual-entry'); setSelectedCase(null) }}>
            尝试类似询价
          </Button>,
        ]}
        width={800}
      >
        {selectedCase && (
          <div>
            <Paragraph type="secondary">{selectedCase.description}</Paragraph>
            <Tag color={selectedCase.difficulty === 'easy' ? 'green' : selectedCase.difficulty === 'medium' ? 'orange' : 'red'}>
              难度：{selectedCase.difficulty === 'easy' ? '简单' : selectedCase.difficulty === 'medium' ? '中等' : '复杂'}
            </Tag>
            <Descriptions title="原始询价文本" column={1} bordered size="small" className={styles.modalSection}>
              <Descriptions.Item label="内容">{selectedCase.original_text}</Descriptions.Item>
            </Descriptions>
            <Descriptions title="AI解析结果" column={2} bordered size="small" className={styles.modalSection}>
              <Descriptions.Item label="品类">{selectedCase.parse_result.category}</Descriptions.Item>
              <Descriptions.Item label="规格">{selectedCase.parse_result.spec}</Descriptions.Item>
              <Descriptions.Item label="数量">{selectedCase.parse_result.quantity.value} {selectedCase.parse_result.quantity.unit}</Descriptions.Item>
              <Descriptions.Item label="交期">{selectedCase.parse_result.delivery}</Descriptions.Item>
              <Descriptions.Item label="地区">{selectedCase.parse_result.region}</Descriptions.Item>
              <Descriptions.Item label="置信度">{(selectedCase.parse_result.confidence * 100).toFixed(1)}%</Descriptions.Item>
            </Descriptions>
            <Descriptions title="归类结果" column={2} bordered size="small" className={styles.modalSection}>
              <Descriptions.Item label="一级类目">{selectedCase.classify_result.level1}</Descriptions.Item>
              <Descriptions.Item label="置信度">{(selectedCase.classify_result.level1_confidence * 100).toFixed(1)}%</Descriptions.Item>
              <Descriptions.Item label="二级类目">{selectedCase.classify_result.level2}</Descriptions.Item>
              <Descriptions.Item label="置信度">{(selectedCase.classify_result.level2_confidence * 100).toFixed(1)}%</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      <Modal
        title={`知识库详情：${selectedKB?.title}`}
        open={!!selectedKB}
        onCancel={() => setSelectedKB(null)}
        footer={<Button onClick={() => setSelectedKB(null)}>关闭</Button>}
        width={700}
      >
        {selectedKB && (
          <div>
            <Paragraph type="secondary">{selectedKB.summary}</Paragraph>
            <Space wrap className={styles.kbModalTags}>
              <Tag color={KB_TYPE_CONFIG[selectedKB.type]?.color}>{KB_TYPE_CONFIG[selectedKB.type]?.label}</Tag>
              {selectedKB.outcome === 'won' ? (
                <Tag color="green" icon={<TrophyOutlined />}>成单 ¥{selectedKB.amount?.toLocaleString()}</Tag>
              ) : (
                <Tag color="red" icon={<FrownOutlined />}>丢单</Tag>
              )}
              <Tag>{selectedKB.source_lead}</Tag>
              {selectedKB.tags?.map((tag: string) => <Tag key={tag}>{tag}</Tag>)}
            </Space>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="品类">{selectedKB.category}</Descriptions.Item>
              <Descriptions.Item label="来源线索">{selectedKB.source_lead}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{selectedKB.created_at}</Descriptions.Item>
              {selectedKB.reason && <Descriptions.Item label="丢单原因" span={2}>{selectedKB.reason}</Descriptions.Item>}
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  )
}
