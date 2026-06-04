/**
 * ROIOverviewPage — AI 经营驾驶舱（设计系统 v2）
 *
 * 彻底废除 Ant Card/Statistic/List 直接使用，采用自定义组件构建产品气质。
 */
import React, { useEffect, useState } from 'react'
import { Empty, Table } from 'antd'
import { BarChartOutlined, ThunderboltOutlined, RobotOutlined, WarningOutlined } from '@/iconMap'
import { useNavigate } from 'react-router-dom'
import { mockKnowledgeItemAdapter, mockLeadAdapter, mockMetricSnapshotAdapter, mockOutcomeAdapter, mockProductAssetAdapter } from '../../adapters'
import { mockDelay } from '../../adapters/mock/latency'
import type { KnowledgeItem, Lead, MetricSnapshot, Outcome, ProductAsset } from '../../contracts'
import {
  getOverviewSummary, getProductContributions,
  getRecentLoopbackImpacts, getRecentOutcomeDrivers,
} from '../../domain'
import { PageShell } from '../shared/SharedUI'
import { OverviewHero } from '../shared/OverviewHero'
import { MetricRibbon } from '../shared/MetricRibbon'
import { SignalBoard, type SignalItem } from '../shared/SignalBoard'
import { DecisionPanel } from '../shared/DecisionPanel'
import styles from './ROIOverviewPage.module.css'

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
        setLatest(metric); setHistory(metricHistory); setLeads(leadData)
        setKnowledgeItems(knowledgeData); setProducts(productData); setOutcomes(outcomeData)
        setLoading(false)
      })
      .catch((err) => { console.error(err); setError('加载失败，请刷新重试'); setLoading(false) })
  }, [])

  if (loading) return <PageShell loading />
  if (error) return <PageShell><div className={styles.errorState}>{error}</div></PageShell>
  if (!latest) return <PageShell><Empty description="暂无经营数据" style={{ marginTop: 40 }} /></PageShell>

  const productContribs = getProductContributions(products, leads)
  const outcomeDrivers = getRecentOutcomeDrivers(outcomes, leads, products, 4)
  const loopbackImpacts = getRecentLoopbackImpacts(knowledgeItems, outcomes, 4)
  const summary = getOverviewSummary(leads, outcomes, knowledgeItems, productContribs)

  const highValueLeads: SignalItem[] = [...leads]
    .sort((a, b) => b.businessValueScore - a.businessValueScore)
    .slice(0, 4)
    .map(l => ({
      title: l.companyName,
      description: `${l.businessValueScore}/100 · ${l.status}`,
      status: l.priorityLevel === 'high' ? 'negative' : 'neutral',
      tags: [{ label: l.priorityLevel }],
      onClick: () => navigate(`/leads/${l.id}`),
    }))

  const riskLeads: SignalItem[] = leads
    .filter(l => l.manualReviewRequired || l.riskLevel === 'high' || l.riskLevel === 'medium')
    .slice(0, 4)
    .map(l => ({
      title: l.companyName,
      description: l.nextAction || '待处理',
      status: l.manualReviewRequired ? 'warning' : 'negative',
      tags: [{ label: l.manualReviewRequired ? '需复核' : '高风险' }],
      onClick: () => navigate(`/leads/${l.id}`),
    }))

  const driverSignals: SignalItem[] = outcomeDrivers.map(d => ({
    title: d.lead?.companyName || `线索 ${d.outcome.leadId}`,
    description: d.relatedProducts.map(p => p.name).join(' / ') || '无关联商品',
    status: d.outcome.resultType === 'won' ? 'positive' : 'negative',
    tags: [{ label: d.outcome.resultType === 'won' ? '赢单' : '丢单' }],
    onClick: () => navigate(`/outcome/${d.outcome.id}`),
  }))

  const contribSignals: SignalItem[] = productContribs.slice(0, 4).map(c => ({
    title: c.product.name,
    description: `${c.leadCount} 线索 · ${Math.round(c.winRate * 100)}% 成交率`,
    status: c.winRate > 0.5 ? 'positive' : 'neutral',
    tags: [
      ...(c.wonCount > 0 ? [{ label: `${c.wonCount} 赢单`, color: 'var(--success)' }] : []),
      ...(c.lostCount > 0 ? [{ label: `${c.lostCount} 丢单`, color: 'var(--error)' }] : []),
    ],
    onClick: () => navigate(`/product/${c.product.id}`),
  }))

  const loopbackSignals: SignalItem[] = loopbackImpacts.map(item => ({
    title: item.knowledgeItem.title,
    description: item.knowledgeItem.summary,
    status: item.knowledgeItem.type === 'loss_analysis' ? 'negative' : 'neutral',
    tags: [{ label: item.knowledgeItem.type }],
    onClick: () => navigate(`/knowledge/${item.knowledgeItem.id}`),
  }))

  return (
    <PageShell>
      <div className={styles.overviewFlow}>
        <div className={styles.heroBlock}>
          <OverviewHero
            eyebrow="AI 经营驾驶舱"
            title="先看 AI 带来的经营增量，再决定去哪里处理业务"
            subtitle="当前首页只保留价值视图。线索接入、商品下钻、系统底座都从这里向下进入。"
            primaryAction={{ label: '进入客服工作台', onClick: () => navigate('/cs/workspace') }}
            secondaryAction={{ label: '查看 AI 融入底座', onClick: () => navigate('/sys/dashboard') }}
            signals={[
              { label: '成交率', value: `${Math.round(latest.winRate * 100)}%`, color: 'var(--brand-primary)' },
              { label: 'AI 节省工时', value: `${latest.aiSavedHours}h`, color: 'var(--success)' },
              { label: '知识回流', value: knowledgeItems.length, color: 'var(--brand-secondary)' },
            ]}
          />
        </div>

        <div className={styles.metricBlock}>
          <MetricRibbon items={[
            { label: '收入提升', value: `¥${Math.round(latest.avgDealAmount * latest.winRate * latest.leadCount).toLocaleString()}`, prefix: <BarChartOutlined />, color: 'var(--brand-primary)' },
            { label: '效率替代', value: `${latest.aiSavedHours}h`, prefix: <RobotOutlined />, color: 'var(--success)' },
            { label: '风险控制', value: `${Math.round(latest.highRiskInterceptRate * 100)}%`, prefix: <WarningOutlined />, color: 'var(--warning)' },
            { label: '自动化覆盖率', value: `${Math.round(latest.automationCoverage * 100)}%`, prefix: <ThunderboltOutlined />, color: 'var(--brand-secondary)' },
          ]} />
        </div>

        <div className={styles.primaryGrid}>
          <DecisionPanel title="主链漏斗" variant="info">
            <div className={styles.funnel}>
              <div className={styles.funnelNode}>
                <span className={styles.funnelLabel}>会话接入</span>
                <span className={styles.funnelNum}>{latest.leadCount}</span>
                <span className={styles.funnelSub}>本期新增</span>
              </div>
              <div className={styles.funnelNode}>
                <span className={styles.funnelLabel}>需求确认</span>
                <span className={styles.funnelNum}>{Math.round(latest.qualifiedRate * 100)}%</span>
                <span className={styles.funnelSub}>合格率</span>
              </div>
              <div className={styles.funnelNode}>
                <span className={styles.funnelLabel}>方案生成</span>
                <span className={styles.funnelNum}>{Math.round(latest.replyAdoptionRate * 100)}%</span>
                <span className={styles.funnelSub}>采纳率</span>
              </div>
              <div className={styles.funnelNode}>
                <span className={styles.funnelLabel}>结果回流</span>
                <span className={styles.funnelNum}>{summary.totalOutcomes}</span>
                <span className={styles.funnelSub}>已闭环</span>
              </div>
            </div>
          </DecisionPanel>

          <SignalBoard
            title="优先动作"
            emptyText="暂无待办动作"
            items={[
              ...highValueLeads.slice(0, 2).map(l => ({ ...l, status: 'positive' as const })),
              ...riskLeads.slice(0, 2),
              ...driverSignals.slice(0, 2),
            ]}
          />
        </div>

        <div className={styles.secondaryGrid}>
          <SignalBoard title="商品贡献" items={contribSignals} emptyText="暂无商品贡献数据" />
          <SignalBoard title="知识回流" items={loopbackSignals} emptyText="暂无回流数据" />
          <SignalBoard
            title="AI 底座摘要"
            items={[
              { title: '自动化覆盖率', description: `${Math.round(latest.automationCoverage * 100)}%`, status: 'neutral' as const },
              { title: '人工复核率', description: `${Math.round(latest.manualReviewRate * 100)}%`, status: 'neutral' as const },
              { title: '高风险拦截率', description: `${Math.round(latest.highRiskInterceptRate * 100)}%`, status: 'warning' as const },
            ]}
          />
        </div>

        <div className={styles.trendBlock}>
          <h3 className={styles.sectionTitle}>趋势数据</h3>
          <Table
            size="small"
            pagination={false}
            dataSource={history.map((item, index) => ({ ...item, key: `hist-${index}` }))}
            columns={[
              { title: '日期', dataIndex: 'date', width: 120 },
              { title: '线索', dataIndex: 'leadCount', width: 70 },
              { title: '成交率', dataIndex: 'winRate', width: 80, render: (v: number) => `${Math.round(v * 100)}%` },
              { title: '合格率', dataIndex: 'qualifiedRate', width: 80, render: (v: number) => `${Math.round(v * 100)}%` },
              { title: '自动化率', dataIndex: 'automationCoverage', width: 90, render: (v: number) => `${Math.round(v * 100)}%` },
              { title: '报价周期(h)', dataIndex: 'quotationCycleHours', width: 100, render: (v: number) => v.toFixed(1) },
              { title: '平均金额', dataIndex: 'avgDealAmount', width: 110, render: (v: number) => `¥${v.toLocaleString()}` },
              { title: '节省工时', dataIndex: 'aiSavedHours', width: 90, render: (v: number) => `${v}h` },
            ]}
            locale={{ emptyText: '暂无历史数据' }}
          />
        </div>
      </div>
    </PageShell>
  )
}

export default ROIOverviewPage
