/**
 * BusinessMetricsPage — 业务指标独立页
 */
import React, { useEffect, useState, useMemo } from 'react'
import { Alert, Empty, Table, Select } from 'antd'
import { BarChartOutlined, ThunderboltOutlined, RobotOutlined, ClockCircleOutlined } from '@/iconMap'
import { mockMetricSnapshotAdapter, mockLeadAdapter, mockOutcomeAdapter } from '../../adapters'
import { PageShell } from '../shared/SharedUI'
import { InsightPanel } from '../shared/InsightPanel'
import { MetricRibbon } from '../shared/MetricRibbon'
import { getOverviewSummary, getProductContributions } from '../../domain'
import sharedStyles from '../shared/SharedUI.module.css'
import type { MetricSnapshot, Lead, Outcome } from '../../contracts'

const RANGE_OPTIONS = [
  { value: 'all', label: '全部历史' },
  { value: '10', label: '最近 10 条' },
  { value: '5', label: '最近 5 条' },
]

export const BusinessMetricsPage: React.FC = () => {
  const [history, setHistory] = useState<MetricSnapshot[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [outcomes, setOutcomes] = useState<Outcome[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [range, setRange] = useState<string>('all')

  useEffect(() => {
    Promise.all([
      mockMetricSnapshotAdapter.history(),
      mockLeadAdapter.list(),
      mockOutcomeAdapter.list(),
    ])
      .then(([h, l, o]) => {
        setHistory(h)
        setLeads(l)
        setOutcomes(o)
        setLoading(false)
      })
      .catch(() => {
        setError('加载业务指标失败，请刷新重试')
        setLoading(false)
      })
  }, [])

  const visibleHistory = useMemo(() => {
    if (range === 'all') return history
    return history.slice(0, parseInt(range, 10))
  }, [history, range])

  if (error) return <PageShell><Alert type="error" title={error} showIcon style={{ marginTop: 16 }} /></PageShell>

  const latest = history[0]
  const summary = latest
    ? getOverviewSummary(leads, outcomes, [], getProductContributions([], leads))
    : null

  return (
    <PageShell icon={<BarChartOutlined />} title="业务指标" loading={loading}>
      {!latest || !summary ? (
        <Empty description="暂无业务指标数据" style={{ marginTop: 40 }} />
      ) : (
        <div className={sharedStyles.systemStack}>
          <MetricRibbon items={[
            { label: '线索总数', value: latest.leadCount, prefix: <ThunderboltOutlined /> },
            { label: '成交率', value: `${Math.round(latest.winRate * 100)}%`, prefix: <BarChartOutlined />, color: 'var(--success)' },
            { label: '自动化覆盖率', value: `${Math.round(latest.automationCoverage * 100)}%`, color: 'var(--brand-primary)' },
            { label: 'AI 节省工时', value: `${latest.aiSavedHours}h`, prefix: <RobotOutlined />, color: 'var(--brand-secondary)' },
          ]} />

          <div className={sharedStyles.systemPanelGrid}>
            <InsightPanel icon={<ClockCircleOutlined />} title="核心指标">
              <MetricRibbon items={[
                { label: '合格率', value: `${Math.round(latest.qualifiedRate * 100)}%` },
                { label: '回复采纳率', value: `${Math.round(latest.replyAdoptionRate * 100)}%` },
                { label: '报价周期', value: `${latest.quotationCycleHours}h` },
                { label: '平均成交金额', value: `¥${Math.round(latest.avgDealAmount).toLocaleString()}` },
              ]} />
            </InsightPanel>
            <InsightPanel icon={<ThunderboltOutlined />} title="风险与效率">
              <MetricRibbon items={[
                { label: '人工复核率', value: `${Math.round(latest.manualReviewRate * 100)}%` },
                { label: '高风险拦截率', value: `${Math.round(latest.highRiskInterceptRate * 100)}%` },
                { label: '活跃线索', value: summary.activeLeads },
                { label: '总结果数', value: summary.totalOutcomes },
              ]} />
            </InsightPanel>
          </div>

          <InsightPanel icon={<BarChartOutlined />} title="历史趋势"
            extra={<Select value={range} onChange={setRange} options={RANGE_OPTIONS} size="small" style={{ minWidth: 130 }} />}>
            <Table
              size="small"
              pagination={false}
              dataSource={visibleHistory.map((item, index) => ({ ...item, key: `hist-${index}` }))}
              columns={[
                { title: '日期', dataIndex: 'date', width: 120 },
                { title: '线索', dataIndex: 'leadCount', width: 70 },
                { title: '成交率', dataIndex: 'winRate', width: 80, render: (v: number) => `${Math.round(v * 100)}%` },
                { title: '合格率', dataIndex: 'qualifiedRate', width: 80, render: (v: number) => `${Math.round(v * 100)}%` },
                { title: '自动化率', dataIndex: 'automationCoverage', width: 90, render: (v: number) => `${Math.round(v * 100)}%` },
                { title: '报价周期(h)', dataIndex: 'quotationCycleHours', width: 100 },
                { title: '平均金额', dataIndex: 'avgDealAmount', width: 110, render: (v: number) => `¥${v.toLocaleString()}` },
                { title: '节省工时', dataIndex: 'aiSavedHours', width: 90, render: (v: number) => `${v}h` },
              ]}
              locale={{ emptyText: <Empty description="暂无历史数据" /> }}
            />
          </InsightPanel>
        </div>
      )}
    </PageShell>
  )
}

export default BusinessMetricsPage
