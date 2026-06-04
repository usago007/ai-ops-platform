/**
 * LeadListPage — 线索列表（设计系统 v2）
 */
import React, { useEffect, useState, useMemo } from 'react'
import { Alert, Tag, Typography } from 'antd'
import { AimOutlined } from '@/iconMap'
import { useNavigate } from 'react-router-dom'
import { mockLeadAdapter } from '../../adapters'
import { PageShell } from '../shared/SharedUI'
import sharedStyles from '../shared/SharedUI.module.css'
import { formatDateTime } from '../shared/formatters'
import { MetricRibbon } from '../shared/MetricRibbon'
import { FilterToolbar } from '../shared/FilterToolbar'
import { ObjectTable } from '../shared/ObjectTable'
import type { Lead } from '../../contracts'

const { Text } = Typography

const STATUS_OPTIONS = [
  { value: 'new', label: '新线索' }, { value: 'qualified', label: '已确认' },
  { value: 'recommending', label: '方案推荐中' }, { value: 'draft_ready', label: '草稿就绪' },
  { value: 'sent', label: '已发送' }, { value: 'following_up', label: '跟进中' },
  { value: 'won', label: '赢单' }, { value: 'lost', label: '丢单' }, { value: 'closed_looped', label: '已闭环' },
]

const PRIORITY_LABELS: Record<string, string> = { high: '高', medium: '中', low: '低' }
const PRIORITY_COLORS: Record<string, string> = { high: 'red', medium: 'orange', low: 'default' }
const STATUS_COLORS: Record<string, string> = {
  new: 'default', qualified: 'blue', recommending: 'purple', draft_ready: 'cyan',
  sent: 'geekblue', following_up: 'orange', won: 'green', lost: 'red', closed_looped: 'default',
}

export const LeadListPage: React.FC = () => {
  const navigate = useNavigate()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>()

  useEffect(() => {
    mockLeadAdapter.list()
      .then(l => { setLeads(l); setLoading(false) })
      .catch(() => { setError('加载线索列表失败，请刷新重试'); setLoading(false) })
  }, [])

  const filtered = useMemo(() => leads.filter(l => {
    if (search && !l.companyName.toLowerCase().includes(search.toLowerCase()) && !l.leadSummary.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter && l.status !== statusFilter) return false
    if (priorityFilter && l.priorityLevel !== priorityFilter) return false
    return true
  }), [leads, search, statusFilter, priorityFilter])

  const active = leads.filter(l => !['won', 'lost', 'closed_looped'].includes(l.status)).length
  const won = leads.filter(l => l.status === 'won').length
  const closed = leads.filter(l => l.status === 'won' || l.status === 'lost').length

  if (error) return <PageShell><Alert type="error" title={error} showIcon style={{ marginTop: 16 }} /></PageShell>

  return (
    <PageShell icon={<AimOutlined />} title="线索列表" loading={loading}>
      <MetricRibbon items={[
        { label: '线索总数', value: leads.length },
        { label: '活跃中', value: active, color: 'var(--brand-primary)' },
        { label: '赢单数', value: won, color: 'var(--success)' },
        { label: '成交率', value: closed > 0 ? `${Math.round(won / closed * 100)}%` : '—' },
      ]} />

      <div className={sharedStyles.contentGap}>
        <FilterToolbar
          searchPlaceholder="搜索公司名或摘要..."
          onSearch={setSearch}
          filters={[
            { key: 'status', label: '状态', options: STATUS_OPTIONS },
            { key: 'priority', label: '优先级', options: [
              { value: 'high', label: '高' }, { value: 'medium', label: '中' }, { value: 'low', label: '低' },
            ]},
          ]}
          activeFilters={{ status: statusFilter, priority: priorityFilter }}
          onFilterChange={(key, val) => key === 'status' ? setStatusFilter(val) : setPriorityFilter(val)}
        />
        <ObjectTable
          dataSource={filtered}
          columns={[
            { title: '公司', dataIndex: 'companyName', width: 160, render: (v: string) => (
              <Text strong style={{ color: 'var(--brand-primary)' }}>{v}</Text>
            )},
            { title: '状态', dataIndex: 'status', width: 90, render: (v: string) => <Tag color={STATUS_COLORS[v]}>{STATUS_OPTIONS.find(s => s.value === v)?.label || v}</Tag> },
            { title: '优先级', dataIndex: 'priorityLevel', width: 70, render: (v: string) => <Tag color={PRIORITY_COLORS[v]}>{PRIORITY_LABELS[v] || v}</Tag> },
            { title: '业务价值', dataIndex: 'businessValueScore', width: 80, render: (v: number) => isNaN(v) ? '—' : `${v}/100` },
            { title: '负责人', dataIndex: 'assignedTo', width: 100 },
            { title: '标签', dataIndex: 'tags', width: 160, render: (tags: string[]) => (Array.isArray(tags) ? tags.slice(0, 3) : []).map(t => <Tag key={t}>{t}</Tag>) },
            { title: '更新时间', dataIndex: 'updatedAt', width: 200, render: (v: string) => formatDateTime(v) },
          ]}
          onRowClick={(record) => navigate(`/leads/${record.id}`)}
          pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        />
      </div>
    </PageShell>
  )
}

export default LeadListPage
