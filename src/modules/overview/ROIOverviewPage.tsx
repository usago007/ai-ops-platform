/**
 * ROIOverviewPage — 经营总览
 */
import React, { useEffect, useMemo, useState } from 'react'
import { Empty } from 'antd'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ApiOutlined,
  BarChartOutlined,
  BookOutlined,
  CheckCircleOutlined,
  CustomerServiceOutlined,
  DollarOutlined,
  RobotOutlined,
  TagsOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from '@/iconMap'
import { useNavigate } from 'react-router-dom'
import {
  mockKnowledgeItemAdapter,
  mockLeadAdapter,
  mockMetricSnapshotAdapter,
  mockOutcomeAdapter,
  mockProductAssetAdapter,
} from '../../adapters'
import { mockDelay } from '../../adapters/mock/latency'
import type { KnowledgeItem, Lead, MetricSnapshot, Outcome, ProductAsset } from '../../contracts'
import {
  getOverviewSummary,
  getProductContributions,
  getRecentLoopbackImpacts,
  getRecentOutcomeDrivers,
} from '../../domain'
import { PageShell } from '../shared/SharedUI'
import { MetricRibbon } from '../shared/MetricRibbon'
import { SignalBoard, type SignalItem } from '../shared/SignalBoard'
import styles from './ROIOverviewPage.module.css'

const percent = (value: number) => `${Math.round(value * 100)}%`
const money = (value: number) => `¥${Math.round(value).toLocaleString()}`

