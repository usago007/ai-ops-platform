/**
 * OutcomeListPage — 结果列表页
 *
 * 遵循统一列表页结构：摘要区 → 过滤栏 → 主表格
 */
import React, { useEffect, useState, useMemo } from 'react'
import { Tag, Typography } from 'antd'
import { CheckCircleOutlined } from '@/iconMap'
import { useNavigate } from 'react-router-dom'
import { mockOutcomeAdapter, mockLeadAdapter } from '../../adapters'
import { PageShell, SectionHeader } from '../shared/SharedUI'
import { formatDateTime } from '../shared/formatters'
import sharedStyles from '../shared/SharedUI.module.css'
import { FilterToolbar } from '../shared/FilterToolbar'
import { ObjectTable } from '../shared/ObjectTable'
import { MetricRibbon } from '../shared/MetricRibbon'
import type { Outcome } from '../../contracts'

const { Text } = Typography

const RESULT_LABELS: Record<string, { label: string; color: string }> = {
  won: { label: '赢单', color: 'green' },
  lost: { label: '丢单', color: 'red' },
  continue_followup: { label: '继续跟进', color: 'blue' },
  invalid: { label: '无效', color: 'default' },
  transferred: { label: '已转交', color: 'purple' },
}

interface OutcomeRow extends Outcome {
  companyName: string
}

export const OutcomeListPage: React.FC = () => {
  const navigate = useNavigate()
  const [outcomes, setOutcomes] = useState<OutcomeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [resultFilter, setResultFilter] = useState<string | undefined>()

  useEffect(() => {
    Promise.all([
      mockOutcomeAdapter.list(),
      mockLeadAdapter.list(),
    ]).then(([o, l]) => {
      const leadMap = new Map(l.map(lead => [lead.id, lead]))
      const rows: OutcomeRow[] = o.map(outcome => ({
        ...outcome,
        companyName: leadMap.get(outcome.leadId)?.companyName || outcome.leadId,
      }))
      setOutcomes(rows)
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    return outcomes.filter(o => {
      if (search && !o.companyName.toLowerCase().includes(search.toLowerCase()) && !o.reasonDetail?.includes(search)) return false
      if (resultFilter && o.resultType !== resultFilter) return false
      return true
    })
  }, [outcomes, search, resultFilter])

  const won = outcomes.filter(o => o.resultType === 'won').length
  const lost = outcomes.filter(o => o.resultType === 'lost').length
  const closed = won + lost

  return (
    <PageShell icon={<CheckCircleOutlined />} title="结果列表" loading={loading}>
      <MetricRibbon items={[
        { label: '结果总数', value: outcomes.length },
        { label: '赢单数', value: won, color: 'var(--success)' },
        { label: '丢单数', value: lost, color: 'var(--error)' },
        { label: '赢单率', value: closed > 0 ? `${Math.round(won / closed * 100)}%` : '—' },
      ]} />

      <div className={sharedStyles.contentGap}>
        <SectionHeader icon={<CheckCircleOutlined />} title={`全部结果 (${filtered.length})`} />
        <FilterToolbar
          searchPlaceholder="搜索公司名或原因..."
          onSearch={setSearch}
          filters={[{
            key: 'resultType', label: '结果类型', options: Object.entries(RESULT_LABELS).map(([k, v]) => ({ value: k, label: v.label })),
          }]}
          activeFilters={{ resultType: resultFilter }}
          onFilterChange={(_, val) => setResultFilter(val)}
        />
        <ObjectTable
          dataSource={filtered}
          columns={[
            { title: '结果', dataIndex: 'resultType', width: 80, render: (v: string) => {
              const info = RESULT_LABELS[v] || { label: v, color: 'default' }
              return <Tag color={info.color}>{info.label}</Tag>
            }},
            { title: '公司', dataIndex: 'companyName', width: 140, render: (v: string) => (
              <Text style={{ color: 'var(--brand-primary)', cursor: 'pointer' }}>{v}</Text>
            )},
            { title: '金额', dataIndex: 'finalAmount', width: 100, render: (v: number | null) => v ? `¥${v.toLocaleString()}` : '—' },
            { title: '原因', dataIndex: 'reasonDetail', width: 200, ellipsis: true },
            { title: 'AI 贡献', dataIndex: 'aiContributionTags', width: 160, render: (tags: string[]) => tags.slice(0, 2).map(t => <Tag key={t} color="blue">{t}</Tag>) },
            { title: '回流', dataIndex: 'loopbackStatus', width: 80, render: (v: string) => <Tag color={v === 'processed' ? 'green' : 'orange'}>{v === 'processed' ? '已处理' : '待处理'}</Tag> },
            { title: '结单时间', dataIndex: 'closedAt', width: 180, render: (v: string) => formatDateTime(v) },
          ]}
          onRowClick={(record) => navigate(`/outcome/${record.id}`)}
          pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        />
      </div>
    </PageShell>
  )
}

export default OutcomeListPage
