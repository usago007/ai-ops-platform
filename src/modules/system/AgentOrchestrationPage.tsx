/**
 * AgentOrchestrationPage — Agent 编排（每 Agent 映射到主链业务能力）
 */
import React, { useState, useEffect, useMemo } from 'react'
import { Alert, Empty, Tag, Progress, Space, Typography, Button } from 'antd'
import { ApiOutlined, ThunderboltOutlined, CheckCircleOutlined } from '@/iconMap'
import { useNavigate } from 'react-router-dom'
import { mockAgentConfigAdapter } from '../../adapters'
import { AGENT_STEP_MAP } from '../../contracts/agent-config'
import { EntitySummaryCard, InfoStrip, PageShell } from '../shared/SharedUI'
import { FilterToolbar } from '../shared/FilterToolbar'
import { MetricRibbon } from '../shared/MetricRibbon'
import sharedStyles from '../shared/SharedUI.module.css'
import type { AgentConfig } from '../../contracts'

const { Text } = Typography
const TYPE_COLOR: Record<string, string> = { parsing: 'blue', recommendation: 'purple', generation: 'green', loopback: 'orange', review: 'cyan' }
const TYPE_LABELS: Record<string, string> = { parsing: '解析', recommendation: '推荐', generation: '生成', loopback: '回流', review: '审核' }
const TYPE_OPTIONS = Object.entries(TYPE_LABELS).map(([k, v]) => ({ value: k, label: v }))
const ENABLED_OPTIONS = [
  { value: 'enabled', label: '已启用' },
  { value: 'disabled', label: '已禁用' },
]

export const AgentOrchestrationPage: React.FC = () => {
  const [agents, setAgents] = useState<AgentConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string | undefined>()
  const [enabledFilter, setEnabledFilter] = useState<string | undefined>()
  const navigate = useNavigate()

  useEffect(() => {
    mockAgentConfigAdapter.list()
      .then(a => { setAgents(a); setLoading(false) })
      .catch(() => { setError('加载 Agent 配置失败，请刷新重试'); setLoading(false) })
  }, [])

  const filtered = useMemo(() => agents.filter(a => {
    if (search) {
      const q = search.toLowerCase()
      if (!(a.name.toLowerCase().includes(q) || a.capability?.toLowerCase().includes(q) || a.modelId?.toLowerCase().includes(q))) return false
    }
    if (typeFilter && a.type !== typeFilter) return false
    if (enabledFilter === 'enabled' && !a.enabled) return false
    if (enabledFilter === 'disabled' && a.enabled) return false
    return true
  }), [agents, search, typeFilter, enabledFilter])

  if (error) return <PageShell><Alert type="error" title={error} showIcon style={{ marginTop: 16 }} /></PageShell>

  return (
    <PageShell icon={<ApiOutlined />} title="Agent 编排 — 业务能力映射" loading={loading}>
      <div className={sharedStyles.systemStack}>
        <MetricRibbon items={[
          { label: '活跃 Agent', value: `${agents.filter(a => a.enabled).length}`, prefix: <ApiOutlined /> },
          { label: '平均成功率', value: `${Math.round(agents.reduce((s, a) => s + a.successRate, 0) / Math.max(1, agents.length) * 100)}%`, prefix: <CheckCircleOutlined />, color: 'var(--success)' },
        ]} />

        <FilterToolbar
          searchPlaceholder="搜索名称、能力、模型..."
          onSearch={setSearch}
          filters={[
            { key: 'type', label: '类型', options: TYPE_OPTIONS },
            { key: 'enabled', label: '状态', options: ENABLED_OPTIONS },
          ]}
          activeFilters={{ type: typeFilter, enabled: enabledFilter }}
          onFilterChange={(k, v) => {
            if (k === 'type') setTypeFilter(v); else setEnabledFilter(v)
          }}
        />

        {filtered.length === 0 ? (
          <Empty description="无匹配 Agent 配置" />
        ) : (
          <div className={sharedStyles.systemPanelGrid}>
            {filtered.map(agent => (
              <EntitySummaryCard key={agent.id}
                icon={<ThunderboltOutlined />}
                title={<Space>{agent.name}<Tag color={TYPE_COLOR[agent.type] || 'default'}>{AGENT_STEP_MAP[agent.type] || agent.type}</Tag></Space>}
                extra={<Button size="small" type="link" onClick={() => navigate(`/sys/agent-orchestration/${agent.id}`)}>详情 →</Button>}
              >
                <InfoStrip items={[
                  { label: '能力', value: agent.capability },
                  { label: '模型', value: agent.modelId },
                  { label: '工作流', value: agent.workflowId },
                  { label: '版本', value: agent.version },
                ]} />
                <div className={sharedStyles.sectionTopMd}>
                  <Space><Text type="secondary">成功率</Text><Progress percent={Math.round(agent.successRate * 100)} size="small" className={sharedStyles.inlineProgress} /></Space>
                </div>
                <Text type="secondary" className={sharedStyles.blockNote}>Prompt: {(agent.promptTemplate || '').slice(0, 60)}...</Text>
              </EntitySummaryCard>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}

export default AgentOrchestrationPage
