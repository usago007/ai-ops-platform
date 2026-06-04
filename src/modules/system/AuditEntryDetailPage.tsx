/**
 * AuditEntryDetailPage — 审计条目详情
 */
import React, { useEffect, useState } from 'react'
import { Alert, Card, Tag, Space, Typography, Empty, Button } from 'antd'
import { FileSearchOutlined, LinkOutlined } from '@/iconMap'
import { useParams, Link } from 'react-router-dom'
import { mockAuditAdapter, mockLeadAdapter } from '../../adapters'
import { PageShell, InfoStrip } from '../shared/SharedUI'
import { DetailHeader } from '../shared/DetailHeader'
import type { AuditEntry, Lead } from '../../contracts'

const { Text } = Typography

const ACTION_LABELS: Record<string, string> = {
  parse: '解析',
  recommend: '推荐',
  reply_generate: '回复生成',
  quotation_generate: '报价生成',
  outcome_create: '结果创建',
  transition: '状态变更',
  review: '审核',
}

const RESULT_COLORS: Record<string, string> = {
  success: 'green',
  failure: 'red',
  review_required: 'orange',
}

export const AuditEntryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [entry, setEntry] = useState<AuditEntry | null>(null)
  const [linkedLead, setLinkedLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!id) { setLoading(false); return }
    mockAuditAdapter.getById(id).then(async (found) => {
      if (!found) {
        const all = await mockAuditAdapter.list()
        setEntry(all.find(e => e.id === id) || null)
      } else {
        setEntry(found)
        if (found.leadId) {
          const lead = await mockLeadAdapter.getById(found.leadId)
          setLinkedLead(lead || null)
        }
      }
      setLoading(false)
    }).catch(() => { setError('加载审计详情失败，请刷新重试'); setLoading(false) })
  }, [id])

  if (error) return <PageShell><Alert type="error" title={error} showIcon style={{ marginTop: 16 }} /></PageShell>

  if (loading) return <PageShell loading />
  if (!entry) return <PageShell><Empty description="审计条目未找到" /></PageShell>

  return (
    <PageShell>
      <DetailHeader
        backTo={{ label: '返回审计日志', path: '/sys/audit-log' }}
        title={<><FileSearchOutlined /> 审计详情 — {entry.id}</>}
      />
      <Card>
        <InfoStrip
          bordered
          items={[
            { label: 'ID', value: entry.id },
            { label: '动作', value: <Tag color="blue">{ACTION_LABELS[entry.action] || entry.action}</Tag> },
            { label: '目标类型', value: <Tag>{entry.targetType}</Tag> },
            { label: '目标 ID', value: entry.targetId },
            { label: '操作者', value: <Tag color={entry.actor === 'ai' ? 'purple' : 'default'}>{entry.actor === 'ai' ? 'AI' : entry.actor}</Tag> },
            { label: '结果', value: <Tag color={RESULT_COLORS[entry.result] || 'default'}>{entry.result}</Tag> },
            { label: '时间', value: entry.timestamp },
          ]}
        />
      </Card>

      <Card title="详情" style={{ marginTop: 16 }}>
        <Text>{entry.detail}</Text>
      </Card>

      {linkedLead && (
        <Card
          title={<Space><LinkOutlined /><Text strong>关联线索</Text></Space>}
          style={{ marginTop: 16 }}
        >
          <Space>
            <Link to={`/leads/${linkedLead.id}`}>
              <Button type="link">{linkedLead.companyName} ({linkedLead.id})</Button>
            </Link>
            <Tag>{linkedLead.status}</Tag>
          </Space>
        </Card>
      )}
    </PageShell>
  )
}

export default AuditEntryDetailPage
