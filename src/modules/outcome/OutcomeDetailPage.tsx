/**
 * OutcomeDetailPage — 业务结果详情（只读查看）
 *
 * 区别于 OutcomeRecordPage（创建/记录流程），此页用于从概览或其他入口查看已有结果。
 */
import React, { useEffect, useState } from 'react'
import { Card, Tag, Space, Typography, Empty, Button, Divider } from 'antd'
import { CheckCircleOutlined, LinkOutlined } from '@/iconMap'
import { useParams, Link } from 'react-router-dom'
import { mockOutcomeAdapter, mockLeadAdapter, mockKnowledgeItemAdapter, mockProductAssetAdapter, mockSolutionRecommendationAdapter } from '../../adapters'
import { CardTitle, PageShell, InfoStrip } from '../shared/SharedUI'
import { formatDateTime } from '../shared/formatters'
import { DetailHeader } from '../shared/DetailHeader'
import sharedStyles from '../shared/SharedUI.module.css'
import type { Outcome, Lead, KnowledgeItem, ProductAsset, SolutionRecommendation } from '../../contracts'

const { Text } = Typography

const RESULT_LABELS: Record<string, { label: string; color: string }> = {
  won: { label: '赢单', color: 'green' },
  lost: { label: '丢单', color: 'red' },
  continue_followup: { label: '继续跟进', color: 'blue' },
  invalid: { label: '无效', color: 'default' },
  transferred: { label: '已转交', color: 'purple' },
}

export const OutcomeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [lead, setLead] = useState<Lead | null>(null)
  const [solution, setSolution] = useState<SolutionRecommendation | null>(null)
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([])
  const [relatedProducts, setRelatedProducts] = useState<ProductAsset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!id) { setLoading(false); return }

    async function loadData() {
      let found = await mockOutcomeAdapter.getById(id!)
      if (!found) {
        const all = await mockOutcomeAdapter.list()
        found = all.find(o => o.id === id) || null
      }
      if (!found) { setLoading(false); return }
      setOutcome(found)

      const [l, k, p, s] = await Promise.all([
        mockLeadAdapter.getById(found.leadId),
        mockKnowledgeItemAdapter.getByOutcomeId(found.id),
        mockProductAssetAdapter.list().then(all => all.filter(p => found!.relatedProductIds.includes(p.id))),
        mockSolutionRecommendationAdapter.getByLeadId(found.leadId),
      ])
      setLead(l || null)
      setKnowledgeItems(k)
      setRelatedProducts(p)
      setSolution(s || null)
      setLoading(false)
    }

    loadData()
  }, [id])

  if (loading) return <PageShell loading />
  if (!outcome) return <PageShell><Empty description="结果记录未找到" /></PageShell>

  const resultInfo = RESULT_LABELS[outcome.resultType] || { label: outcome.resultType, color: 'default' }

  return (
    <PageShell>
      <DetailHeader
        backTo={{ label: '返回结果列表', path: '/outcome/list' }}
        icon={<CheckCircleOutlined />}
        title={`结果详情 — ${outcome.id}`}
      />
      <Card>
        <InfoStrip
          bordered
          items={[
            { label: '结果类型', value: <Tag color={resultInfo.color}>{resultInfo.label}</Tag> },
            { label: '最终金额', value: outcome.finalAmount ? `¥${outcome.finalAmount.toLocaleString()}` : '—' },
            { label: '原因编码', value: outcome.reasonCode || '—' },
            { label: '回流状态', value: <Tag color={outcome.loopbackStatus === 'processed' ? 'green' : 'orange'}>{outcome.loopbackStatus === 'processed' ? '已处理' : '待处理'}</Tag> },
            { label: '结单时间', value: formatDateTime(outcome.closedAt) },
            { label: '创建时间', value: formatDateTime(outcome.createdAt) },
          ]}
        />
      </Card>

      <Card title="原因详情" className={sharedStyles.sectionTopMd}>
        <Text className={sharedStyles.preWrap}>{outcome.reasonDetail || '无'}</Text>
      </Card>

      {outcome.customerFeedbackSummary && (
        <Card title="客户反馈" className={sharedStyles.sectionTopMd}>
          <Text>{outcome.customerFeedbackSummary}</Text>
        </Card>
      )}

      {outcome.aiContributionTags.length > 0 && (
        <Card title="AI 贡献" className={sharedStyles.sectionTopMd}>
          <Space wrap>
            {outcome.aiContributionTags.map(tag => (
              <Tag key={tag} color="blue">{tag}</Tag>
            ))}
          </Space>
        </Card>
      )}

      {outcome.manualOverrideNotes && (
        <Card title="人工备注" className={sharedStyles.sectionTopMd}>
          <Text>{outcome.manualOverrideNotes}</Text>
        </Card>
      )}

      {/* Related objects */}
      <Card title={<CardTitle icon={<LinkOutlined />} title="关联对象" />} className={sharedStyles.sectionTopMd}>
        {lead && (
          <>
            <Text type="secondary">来源线索</Text>
            <div className={sharedStyles.sectionTopSm}>
              <Space>
                <Link to={`/leads/${lead.id}`}><Button size="small" type="link">{lead.companyName} ({lead.id})</Button></Link>
                <Tag>{lead.status}</Tag>
              </Space>
            </div>
          </>
        )}

        {solution && (
          <>
            <Divider className={sharedStyles.tightDivider} />
            <Text type="secondary">关联方案</Text>
            <div className={sharedStyles.sectionTopSm}>
              <Link to={`/leads/${outcome.leadId}/solution`}>
                <Button size="small" type="link">{solution.id}</Button>
              </Link>
              <Text type="secondary" className={sharedStyles.smallMutedText}> {solution.recommendedProducts.length} 个推荐商品</Text>
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

        {knowledgeItems.length > 0 && (
          <>
            <Divider className={sharedStyles.tightDivider} />
            <Text type="secondary">生成的知识回流</Text>
            {knowledgeItems.map(ki => (
              <div key={ki.id} className={sharedStyles.sectionTopSm}>
                <Space>
                  <Tag color="purple">{ki.type}</Tag>
                  <Link to={`/knowledge/${ki.id}`}><Button size="small" type="link">{ki.title}</Button></Link>
                  <Tag>{ki.status}</Tag>
                </Space>
              </div>
            ))}
          </>
        )}

        {!lead && !solution && relatedProducts.length === 0 && knowledgeItems.length === 0 && (
          <Text type="secondary">无关联对象</Text>
        )}
      </Card>
    </PageShell>
  )
}

export default OutcomeDetailPage
