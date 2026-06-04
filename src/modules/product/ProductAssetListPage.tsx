/**
 * ProductAssetListPage — 商品资产中心（设计系统 v2）
 */
import React, { useState, useEffect, useMemo } from 'react'
import { Alert, Tag, Typography, Progress } from 'antd'
import { TagsOutlined } from '@/iconMap'
import { useNavigate } from 'react-router-dom'
import { mockProductAssetAdapter } from '../../adapters'
import { PageShell } from '../shared/SharedUI'
import sharedStyles from '../shared/SharedUI.module.css'
import { formatDateTime } from '../shared/formatters'
import { MetricRibbon } from '../shared/MetricRibbon'
import { FilterToolbar } from '../shared/FilterToolbar'
import { ObjectTable } from '../shared/ObjectTable'
import type { ProductAsset } from '../../contracts'

const { Text } = Typography

export const ProductAssetListPage: React.FC = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState<ProductAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    mockProductAssetAdapter.list()
      .then(p => { setProducts(p); setLoading(false) })
      .catch(() => { setError('加载商品列表失败，请刷新重试'); setLoading(false) })
  }, [])

  const filtered = useMemo(() => products.filter(p => {
    if (!search) return true
    const q = search.toLowerCase()
    return p.name.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
  }), [products, search])

  const brands = new Set(products.map(p => p.brand).filter(Boolean))
  const categories = new Set(products.map(p => p.category).filter(Boolean))

  if (error) return <PageShell><Alert type="error" title={error} showIcon style={{ marginTop: 16 }} /></PageShell>

  return (
    <PageShell icon={<TagsOutlined />} title="商品资产中心" loading={loading}>
      <MetricRibbon items={[
        { label: '商品总数', value: products.length },
        { label: '品牌数', value: brands.size, color: 'var(--brand-primary)' },
        { label: '品类数', value: categories.size, color: 'var(--brand-secondary)' },
        { label: 'AI 增强覆盖', value: `${Math.round(products.filter(p => p.sellingPoints.length > 0).length / Math.max(1, products.length) * 100)}%`, color: 'var(--success)' },
      ]} />

      <div className={sharedStyles.contentGap}>
        <FilterToolbar searchPlaceholder="搜索商品名、品牌或品类..." onSearch={setSearch} />
        <ObjectTable
          dataSource={filtered}
          columns={[
            { title: '商品', dataIndex: 'name', width: 180, render: (v: string, record: ProductAsset) => (
              <div>
                <Text strong style={{ color: 'var(--brand-primary)' }}>{v}</Text>
                <br /><Text type="secondary" className={sharedStyles.tinyMutedText}>{record.brand} · {record.category}</Text>
              </div>
            )},
            { title: 'SKU', dataIndex: 'sku', width: 100 },
            { title: '卖点', dataIndex: 'sellingPoints', width: 120, render: (pts: unknown) => {
              const arr = Array.isArray(pts) ? pts : []
              return <Tag color={arr.length > 0 ? 'blue' : 'default'}>{arr.length} 条</Tag>
            }},
            { title: 'FAQ', dataIndex: 'faqItems', width: 80, render: (faq: unknown[]) => (
              <Tag>{Array.isArray(faq) ? faq.length : 0} 条</Tag>
            )},
            { title: '历史成交率', dataIndex: 'historicalWinRate', width: 100, render: (v: number | undefined) => (
              v != null ? <Progress percent={Math.round(v * 100)} size="small" style={{ width: 80 }} /> : '—'
            )},
            { title: '更新', dataIndex: 'lastUpdatedAt', width: 200, render: (v: string) => formatDateTime(v) },
          ]}
          onRowClick={(record) => navigate(`/product/${record.id}`)}
          pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (total) => `共 ${total} 件商品` }}
        />
      </div>
    </PageShell>
  )
}

export default ProductAssetListPage
