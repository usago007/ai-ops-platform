/**
 * AgentOrchestrationPage — Agent 编排（每 Agent 映射到主链业务能力）
 */
import React, { useState, useEffect } from 'react'
import { Alert, Empty, Tag, Progress, Space, Typography, Button } from 'antd'
import { ApiOutlined, ThunderboltOutlined, CheckCircleOutlined } from '@/iconMap'
import { useNavigate } from 'react-router-dom'
import { mockAgentConfigAdapter } from '../../adapters'
import { AGENT_STEP_MAP } from '../../contracts/agent-config'
import { EntitySummaryCard, InfoStrip, PageShell } from '../shared/SharedUI'
import { MetricRibbon } from '../shared/MetricRibbon'
import type { AgentConfig } from '../../contracts'

const { Text } = Typography
const TYPE_COLOR: Record<string, string> = { parsing: 'blue', recommendation: 'purple', generation: 'green', loopback: 'orange', review: 'cyan' }

export const AgentOrchestrationPage: React.FC = () => {
  const [agents, setAgents] = useState<AgentConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    mockAgentConfigAdapter.list()
      .then(a => { setAgents(a); setLoading(false) })
      .catch(() => { setError('加载 Agent 配置失败，请刷新重试'); setLoading(false) })
  }, [])

  if (error) return <PageShell><Alert type="error" title={error} showIcon style={{ marginTop: 16 }} /></PageShell>

  return (
    <PageShell title={<><ApiOutlined style={{ marginRight: 8 }} />Agent 编排 — 业务能力映射</>} loading={loading}>
      <MetricRibbon items={[
        { label: '活跃 Agent', value: `${agents.filter(a => a.enabled).length}`, prefix: <ApiOutlined /> },
        { label: '平均成功率', value: `${Math.round(agents.reduce((s, a) => s + a.successRate, 0) / Math.max(1, agents.length) * 100)}%`, prefix: <CheckCircleOutlined />, color: 'var(--success)' },
      ]} />

      {agents.length === 0 ? (
        <Empty description="暂无 Agent 配置" style={{ marginTop: 'var(--page-section-gap)' }} />
      ) : (
        agents.map(agent => (
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
            <div style={{ marginTop: 12 }}>
              <Space><Text type="secondary">成功率</Text><Progress percent={Math.round(agent.successRate * 100)} size="small" style={{ width: 200 }} /></Space>
              <Text type="secondary" style={{ marginLeft: 16 }}>Prompt: {(agent.promptTemplate || '').slice(0, 60)}...</Text>
            </div>
          </EntitySummaryCard>
        ))
      )}
    </PageShell>
  )
}

export default AgentOrchestrationPage
