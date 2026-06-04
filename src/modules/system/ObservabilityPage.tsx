/**
 * ObservabilityPage — 可观测性页
 */
import React, { useEffect, useState } from 'react'
import { Alert, Empty, Table, Row, Col } from 'antd'
import { DashboardOutlined, WarningOutlined, FileSearchOutlined, CheckCircleOutlined } from '@/iconMap'
import { mockSystemHealthAdapter, mockAuditAdapter } from '../../adapters'
import { mockDelay } from '../../adapters/mock/latency'
import { PageShell } from '../shared/SharedUI'
import { InsightPanel } from '../shared/InsightPanel'
import { EvidenceTimeline } from '../shared/EvidenceTimeline'
import { MetricSummaryStrip } from '../shared/MetricSummaryStrip'
import { MetricRibbon } from '../shared/MetricRibbon'
import { STEP_MAIN_CHAIN_MAP } from '../../contracts/system-health'
import type { SystemHealth, AuditEntry } from '../../contracts'


export const ObservabilityPage: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  if (error) return <PageShell><Alert type="error" title={error} showIcon style={{ marginTop: 16 }} /></PageShell>

  const recentFailures = auditEntries.filter(e => e.result === 'failure').slice(0, 5)

  return (
    <PageShell title={<><DashboardOutlined style={{ marginRight: 8 }} />可观测性</>} loading={loading}>
      {!health ? (
        <Empty description="暂无系统健康数据" style={{ marginTop: 40 }} />
      ) : (
        <>
          <MetricRibbon items={[
            { label: '活跃连接', value: health.activeConnections, prefix: <CheckCircleOutlined />, color: 'var(--success)' },
            { label: '错误率', value: `${(health.errorRate * 100).toFixed(2)}%`, color: health.errorRate > 0.05 ? 'var(--error)' : 'var(--success)' },
            { label: '平均延迟', value: `${health.avgLatencyMs}ms`, color: 'var(--brand-primary)' },
            { label: '审计条目', value: health.auditEntries.toLocaleString() },
          ]} />

          <Row gutter={[16, 16]} style={{ marginTop: 'var(--page-section-gap)' }}>
            <Col xs={24} md={14}>
              <InsightPanel icon={<FileSearchOutlined />} title="服务调用分布">
                <Table
                  size="small"
                  pagination={false}
                  dataSource={Object.entries(health.modelCallsByStep).map(([step, count]) => ({
                    key: step,
                    step: STEP_MAIN_CHAIN_MAP[step] || step,
                    count,
                  }))}
                  columns={[
                    { title: '步骤', dataIndex: 'step', width: 150 },
                    { title: '调用次数', dataIndex: 'count', width: 120, render: (v: number) => v.toLocaleString() },
                  ]}
                />
              </InsightPanel>
            </Col>
            <Col xs={24} md={10}>
              <InsightPanel icon={<WarningOutlined />} title="最近失败事件">
                <EvidenceTimeline
                  items={recentFailures.map(e => ({
                    title: `${e.action} · ${e.targetType}`,
                    description: e.detail,
                    timestamp: e.timestamp,
                    status: 'negative' as const,
                  }))}
                  emptyText="无失败事件"
                />
              </InsightPanel>
            </Col>
          </Row>

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
        </>
      )}
    </PageShell>
  )
}

export default ObservabilityPage
