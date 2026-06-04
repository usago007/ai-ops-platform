/**
 * SystemStatusPage — 系统底座概览（映射到主链 AI 引擎）
 */
import React, { useState, useEffect } from 'react'
import { Alert, Card, Table, Empty } from 'antd'
import { ThunderboltOutlined, ApiOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@/iconMap'
import { mockSystemHealthAdapter } from '../../adapters'
import { STEP_MAIN_CHAIN_MAP } from '../../contracts/system-health'
import { PageShell, TraceSummary } from '../shared/SharedUI'
import { MetricRibbon } from '../shared/MetricRibbon'
import type { SystemHealth } from '../../contracts'

export const SystemStatusPage: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    mockSystemHealthAdapter.get()
      .then(h => { setHealth(h); setLoading(false) })
      .catch(() => { setError('加载系统状态失败，请刷新重试'); setLoading(false) })
  }, [])

  if (loading) return <PageShell loading />
  if (error) return <PageShell><Alert type="error" title={error} showIcon style={{ marginTop: 16 }} /></PageShell>
  if (!health) return <PageShell><Empty description="暂无系统健康数据" /></PageShell>

  const totalCalls = health.totalModelCalls || 1

  return (
    <PageShell title={<><ApiOutlined style={{ marginRight: 8 }} />系统底座概览 — AI 引擎调用</>}>
      <MetricRibbon items={[
        { label: '模型调用', value: health.totalModelCalls, prefix: <ThunderboltOutlined /> },
        { label: '工作流执行', value: health.workflowRuns, prefix: <ApiOutlined /> },
        { label: '审计条目', value: health.auditEntries, prefix: <CheckCircleOutlined /> },
        { label: '平均延迟', value: `${health.avgLatencyMs}ms`, prefix: <ClockCircleOutlined /> },
      ]} />

      <Card title="步骤分布 · 模型调用" size="small" style={{ marginTop: 'var(--page-section-gap)' }}>
        <Table size="small" pagination={false}
          dataSource={Object.entries(health.modelCallsByStep).map(([k, v]) => ({ key: k, step: STEP_MAIN_CHAIN_MAP[k] || k, calls: v }))}
          columns={[
            { title: '主链步骤', dataIndex: 'step', width: 140 },
            { title: '调用量', dataIndex: 'calls', width: 100 },
            { title: '占比', dataIndex: 'calls', width: 100, render: (v: number) => `${Math.round(v / totalCalls * 100)}%` },
          ]}
          locale={{ emptyText: <Empty description="暂无步骤数据" /> }}
        />
      </Card>

      <TraceSummary title="引擎调用统计" items={[
        { step: '需求理解', engine: 'gpt-4o-mini', source: `${health.modelCallsByStep.intent_parse || 0} 次调用`, result: 'active' },
        { step: '方案推荐', engine: 'gpt-4o', source: `${health.modelCallsByStep.product_recommend || 0} 次调用`, result: 'active' },
        { step: '回复生成', engine: 'claude-3-sonnet', source: `${health.modelCallsByStep.reply_generate || 0} 次调用`, result: 'active' },
        { step: '报价生成', engine: 'rule-engine', source: `${health.modelCallsByStep.quotation_generate || 0} 次调用`, result: 'active' },
        { step: '结果回流', engine: 'gpt-4o-mini', source: `${health.modelCallsByStep.outcome_loopback || 0} 次调用`, result: 'active' },
      ]} />
    </PageShell>
  )
}

export default SystemStatusPage