export const ROIOverviewPage: React.FC = () => {
  const navigate = useNavigate()
  const [latest, setLatest] = useState<MetricSnapshot | null>(null)
  const [history, setHistory] = useState<MetricSnapshot[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([])
  const [products, setProducts] = useState<ProductAsset[]>([])
  const [outcomes, setOutcomes] = useState<Outcome[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      mockMetricSnapshotAdapter.latest(),
      mockMetricSnapshotAdapter.history(),
      mockLeadAdapter.list(),
      mockKnowledgeItemAdapter.list(),
      mockProductAssetAdapter.list(),
      mockOutcomeAdapter.list(),
      mockDelay('aggregate'),
    ])
      .then(([metric, metricHistory, leadData, knowledgeData, productData, outcomeData]) => {
        setLatest(metric)
        setHistory(metricHistory)
        setLeads(leadData)
        setKnowledgeItems(knowledgeData)
        setProducts(productData)
        setOutcomes(outcomeData)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError('加载失败，请刷新重试')
        setLoading(false)
      })
  }, [])

  const productContribs = useMemo(() => getProductContributions(products, leads), [products, leads])
  const outcomeDrivers = useMemo(() => getRecentOutcomeDrivers(outcomes, leads, products, 5), [outcomes, leads, products])
  const loopbackImpacts = useMemo(() => getRecentLoopbackImpacts(knowledgeItems, outcomes, 5), [knowledgeItems, outcomes])
  const summary = useMemo(
    () => getOverviewSummary(leads, outcomes, knowledgeItems, productContribs),
    [leads, outcomes, knowledgeItems, productContribs],
  )
  const chronologicalHistory = useMemo(
    () => [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [history],
  )

  if (loading) return <PageShell loading />
  if (error) return <PageShell><div className={styles.errorState}>{error}</div></PageShell>
  if (!latest) return <PageShell><Empty description="暂无经营数据" style={{ marginTop: 40 }} /></PageShell>

  const currentMetric = chronologicalHistory.at(-1) || latest
  const periodStart = chronologicalHistory[0]?.date || latest.date
  const periodEnd = currentMetric.date
  const trendData = chronologicalHistory
    .map(item => ({
      date: item.date.slice(5),
      leadCount: item.leadCount,
      winRate: Math.round(item.winRate * 100),
      automationCoverage: Math.round(item.automationCoverage * 100),
      qualifiedRate: Math.round(item.qualifiedRate * 100),
      aiSavedHours: item.aiSavedHours,
      avgDealAmount: Math.round(item.avgDealAmount / 1000),
    }))

  const productChartData = productContribs.slice(0, 6).map(item => ({
    name: item.product.name.length > 10 ? `${item.product.name.slice(0, 10)}...` : item.product.name,
    leads: item.leadCount,
    winRate: Math.round(item.winRate * 100),
  }))

  const highValueLeads: SignalItem[] = [...leads]
    .sort((a, b) => b.businessValueScore - a.businessValueScore)
    .slice(0, 4)
    .map(lead => ({
      title: lead.companyName,
      description: `${lead.businessValueScore}/100 · ${lead.nextAction || lead.status}`,
      status: lead.priorityLevel === 'high' ? 'positive' : 'neutral',
      tags: [{ label: lead.priorityLevel === 'high' ? '高优先级' : lead.priorityLevel }],
      onClick: () => navigate(`/leads/${lead.id}`),
    }))

  const riskSignals: SignalItem[] = leads
    .filter(lead => lead.manualReviewRequired || lead.riskLevel === 'high' || lead.riskLevel === 'medium')
    .slice(0, 4)
    .map(lead => ({
      title: lead.companyName,
      description: lead.nextAction || '待处理',
      status: lead.manualReviewRequired ? 'warning' : 'negative',
      tags: [{ label: lead.manualReviewRequired ? '需复核' : '风险线索' }],
      onClick: () => navigate(`/leads/${lead.id}`),
    }))

  const driverSignals: SignalItem[] = outcomeDrivers.map(item => ({
    title: item.lead?.companyName || `线索 ${item.outcome.leadId}`,
    description: item.relatedProducts.map(product => product.name).join(' / ') || item.outcome.reasonDetail || '无关联商品',
    status: item.outcome.resultType === 'won' ? 'positive' : 'negative',
    tags: [{ label: item.outcome.resultType === 'won' ? '赢单' : '丢单' }],
    onClick: () => navigate(`/outcome/${item.outcome.id}`),
  }))

  const contribSignals: SignalItem[] = productContribs.slice(0, 5).map(item => ({
    title: item.product.name,
    description: `${item.leadCount} 线索 · ${percent(item.winRate)} 成交率`,
    status: item.winRate >= 0.5 ? 'positive' : 'neutral',
    tags: [
      ...(item.wonCount > 0 ? [{ label: `${item.wonCount} 赢单`, color: 'var(--success)' }] : []),
      ...(item.lostCount > 0 ? [{ label: `${item.lostCount} 丢单`, color: 'var(--error)' }] : []),
    ],
    onClick: () => navigate(`/product/${item.product.id}`),
  }))

  const loopbackSignals: SignalItem[] = loopbackImpacts.map(item => ({
    title: item.knowledgeItem.title,
    description: item.knowledgeItem.summary,
    status: item.knowledgeItem.type === 'loss_analysis' ? 'warning' : 'neutral',
    tags: [{ label: item.knowledgeItem.type }],
    onClick: () => navigate(`/knowledge/${item.knowledgeItem.id}`),
  }))

  const quickLinks = [
    { label: '客服工作台', value: `${leads.filter(lead => lead.status === 'new').length} 新线索`, icon: <CustomerServiceOutlined />, path: '/cs/workspace' },
    { label: '线索列表', value: `${summary.activeLeads} 活跃`, icon: <TeamOutlined />, path: '/leads/list' },
    { label: '商品资产中心', value: `${products.length} 商品`, icon: <TagsOutlined />, path: '/product/list' },
    { label: '知识库', value: `${summary.totalKnowledgeItems} 条目`, icon: <BookOutlined />, path: '/knowledge/list' },
    { label: '系统底座', value: '运行概况', icon: <ApiOutlined />, path: '/sys/dashboard' },
    { label: 'AI 成本', value: '调用成本', icon: <DollarOutlined />, path: '/sys/ai-cost' },
    { label: '可观测性', value: '审计风险', icon: <WarningOutlined />, path: '/sys/observability' },
  ]

  return (
    <PageShell
      icon={<BarChartOutlined />}
      title="经营总览"
      extra={<div className={styles.headerMeta}>统计周期 {periodStart} 至 {periodEnd}</div>}
    >
      <div className={styles.overviewFlow}>
        <MetricRibbon items={[
          { label: '线索总数', value: summary.totalLeads, prefix: <TeamOutlined /> },
          { label: '活跃线索', value: summary.activeLeads, prefix: <ThunderboltOutlined />, color: 'var(--brand-primary)' },
          { label: '成交率', value: percent(summary.winRate), prefix: <CheckCircleOutlined />, color: 'var(--success)' },
          { label: '平均成交金额', value: money(currentMetric.avgDealAmount), prefix: <DollarOutlined /> },
          { label: '节省工时', value: `${currentMetric.aiSavedHours}h`, prefix: <RobotOutlined />, color: 'var(--brand-secondary)' },
          { label: '知识回流', value: summary.totalKnowledgeItems, prefix: <BookOutlined /> },
        ]} />

        <div className={styles.analysisGrid}>
          <section className={`${styles.panel} ${styles.trendPanel}`}>
            <div className={styles.panelHeader}>
              <div>
                <h3>本期经营概况</h3>
                <span>成交率、自动化覆盖率、节省工时</span>
              </div>
            </div>
            <div className={styles.chartTall}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trendData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border-secondary)" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                  <Tooltip />
                  <Bar dataKey="aiSavedHours" name="节省工时" fill="var(--brand-primary)" radius={[4, 4, 0, 0]} opacity={0.18} />
                  <Line type="monotone" dataKey="winRate" name="成交率" stroke="var(--success)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="automationCoverage" name="自动化覆盖率" stroke="var(--brand-primary)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h3>转化与回流</h3>
                <span>主链关键节点</span>
              </div>
            </div>
            <div className={styles.funnel}>
              {[
                ['线索', currentMetric.leadCount, '本期新增'],
                ['合格率', percent(currentMetric.qualifiedRate), '需求确认'],
                ['采纳率', percent(currentMetric.replyAdoptionRate), '回复采纳'],
                ['闭环', summary.totalOutcomes, '结果记录'],
              ].map(([label, value, desc]) => (
                <div key={label} className={styles.funnelNode}>
                  <span className={styles.funnelLabel}>{label}</span>
                  <span className={styles.funnelNum}>{value}</span>
                  <span className={styles.funnelSub}>{desc}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className={styles.quickJumpGrid}>
          {quickLinks.map(link => (
            <button key={link.path} className={styles.quickJump} onClick={() => navigate(link.path)}>
              <span className={styles.quickIcon}>{link.icon}</span>
              <span>
                <strong>{link.label}</strong>
                <small>{link.value}</small>
              </span>
            </button>
          ))}
        </div>

        <div className={styles.boardGrid}>
          <SignalBoard title="重点线索" items={highValueLeads} emptyText="暂无重点线索" />
          <SignalBoard title="风险提醒" items={riskSignals} emptyText="暂无风险提醒" />
          <SignalBoard title="成交与流失" items={driverSignals} emptyText="暂无结果记录" />
        </div>

        <div className={styles.analysisGrid}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h3>商品贡献</h3>
                <span>线索数量与成交率</span>
              </div>
            </div>
            <div className={styles.chartShort}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productChartData} layout="vertical" margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border-secondary)" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={96} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                  <Tooltip />
                  <Bar dataKey="leads" name="线索" fill="var(--brand-primary)" radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
          <SignalBoard title="商品贡献" items={contribSignals} emptyText="暂无商品贡献" />
          <SignalBoard title="知识回流" items={loopbackSignals} emptyText="暂无知识回流" />
        </div>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h3>趋势明细</h3>
              <span>线索、成交率、合格率</span>
            </div>
          </div>
          <div className={styles.chartShort}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="leadTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border-secondary)" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                <Tooltip />
                <Area type="monotone" dataKey="leadCount" name="线索" stroke="var(--brand-primary)" fill="url(#leadTrend)" strokeWidth={2} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="qualifiedRate" name="合格率" stroke="var(--success)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </PageShell>
  )
}

export default ROIOverviewPage
