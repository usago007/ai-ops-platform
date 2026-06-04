/**
 * SolutionReviewPage — 方案推荐审核 + 报价草稿编辑
 */
import React, { useState, useEffect } from 'react'
import { Card, Button, Tag, Space, Typography, Descriptions, Empty, Alert, Divider, Table, message } from 'antd'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircleOutlined, CloseCircleOutlined, ThunderboltOutlined, EditOutlined } from '@/iconMap'
import { mockSolutionRecommendationAdapter, mockQuotationDraftAdapter, mockLeadAdapter } from '../../adapters'
import { CardTitle, PageShell } from '../shared/SharedUI'
import { DetailHeader } from '../shared/DetailHeader'
import { formatDateTime } from '../shared/formatters'
import type { SolutionRecommendation, QuotationDraft, Lead } from '../../contracts'

const { Text } = Typography

export const SolutionReviewPage: React.FC = () => {
  const { leadId } = useParams<{ leadId: string }>()
  const navigate = useNavigate()
  const [solution, setSolution] = useState<SolutionRecommendation | null>(null)
  const [quotation, setQuotation] = useState<QuotationDraft | null>(null)
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviewed, setReviewed] = useState(false)

  const loadData = async () => {
    if (!leadId) { setLoading(false); return }
    const [sol, quotes, l] = await Promise.all([
      mockSolutionRecommendationAdapter.getByLeadId(leadId),
      mockQuotationDraftAdapter.getByLeadId(leadId),
      mockLeadAdapter.getById(leadId),
    ])
    setSolution(sol || null)
    setQuotation(quotes.length > 0 ? quotes[0] : null)
    setLead(l || null)
    setLoading(false)
  }

  useEffect(() => {
    if (!leadId) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId])

  const handleAccept = async () => {
    if (!solution || !lead) return
    setReviewed(true)
    await mockSolutionRecommendationAdapter.review(solution.id, 'accepted')
    await mockLeadAdapter.transition(lead.id, 'draft_ready')
    // Reload from store instead of local setState
    await loadData()
    message.success('方案已采纳，跳转至回复草稿')
    setTimeout(() => navigate(`/leads/${leadId}/reply`), 800)
  }

  const handleReject = async () => {
    if (!solution) return
    setReviewed(true)
    await mockSolutionRecommendationAdapter.review(solution.id, 'rejected', '需重新推荐')
    await loadData()
  }

  if (loading) return <PageShell loading />
  if (!solution) return <PageShell><Empty description="未找到方案推荐" /></PageShell>

  return (
    <PageShell>
      <DetailHeader
        backTo={{ label: '返回线索', path: `/leads/${leadId}` }}
        title={<>方案审核 — {lead?.id}</>}
        status={{ label: solution.status, color: solution.status === 'accepted' ? 'green' : solution.status === 'rejected' ? 'red' : 'blue' }}
        actions={
          leadId ? (
            <Link to={`/leads/${leadId}/reply`}>
              <Button size="small" icon={<EditOutlined />}>回复草稿</Button>
            </Link>
          ) : undefined
        }
      />
      {/* Solution */}
      <Card
        title={<CardTitle icon={<ThunderboltOutlined style={{ color: 'var(--brand-primary)' }} />} title="AI 推荐方案" />}
        extra={
          !reviewed ? (
            <Space>
              <Button danger icon={<CloseCircleOutlined />} onClick={handleReject}>退回</Button>
              <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleAccept}>采纳方案</Button>
            </Space>
          ) : (
            <Tag color="green">已审核</Tag>
          )
        }
      >
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label="推荐理由">{solution.reasoningSummary}</Descriptions.Item>
          <Descriptions.Item label="置信度">{Math.round(solution.confidenceScore * 100)}%</Descriptions.Item>
          <Descriptions.Item label="需人工复核">{solution.humanReviewRequired ? '是' : '否'}</Descriptions.Item>
        </Descriptions>

        <Divider>推荐商品</Divider>
        {solution.recommendedProducts.map(p => (
          <Card key={p.productId} size="small" style={{ marginBottom: 8 }}>
            <Space>
              <Text strong>{p.productName}</Text>
              <Tag color="blue">匹配 {p.matchScore}%</Tag>
              {p.isPrimary && <Tag color="green">主推</Tag>}
            </Space>
            <br />
            <Text type="secondary">{p.reason}</Text>
          </Card>
        ))}

        {solution.matchedCases.length > 0 && (
          <>
            <Divider>相似案例</Divider>
            {solution.matchedCases.map(c => (
              <Alert
                key={c.caseId}
                type={c.outcome === 'won' ? 'success' : 'warning'}
                title={`${c.title} — ${c.outcome === 'won' ? '成交' : '流失'}${c.amount ? ` ¥${c.amount.toLocaleString()}` : ''}`}
                style={{ marginBottom: 8 }}
              />
            ))}
          </>
        )}
      </Card>

      {/* Quotation */}
      {quotation && (
        <Card title="报价草稿" style={{ marginTop: 16 }}>
          {quotation.products.length > 0 && (
            <Table
              size="small"
              pagination={false}
              dataSource={quotation.products.map((p, i) => ({ ...p, key: i }))}
              columns={[
                { title: '商品', dataIndex: 'productName' },
                { title: '数量', dataIndex: 'quantity' },
                { title: '单价', dataIndex: 'unitPrice', render: (v: number) => `¥${v.toLocaleString()}` },
                { title: '金额', dataIndex: 'totalPrice', render: (v: number) => `¥${v.toLocaleString()}` },
              ]}
            />
          )}
          <Divider />
          <Descriptions column={2} size="small">
            <Descriptions.Item label="总金额"><Text strong>¥{quotation.totalAmount.toLocaleString()}</Text></Descriptions.Item>
            <Descriptions.Item label="币种">{quotation.currency}</Descriptions.Item>
            <Descriptions.Item label="交期">{quotation.deliveryTerms}</Descriptions.Item>
            <Descriptions.Item label="有效期">{formatDateTime(quotation.validUntil)}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}
    </PageShell>
  )
}

export default SolutionReviewPage
