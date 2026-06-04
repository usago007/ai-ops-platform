/**
 * KnowledgeListPage — 知识库列表页
 *
 * 遵循统一列表页结构：摘要区 → 过滤栏 → 主表格
 */
import React, { useEffect, useState, useMemo } from 'react'
import { Tag, Typography } from 'antd'
import { BookOutlined } from '@/iconMap'
import { useNavigate } from 'react-router-dom'
import { mockKnowledgeItemAdapter } from '../../adapters'
import { PageShell, SectionHeader } from '../shared/SharedUI'
import sharedStyles from '../shared/SharedUI.module.css'
import { FilterToolbar } from '../shared/FilterToolbar'
import { ObjectTable } from '../shared/ObjectTable'
import { MetricRibbon } from '../shared/MetricRibbon'
import type { KnowledgeItem } from '../../contracts'

const { Text } = Typography

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  faq: { label: 'FAQ', color: 'blue' },
  pricing_strategy: { label: '定价策略', color: 'purple' },
  loss_analysis: { label: '丢单分析', color: 'red' },
  product_note: { label: '商品备注', color: 'cyan' },
  reply_pattern: { label: '话术模板', color: 'green' },
}

export const KnowledgeListPage: React.FC = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<KnowledgeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string | undefined>()
  const [statusFilter, setStatusFilter] = useState<string | undefined>()

  useEffect(() => {
    mockKnowledgeItemAdapter.list().then(k => { setItems(k); setLoading(false) })
  }, [])

  const filtered = useMemo(() => {
    return items.filter(ki => {
      if (search && !ki.title.toLowerCase().includes(search.toLowerCase()) && !ki.summary.includes(search)) return false
      if (typeFilter && ki.type !== typeFilter) return false
      if (statusFilter && ki.status !== statusFilter) return false
      return true
    })
  }, [items, search, typeFilter, statusFilter])

  return (
    <PageShell title={<><BookOutlined style={{ marginRight: 8 }} />知识库</>} loading={loading}>
      <MetricRibbon items={[
        { label: '知识条目', value: items.length },
        { label: '已发布', value: items.filter(k => k.status === 'published').length, color: 'var(--success)' },
        { label: 'AI 生成', value: items.filter(k => k.createdBy === 'ai').length, color: 'var(--brand-primary)' },
        { label: '人工创建', value: items.filter(k => k.createdBy === 'manual').length },
      ]} />

      <div className={sharedStyles.contentGap}>
        <SectionHeader icon={<BookOutlined />} title={`全部知识条目 (${filtered.length})`} />
        <FilterToolbar
          searchPlaceholder="搜索标题或摘要..."
          onSearch={setSearch}
          filters={[
            { key: 'type', label: '类型', options: Object.entries(TYPE_LABELS).map(([k, v]) => ({ value: k, label: v.label })) },
            { key: 'status', label: '状态', options: [
              { value: 'draft', label: '草稿' }, { value: 'published', label: '已发布' }, { value: 'archived', label: '已归档' },
            ]},
          ]}
          activeFilters={{ type: typeFilter, status: statusFilter }}
          onFilterChange={(key, val) => key === 'type' ? setTypeFilter(val) : setStatusFilter(val)}
        />
        <ObjectTable
          dataSource={filtered}
          columns={[
            { title: '标题', dataIndex: 'title', width: 200, render: (v: string) => (
              <Text style={{ color: 'var(--brand-primary)', cursor: 'pointer' }}>{v}</Text>
            )},
            { title: '类型', dataIndex: 'type', width: 90, render: (v: string) => {
              const info = TYPE_LABELS[v] || { label: v, color: 'default' }
              return <Tag color={info.color}>{info.label}</Tag>
            }},
            { title: '状态', dataIndex: 'status', width: 70, render: (v: string) => (
              <Tag color={v === 'published' ? 'green' : v === 'draft' ? 'orange' : 'default'}>{v === 'published' ? '已发布' : v === 'draft' ? '草稿' : '已归档'}</Tag>
            )},
            { title: '摘要', dataIndex: 'summary', width: 240, ellipsis: true },
            { title: '关联', dataIndex: 'relatedProductIds', width: 80, render: (ids: string[]) => `${ids.length} 商品` },
            { title: '创建方式', dataIndex: 'createdBy', width: 80, render: (v: string) => <Tag>{v === 'ai' ? 'AI' : '人工'}</Tag> },
            { title: '创建时间', dataIndex: 'createdAt', width: 160, render: (v: string) => new Date(v).toLocaleDateString() },
          ]}
          onRowClick={(record) => navigate(`/knowledge/${record.id}`)}
          pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        />
      </div>
    </PageShell>
  )
}

export default KnowledgeListPage
