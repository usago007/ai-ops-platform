/**
 * KnowledgeItemDetailPage — 知识回流条目详情
 */
import React, { useEffect, useState } from 'react'
import { Button, Card, Tag, Space, Typography, Empty, Divider } from 'antd'
import { FileTextOutlined, LinkOutlined } from '@/iconMap'
import { useParams, Link } from 'react-router-dom'
import { mockKnowledgeItemAdapter, mockLeadAdapter, mockOutcomeAdapter, mockProductAssetAdapter } from '../../adapters'
import { CardTitle, PageShell, InfoStrip } from '../shared/SharedUI'
import { formatDateTime } from '../shared/formatters'
import { DetailHeader } from '../shared/DetailHeader'
import sharedStyles from '../shared/SharedUI.module.css'
import type { KnowledgeItem, Lead, Outcome, ProductAsset } from '../../contracts'

const { Text, Paragraph } = Typography

const TYPE_LABELS: Record<string, string> = {
  faq: 'FAQ',
  pricing_strategy: '定价策略',
  loss_analysis: '丢单分析',
  product_note: '商品备注',
  reply_pattern: '话术模板',
}

export const KnowledgeItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  const [item, setItem] = useState<KnowledgeItem | null>(null)
  const [sourceOutcome, setSourceOutcome] = useState<Outcome | null>(null)
  const [relatedLeads, setRelatedLeads] = useState<Lead[]>([])
  const [relatedProducts, setRelatedProducts] = useState<ProductAsset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!id) { setLoading(false); return }

    async function loadData() {
      const [found, allItems] = await Promise.all([
        mockKnowledgeItemAdapter.getById(id!),
        mockKnowledgeItemAdapter.list(),
      ])
      const ki = found || allItems.find(k => k.id === id) || null
      if (!ki) { setLoading(false); return }
      setItem(ki)

      const [outcome, leads, products] = await Promise.all([
        mockOutcomeAdapter.list().then(all => all.find(o => o.id === ki.sourceOutcomeId) || null),
        Promise.all(ki.relatedLeadIds.map(lid => mockLeadAdapter.getById(lid))).then(ls => ls.filter(Boolean) as Lead[]),
        mockProductAssetAdapter.list().then(all => all.filter(p => ki.relatedProductIds.includes(p.id))),
      ])
      setSourceOutcome(outcome)
      setRelatedLeads(leads)
      setRelatedProducts(products)
      setLoading(false)
    }

    loadData()
  }, [id])

  if (loading) return <PageShell loading />
  if (!item) return <PageShell><Empty description="知识条目未找到" /></PageShell>

  return (
    <PageShell>
      <DetailHeader
        backTo={{ label: '返回知识库', path: '/knowledge/list' }}
        icon={<FileTextOutlined />}
        title={`知识条目 — ${item.title}`}
      />
      <Card>
        <InfoStrip
          bordered
          items={[
            { label: 'ID', value: item.id },
            { label: '类型', value: <Tag color="purple">{TYPE_LABELS[item.type] || item.type}</Tag> },
            { label: '状态', value: <Tag color={item.status === 'published' ? 'green' : item.status === 'draft' ? 'orange' : 'default'}>{item.status}</Tag> },
            { label: '创建方式', value: <Tag>{item.createdBy === 'ai' ? 'AI 自动' : '人工'}</Tag> },
            { label: '标签', value: <Space wrap>{item.tags.map(t => <Tag key={t}>{t}</Tag>)}</Space>, span: 2 },
            { label: '创建时间', value: formatDateTime(item.createdAt) },
            { label: '更新时间', value: formatDateTime(item.updatedAt) },
          ]}
        />
      </Card>

      <Card title={<CardTitle icon={<FileTextOutlined />} title="摘要" />} className={sharedStyles.sectionTopMd}>
        <Paragraph>{item.summary}</Paragraph>
      </Card>

      <Card title={<CardTitle icon={<FileTextOutlined />} title="完整内容" />} className={sharedStyles.sectionTopMd}>
        <Paragraph className={sharedStyles.preWrap}>{item.content}</Paragraph>
      </Card>

      {/* Related objects */}
      <div className={sharedStyles.sectionTopMd}>
        <Card title={<CardTitle icon={<LinkOutlined />} title="关联对象" />}>
          {sourceOutcome && (
            <>
              <Text type="secondary">来源结果</Text>
              <div className={sharedStyles.sectionTopSm}>
                <Space>
                  <Tag color={sourceOutcome.resultType === 'won' ? 'green' : 'red'}>
                    {sourceOutcome.resultType === 'won' ? '赢单' : '丢单'}
                  </Tag>
                  <Link to={`/outcome/${sourceOutcome.id}`}><Button size="small" type="link">{sourceOutcome.id}</Button></Link>
                  <Text type="secondary">¥{sourceOutcome.finalAmount?.toLocaleString() || '—'}</Text>
                </Space>
              </div>
            </>
          )}

          {relatedLeads.length > 0 && (
            <>
              <Divider className={sharedStyles.tightDivider} />
              <Text type="secondary">关联线索</Text>
              <div className={sharedStyles.sectionTopSm}>
                <Space wrap>
                  {relatedLeads.map(lead => (
                    <Link key={lead.id} to={`/leads/${lead.id}`}>
                      <Button size="small" type="link">{lead.companyName} ({lead.id})</Button>
                    </Link>
                  ))}
                </Space>
              </div>
            </>
          )}

          {relatedProducts.length > 0 && (
            <>
              <Divider className={sharedStyles.tightDivider} />
              <Text type="secondary">关联商品</Text>
              <div className={sharedStyles.sectionTopSm}>
                <Space wrap>
                  {relatedProducts.map(p => (
                    <Link key={p.id} to={`/product/${p.id}`}>
                      <Button size="small" type="link">{p.name}</Button>
                    </Link>
                  ))}
                </Space>
              </div>
            </>
          )}
        </Card>
      </div>
    </PageShell>
  )
}

export default KnowledgeItemDetailPage
