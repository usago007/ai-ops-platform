/**
 * AuditLogPage — 审计日志（每项映射到主链动作）
 */
import React, { useState, useEffect } from 'react'
import { Alert, Table, Tag, Space } from 'antd'
import { FileSearchOutlined, LinkOutlined } from '@/iconMap'
import { useNavigate } from 'react-router-dom'
import { mockAuditAdapter } from '../../adapters'
import { PageShell } from '../shared/SharedUI'
import type { AuditEntry } from '../../contracts'

const ACTION_LABEL: Record<string, string> = {
  parse: '需求理解', recommend: '方案推荐', reply_generate: '回复生成',
  quotation_generate: '报价生成', outcome_create: '结果创建', transition: '状态流转', review: '人工审核',
}

export const AuditLogPage: React.FC = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    mockAuditAdapter.list()
      .then(e => { setEntries(e); setLoading(false) })
      .catch(() => { setError('加载审计日志失败，请刷新重试'); setLoading(false) })
  }, [])

  if (error) return <PageShell><Alert type="error" title={error} showIcon style={{ marginTop: 16 }} /></PageShell>

  return (
    <PageShell title={<><FileSearchOutlined style={{ marginRight: 8 }} />审计日志 — 主链动作映射</>} loading={loading}>
      <Table size="small" dataSource={entries.map(e => ({ ...e, key: e.id }))}
        columns={[
          { title: '动作', dataIndex: 'action', width: 100, render: (a: string, record: AuditEntry) => (
            <Tag style={{ cursor: 'pointer' }} onClick={() => navigate(`/sys/audit-log/${record.id}`)}>{ACTION_LABEL[a] || a}</Tag>
          ) },
          { title: '对象', dataIndex: 'targetType', width: 140 },
          { title: '操作人', dataIndex: 'actor', width: 70, render: (a: string) => <Tag color={a === 'ai' ? 'blue' : 'green'}>{a === 'ai' ? 'AI' : '人工'}</Tag> },
          { title: '结果', dataIndex: 'result', width: 80, render: (r: string) => <Tag color={r === 'success' ? 'green' : 'red'}>{r}</Tag> },
          { title: '详情', dataIndex: 'detail', ellipsis: true },
          { title: '时间', dataIndex: 'timestamp', width: 160 },
          { title: '线索', dataIndex: 'leadId', width: 100, render: (id: string) => id ? (
            <a onClick={() => navigate(`/leads/${id}`)}><Space size={4}><LinkOutlined />{id}</Space></a>
          ) : '—' },
        ]}
      />
    </PageShell>
  )
}

export default AuditLogPage
