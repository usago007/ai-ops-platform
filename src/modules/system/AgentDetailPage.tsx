/**
 * AgentDetailPage — Agent 编排配置详情
 */
import React, { useEffect, useState } from 'react'
import { Alert, Card, Tag, Typography, Empty } from 'antd'
import { ApiOutlined } from '@/iconMap'
import { useParams } from 'react-router-dom'
import { mockAgentConfigAdapter } from '../../adapters'
import { PageShell, InfoStrip } from '../shared/SharedUI'
import { formatDateTime } from '../shared/formatters'
import { DetailHeader } from '../shared/DetailHeader'
import type { AgentConfig } from '../../contracts'

const { Text, Paragraph } = Typography

const AGENT_TYPE_LABELS: Record<string, string> = {
  parsing: '解析',
  recommendation: '推荐',
  generation: '生成',
  loopback: '回流',
  review: '审核',
}

export const AgentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [agent, setAgent] = useState<AgentConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!id) { setLoading(false); return }
    mockAgentConfigAdapter.getById(id).then(async (found) => {
      if (!found) {
        const all = await mockAgentConfigAdapter.list()
        setAgent(all.find(a => a.id === id) || null)
      } else {
        setAgent(found)
      }
      setLoading(false)
    }).catch(() => { setError('加载 Agent 详情失败，请刷新重试'); setLoading(false) })
  }, [id])

  if (error) return <PageShell><Alert type="error" title={error} showIcon style={{ marginTop: 16 }} /></PageShell>

  if (loading) return <PageShell loading />
  if (!agent) return <PageShell><Empty description="Agent 配置未找到" /></PageShell>

  return (
    <PageShell>
      <DetailHeader
        backTo={{ label: '返回 Agent 编排', path: '/sys/agent-orchestration' }}
        icon={<ApiOutlined />}
        title={`Agent 详情 — ${agent.name}`}
      />
      <Card>
        <InfoStrip
          bordered
          items={[
            { label: 'ID', value: agent.id },
            { label: '名称', value: <Text strong>{agent.name}</Text> },
            { label: '能力', value: <Tag color="blue">{agent.capability}</Tag> },
            { label: '步骤', value: <Tag>{agent.step}</Tag> },
            { label: '类型', value: <Tag color="purple">{AGENT_TYPE_LABELS[agent.type] || agent.type}</Tag> },
            { label: '模型 ID', value: <Tag>{agent.modelId}</Tag> },
            { label: '工作流 ID', value: <Tag>{agent.workflowId}</Tag> },
            { label: '状态', value: <Tag color={agent.enabled ? 'green' : 'default'}>{agent.enabled ? '启用' : '禁用'}</Tag> },
            { label: '成功率', value: `${Math.round(agent.successRate * 100)}%` },
            { label: '版本', value: agent.version },
            { label: '更新时间', value: formatDateTime(agent.updatedAt) },
          ]}
        />
      </Card>

      <Card title="Prompt 模板" style={{ marginTop: 16 }}>
        <Paragraph className="whitespace-pre-wrap font-mono text-sm" style={{ background: 'var(--bg-primary)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)' }}>
          {agent.promptTemplate}
        </Paragraph>
      </Card>
    </PageShell>
  )
}

export default AgentDetailPage
