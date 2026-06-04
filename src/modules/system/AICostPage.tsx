/**
 * AICostPage — AI 成本分析页
 */
import React, { useEffect, useState, useMemo } from 'react'
import { Alert, Table, Tag, Typography } from 'antd'
import { DollarOutlined, ThunderboltOutlined } from '@/iconMap'
import { mockModelConfigAdapter, mockSystemHealthAdapter } from '../../adapters'
import { PageShell } from '../shared/SharedUI'
import { InsightPanel } from '../shared/InsightPanel'
import { MetricRibbon } from '../shared/MetricRibbon'
import { FilterToolbar } from '../shared/FilterToolbar'
import sharedStyles from '../shared/SharedUI.module.css'
import type { ModelConfig } from '../../contracts'
import type { SystemHealth } from '../../contracts'

const { Text } = Typography

const DEFAULT_COST_PER_CALL = 0.005
const COST_PER_CALL: Record<string, number> = {
  'gpt-4o': 0.015,
  'gpt-4o-mini': 0.003,
  'claude-sonnet-4-6': 0.008,
  'claude-haiku-4-5': 0.001,
  'deepseek-v4': 0.002,
}

const getRate = (modelId: string) => COST_PER_CALL[modelId] || DEFAULT_COST_PER_CALL
const formatCost = (v: number) => `¥${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const AICostPage: React.FC = () => {
  const [models, setModels] = useState<ModelConfig[]>([])
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [providerFilter, setProviderFilter] = useState<string | undefined>()
  const [stepFilter, setStepFilter] = useState<string | undefined>()

  useEffect(() => {
    Promise.all([
      mockModelConfigAdapter.list(),
      mockSystemHealthAdapter.get(),
    ])
      .then(([m, h]) => {
        setModels(m)
        setHealth(h)
        setLoading(false)
      })
      .catch(() => {
        setError('加载成本数据失败，请刷新重试')
        setLoading(false)
      })
  }, [])

  const providers = useMemo(() => [...new Set(models.map(m => m.provider))].map(p => ({ value: p, label: p })), [models])
  const steps = useMemo(() => [...new Set(models.map(m => m.step))].map(s => ({ value: s, label: s })), [models])

  const filtered = useMemo(() => models.filter(m => {
    if (search) {
      const q = search.toLowerCase()
      if (!(m.name.toLowerCase().includes(q) || m.modelId.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q))) return false
    }
    if (providerFilter && m.provider !== providerFilter) return false
    if (stepFilter && m.step !== stepFilter) return false
    return true
  }), [models, search, providerFilter, stepFilter])

  const totalCalls = health?.totalModelCalls || 0
  const estimatedCost = models.reduce((sum, m) => sum + m.callCount * getRate(m.modelId), 0)

  if (error) return <PageShell><Alert type="error" title={error} showIcon style={{ marginTop: 16 }} /></PageShell>

  return (
    <PageShell icon={<DollarOutlined />} title="AI 成本分析" loading={loading}>
      <div className={sharedStyles.systemStack}>
        <MetricRibbon items={[
          { label: '模型调用总数', value: totalCalls.toLocaleString(), prefix: <ThunderboltOutlined /> },
          { label: '估算总成本', value: formatCost(estimatedCost), color: 'var(--warning)' },
          { label: '平均延迟', value: health ? `${health.avgLatencyMs}ms` : '—', color: 'var(--brand-primary)' },
        ]} />

        {health && (
          <InsightPanel icon={<ThunderboltOutlined />} title="按步骤分布">
            <Table
              size="small"
              pagination={false}
              dataSource={Object.entries(health.modelCallsByStep).map(([step, count]) => ({ key: step, step, count }))}
              columns={[
                { title: '步骤', dataIndex: 'step', width: 200, ellipsis: true },
                { title: '调用次数', dataIndex: 'count', width: 120, render: (v: number) => v.toLocaleString() },
              ]}
            />
          </InsightPanel>
        )}

        <InsightPanel icon={<DollarOutlined />} title="按模型拆分"
          extra={
            <FilterToolbar
              searchPlaceholder="搜索模型名称、ID..."
              onSearch={setSearch}
              filters={[
                { key: 'provider', label: '提供商', options: providers },
                { key: 'step', label: '步骤', options: steps },
              ]}
              activeFilters={{ provider: providerFilter, step: stepFilter }}
              onFilterChange={(k, v) => {
                if (k === 'provider') setProviderFilter(v); else setStepFilter(v)
              }}
            />
          }>
          <Table
            size="small"
            pagination={false}
            dataSource={filtered.map(m => {
              const rate = getRate(m.modelId)
              return { ...m, key: m.id, estimatedCost: m.callCount * rate }
            })}
            columns={[
              { title: '模型名称', dataIndex: 'name', width: 150, ellipsis: true },
              { title: '模型 ID', dataIndex: 'modelId', width: 160, ellipsis: true, render: (v: string) => <Tag>{v}</Tag> },
              { title: '提供商', dataIndex: 'provider', width: 90 },
              { title: '步骤', dataIndex: 'step', width: 100, ellipsis: true },
              { title: '调用次数', dataIndex: 'callCount', width: 90, render: (v: number) => v.toLocaleString() },
              { title: '单价', dataIndex: 'modelId', width: 80, render: (_id: string, record: ModelConfig) => `¥${getRate(record.modelId)}` },
              { title: '估算成本', dataIndex: 'estimatedCost', width: 120, render: (v: number) => <Text strong>{formatCost(v)}</Text> },
              { title: '平均延迟', dataIndex: 'avgLatencyMs', width: 90, render: (v: number) => `${v}ms` },
            ]}
            locale={{ emptyText: '无匹配模型' }}
          />
        </InsightPanel>
      </div>
    </PageShell>
  )
}

export default AICostPage
