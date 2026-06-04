/**
 * AuditLogPage — 审计日志（每项映射到主链动作）
 */
import React, { useState, useEffect, useMemo } from 'react'
import { Alert, Table, Tag, Space } from 'antd'
import { FileSearchOutlined, LinkOutlined } from '@/iconMap'
import { useNavigate } from 'react-router-dom'
import { mockAuditAdapter } from '../../adapters'
import { PageShell } from '../shared/SharedUI'
import { FilterToolbar } from '../shared/FilterToolbar'
import sharedStyles from '../shared/SharedUI.module.css'
import { formatDateTime } from '../shared/formatters'
import type { AuditEntry } from '../../contracts'

const ACTION_LABEL: Record<string, string> = {
  parse: '需求理解', recommend: '方案推荐', reply_generate: '回复生成',
  quotation_generate: '报价生成', outcome_create: '结果创建', transition: '状态流转', review: '人工审核',
}
const ACTOR_OPTIONS = [
  { value: 'ai', label: 'AI' },
  { value: 'manual', label: '人工' },
]
const RESULT_OPTIONS = [
  { value: 'success', label: '成功' },
  { value: 'failure', label: '失败' },
]
const ACTION_OPTIONS = Object.entries(ACTION_LABEL).map(([k, v]) => ({ value: k, label: v }))

export const AuditLogPage: React.FC = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState<string | undefined>()
  const [targetFilter, setTargetFilter] = useState<string | undefined>()
  const [actorFilter, setActorFilter] = useState<string | undefined>()
  const [resultFilter, setResultFilter] = useState<string | undefined>()
  const navigate = useNavigate()

  useEffect(() => {
    mockAuditAdapter.list()
      .then(e => { setEntries(e); setLoading(false) })
      .catch(() => { setError('加载审计日志失败，请刷新重试'); setLoading(false) })
  }, [])

  const targetTypes = useMemo(() => [...new Set(entries.map(e => e.targetType))].map(t => ({ value: t, label: t })), [entries])

  const filtered = useMemo(() => entries.filter(e => {
    if (search) {
      const q = search.toLowerCase()
      if (!(e.action?.toLowerCase().includes(q) || e.detail?.toLowerCase().includes(q) || e.targetType?.toLowerCase().includes(q) || e.id?.toLowerCase().includes(q))) return false
    }
    if (actionFilter && e.action !== actionFilter) return false
    if (targetFilter && e.targetType !== targetFilter) return false
    if (actorFilter && e.actor !== actorFilter) return false
    if (resultFilter && e.result !== resultFilter) return false
    return true
  }), [entries, search, actionFilter, targetFilter, actorFilter, resultFilter])

  const formatTime = (ts: string) => formatDateTime(ts)

  if (error) return <PageShell><Alert type="error" title={error} showIcon style={{ marginTop: 16 }} /></PageShell>

  return (
    <PageShell icon={<FileSearchOutlined />} title="审计日志 — 主链动作映射" loading={loading}>
      <div className={sharedStyles.systemStack}>
        <FilterToolbar
          searchPlaceholder="搜索动作、详情、对象..."
          onSearch={setSearch}
          filters={[
            { key: 'action', label: '动作', options: ACTION_OPTIONS },
            { key: 'targetType', label: '对象', options: targetTypes },
            { key: 'actor', label: '操作人', options: ACTOR_OPTIONS },
            { key: 'result', label: '结果', options: RESULT_OPTIONS },
          ]}
          activeFilters={{ action: actionFilter, targetType: targetFilter, actor: actorFilter, result: resultFilter }}
          onFilterChange={(k, v) => {
            const setters: Record<string, (v: string | undefined) => void> = {
              action: setActionFilter, targetType: setTargetFilter, actor: setActorFilter, result: setResultFilter,
            }
            setters[k]?.(v)
          }}
        />
        <Table size="small" pagination={false}
          dataSource={filtered.map(e => ({ ...e, key: e.id }))}
          columns={[
            { title: '动作', dataIndex: 'action', width: 100, render: (a: string, record: AuditEntry) => (
              <Tag className={sharedStyles.clickableTag} onClick={() => navigate(`/sys/audit-log/${record.id}`)}>{ACTION_LABEL[a] || a}</Tag>
            ) },
            { title: '对象', dataIndex: 'targetType', width: 120, ellipsis: true },
            { title: '操作人', dataIndex: 'actor', width: 70, render: (a: string) => <Tag color={a === 'ai' ? 'blue' : 'green'}>{a === 'ai' ? 'AI' : '人工'}</Tag> },
            { title: '结果', dataIndex: 'result', width: 80, render: (r: string) => <Tag color={r === 'success' ? 'green' : 'red'}>{r}</Tag> },
            { title: '详情', dataIndex: 'detail', ellipsis: true, width: 200 },
            { title: '时间', dataIndex: 'timestamp', width: 140, render: (ts: string) => formatTime(ts) },
            { title: '线索', dataIndex: 'leadId', width: 90, render: (id: string) => id ? (
              <a onClick={() => navigate(`/leads/${id}`)}><Space size={4}><span className={sharedStyles.bodyIcon}><LinkOutlined /></span>{id}</Space></a>
            ) : '—' },
          ]}
          locale={{ emptyText: '无匹配审计日志' }}
        />
      </div>
    </PageShell>
  )
}

export default AuditLogPage
