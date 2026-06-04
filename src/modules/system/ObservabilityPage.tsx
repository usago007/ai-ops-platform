/**
 * ObservabilityPage — 可观测性页
 */
import React, { useEffect, useState, useMemo } from 'react'
import { Alert, Empty, Table } from 'antd'
import { DashboardOutlined, WarningOutlined, FileSearchOutlined, CheckCircleOutlined } from '@/iconMap'
import { mockSystemHealthAdapter, mockAuditAdapter } from '../../adapters'
import { mockDelay } from '../../adapters/mock/latency'
import { PageShell } from '../shared/SharedUI'
import { InsightPanel } from '../shared/InsightPanel'
import { EvidenceTimeline } from '../shared/EvidenceTimeline'
import { MetricSummaryStrip } from '../shared/MetricSummaryStrip'
import { MetricRibbon } from '../shared/MetricRibbon'
import { FilterToolbar } from '../shared/FilterToolbar'
import sharedStyles from '../shared/SharedUI.module.css'
import { STEP_MAIN_CHAIN_MAP } from '../../contracts/system-health'
import type { SystemHealth, AuditEntry } from '../../contracts'


export const ObservabilityPage: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stepFilter, setStepFilter] = useState<string | undefined>()
  const [failureSearch, setFailureSearch] = useState('')

  useEffect(() => {
    Promise.all([
      mockSystemHealthAdapter.get(),
      mockAuditAdapter.list(),
      mockDelay('aggregate'),
    ])
      .then(([h, a]) => {
        setHealth(h)
        setAuditEntries(a)
        setLoading(false)
      })
      .catch(() => {
        setError('加载可观测性数据失败，请刷新重试')
        setLoading(false)
      })
  }, [])

  const stepOptions = health
    ? Object.entries(health.modelCallsByStep).map(([k]) => ({ value: k, label: STEP_MAIN_CHAIN_MAP[k] || k }))
    : []

  const filteredCalls = useMemo(() => {
    if (!health) return []
    const entries = Object.entries(health.modelCallsByStep).map(([step, count]) => ({ key: step, step: STEP_MAIN_CHAIN_MAP[step] || step, count }))
    return stepFilter ? entries.filter(e => e.key === stepFilter || e.step === stepFilter) : entries
  }, [health, stepFilter])

  const allFailures = auditEntries.filter(e => e.result === 'failure')
  const filteredFailures = useMemo(() => {
    if (!failureSearch) return allFailures.slice(0, 5)
    const q = failureSearch.toLowerCase()
    return allFailures.filter(e => e.action?.toLowerCase().includes(q) || e.detail?.toLowerCase().includes(q) || e.targetType?.toLowerCase().includes(q)).slice(0, 5)
  }, [allFailures, failureSearch])

  if (error) return <PageShell><Alert type="error" title={error} showIcon style={{ marginTop: 16 }} /></PageShell>

  return (
    <PageShell icon={<DashboardOutlined />} title="可观测性" loading={loading}>
      {!health ? (
        <Empty description="暂无系统健康数据" style={{ marginTop: 40 }} />
      ) : (
        <div className={sharedStyles.systemStack}>
          <MetricRibbon items={[
            { label: '活跃连接', value: health.activeConnections, prefix: <CheckCircleOutlined />, color: 'var(--success)' },
            { label: '错误率', value: `${(health.errorRate * 100).toFixed(2)}%`, color: health.errorRate > 0.05 ? 'var(--error)' : 'var(--success)' },
            { label: '平均延迟', value: `${health.avgLatencyMs}ms`, color: 'var(--brand-primary)' },
            { label: '审计条目', value: health.auditEntries.toLocaleString() },
          ]} />

          <InsightPanel icon={<DashboardOutlined />} title="系统概览">
            <MetricSummaryStrip
              items={[
                { label: '模型调用总数', value: health.totalModelCalls.toLocaleString() },
                { label: '工作流执行次数', value: health.workflowRuns.toLocaleString() },
                { label: '知识条目数', value: health.knowledgeItemCount },
                { label: '指标快照数', value: health.metricSnapshotCount },
              ]}
            />
          </InsightPanel>

          <div className={sharedStyles.systemPanelGrid}>
            <InsightPanel icon={<FileSearchOutlined />} title="服务调用分布"
              extra={<FilterToolbar variant="inline" onSearch={() => {}} filters={[{ key: 'step', label: '步骤', options: stepOptions }]} activeFilters={{ step: stepFilter }} onFilterChange={(_, v) => setStepFilter(v)} />}>
              <Table
                size="small"
                pagination={false}
                dataSource={filteredCalls}
                columns={[
                  { title: '步骤', dataIndex: 'step', width: 150, ellipsis: true },
                  { title: '调用次数', dataIndex: 'count', width: 120, render: (v: number) => v.toLocaleString() },
                ]}
                locale={{ emptyText: <Empty description="无匹配步骤" /> }}
              />
            </InsightPanel>
            <InsightPanel icon={<WarningOutlined />} title="最近失败事件"
              extra={<FilterToolbar variant="inline" searchPlaceholder="搜索失败事件..." onSearch={setFailureSearch} />}>
              <EvidenceTimeline
                items={filteredFailures.map(e => ({
                  title: `${e.action} · ${e.targetType}`,
                  description: e.detail,
                  timestamp: e.timestamp,
                  status: 'negative' as const,
                }))}
                emptyText="无失败事件"
              />
            </InsightPanel>
          </div>
        </div>
      )}
    </PageShell>
  )
}

export default ObservabilityPage
