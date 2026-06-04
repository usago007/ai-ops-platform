/**
 * OutcomeRecordPage — 结果记录（强流程驱动）
 *
 * 无结果时提供创建表单；创建后更新 Lead.status 并触发回流。
 */
import React, { useState, useEffect } from 'react'
import { Card, Button, Tag, Space, Typography, Descriptions, Select, Input, message } from 'antd'
import { useParams, Link } from 'react-router-dom'
import {
  CheckCircleOutlined, ReloadOutlined,
  BarChartOutlined,
} from '@/iconMap'
import { mockOutcomeAdapter, mockKnowledgeItemAdapter, mockLeadAdapter } from '../../adapters'
import { CardTitle, PageShell } from '../shared/SharedUI'
import { DetailHeader } from '../shared/DetailHeader'
import { formatDateTime } from '../shared/formatters'
import sharedStyles from '../shared/SharedUI.module.css'
import formStyles from '../../styles/form.module.css'
import type { Outcome, KnowledgeItem, Lead } from '../../contracts'
import type { ResultType } from '../../contracts/shared'

const { Text, Paragraph } = Typography

export const OutcomeRecordPage: React.FC = () => {
  const { leadId } = useParams<{ leadId: string }>()
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([])
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  // Create form state
  const [resultType, setResultType] = useState<ResultType>('won')
  const [reasonDetail, setReasonDetail] = useState('')
  const [finalAmount, setFinalAmount] = useState('')

  const loadData = async () => {
    if (!leadId) { setLoading(false); return }
    const [out, ki, l] = await Promise.all([
      mockOutcomeAdapter.getByLeadId(leadId),
      mockKnowledgeItemAdapter.list(),
      mockLeadAdapter.getById(leadId),
    ])
    setOutcome(out || null)
    setKnowledgeItems(ki.filter(k => k.relatedLeadIds.includes(leadId)))
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

  // ── Create outcome via adapter (auto-loopback handled in store) ──
  const handleCreate = async () => {
    if (!leadId) return
    setCreating(true)

    await mockOutcomeAdapter.create({
      leadId,
      resultType,
      reasonCode:
        resultType === 'won' ? 'confirmed_by_customer' :
        resultType === 'lost' ? 'customer_declined' :
        resultType === 'continue_followup' ? 'pending_customer_response' :
        resultType === 'invalid' ? 'invalid_inquiry' : 'transferred_to_other',
      reasonDetail: reasonDetail || (resultType === 'won' ? '客户确认成交' : '客户未回复/拒绝'),
      finalAmount: finalAmount ? Number(finalAmount) : null,
      customerFeedbackSummary: null,
      aiContributionTags: ['intent_parsing', 'product_matching', 'reply_generation'],
      manualOverrideNotes: null,
      closedAt: new Date().toISOString(),
      loopbackStatus: 'pending',
      relatedProductIds: [], // adapter enriches from solution
    })

    // Reload from store — adapter handles Lead.status, KnowledgeItem, Metrics
    await loadData()
    setCreating(false)
    message.success('结果已记录，Lead 状态已更新，知识回流已完成')
  }

  if (loading) return <PageShell loading />

  return (
    <PageShell>
      <DetailHeader
        backTo={{ label: '返回线索', path: `/leads/${leadId}` }}
        title={<>结果记录 — {lead?.id}</>}
        actions={
          <Link to="/overview">
            <Button size="small" icon={<BarChartOutlined />}>经营总览</Button>
          </Link>
        }
      />
      {/* ── No outcome: show create form ── */}
      {!outcome && (
        <Card
          title={<CardTitle icon={<CheckCircleOutlined />} title="创建结果记录" />}
        >
          <Space orientation="vertical" className={formStyles.fullWidth} size="middle">
            <div>
              <Text strong>结果类型：</Text>
              <Select
                value={resultType}
                onChange={(v) => setResultType(v as ResultType)}
                style={{ width: 200, marginLeft: 8 }}
                options={[
                  { value: 'won', label: '赢单' },
                  { value: 'lost', label: '丢单' },
                  { value: 'continue_followup', label: '继续跟进' },
                  { value: 'invalid', label: '无效线索' },
                  { value: 'transferred', label: '已转交' },
                ]}
              />
            </div>
            <div>
              <Text strong>原因说明：</Text>
              <Input.TextArea
                value={reasonDetail}
                onChange={e => setReasonDetail(e.target.value)}
                placeholder={resultType === 'won' ? '如：价格合理、交期满意、技术支持到位...' : '如：价格偏高、竞品替代、交期不满足...'}
                rows={3}
                className={sharedStyles.sectionTopSm}
              />
            </div>
            {resultType === 'won' && (
              <div>
                <Text strong>成交金额（可选）：</Text>
                <Input
                  value={finalAmount}
                  onChange={e => setFinalAmount(e.target.value)}
                  placeholder="如：128000"
                  style={{ width: 200, marginLeft: 8 }}
                  prefix="¥"
                />
              </div>
            )}
            <div>
              <Text type="secondary">创建结果后将自动更新 Lead 状态；AI 将在回流阶段生成知识条目和指标。</Text>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              loading={creating}
              onClick={handleCreate}
            >
              确认并记录结果
            </Button>
          </Space>
        </Card>
      )}

      {/* ── Outcome exists: show detail ── */}
      {outcome && (
        <>
          <Card
            title={
              <Space>
                <Tag color={
                  outcome.resultType === 'won' ? 'green' :
                  outcome.resultType === 'lost' ? 'red' :
                  outcome.resultType === 'continue_followup' ? 'blue' :
                  outcome.resultType === 'invalid' ? 'default' : 'orange'
                }>
                  {outcome.resultType === 'won' ? '赢单' :
                   outcome.resultType === 'lost' ? '丢单' :
                   outcome.resultType === 'continue_followup' ? '继续跟进' :
                   outcome.resultType === 'invalid' ? '无效' : '已转交'}
                </Tag>
                <Text strong>业务结果</Text>
              </Space>
            }
          >
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="原因">{outcome.reasonDetail}</Descriptions.Item>
              <Descriptions.Item label="成交金额">
                {outcome.finalAmount ? `¥${outcome.finalAmount.toLocaleString()}` : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="结单时间">{formatDateTime(outcome.closedAt)}</Descriptions.Item>
              <Descriptions.Item label="回流状态">
                <Tag color={outcome.loopbackStatus === 'processed' ? 'green' : 'orange'}>
                  {outcome.loopbackStatus === 'processed' ? '已回流' : '待回流'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="AI 贡献" span={2}>
                <Space wrap>{outcome.aiContributionTags.map(t => <Tag key={t} color="blue">{t}</Tag>)}</Space>
              </Descriptions.Item>
              <Descriptions.Item label="客户反馈" span={2}>{outcome.customerFeedbackSummary || '—'}</Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Knowledge loopback */}
          {knowledgeItems.length > 0 && (
            <Card title={<CardTitle icon={<ReloadOutlined />} title="AI 知识回流" />} style={{ marginTop: 16 }}>
              {knowledgeItems.map(ki => (
                <Card key={ki.id} size="small" className={sharedStyles.sectionBottomMd}>
                  <Space orientation="vertical" className={formStyles.fullWidth}>
                    <Space>
                      <Tag color={ki.type === 'pricing_strategy' ? 'purple' : ki.type === 'loss_analysis' ? 'red' : 'blue'}>{ki.type}</Tag>
                      <Text strong>{ki.title}</Text>
                    </Space>
                    <Text>{ki.summary}</Text>
                    <Paragraph ellipsis={{ rows: 3, expandable: true }} type="secondary">{ki.content}</Paragraph>
                  </Space>
                </Card>
              ))}
            </Card>
          )}

          {/* Back to overview */}
          <div className={sharedStyles.centeredSection}>
            <Link to="/overview">
              <Button type="primary" size="large" icon={<BarChartOutlined />}>查看经营总览 →</Button>
            </Link>
          </div>
        </>
      )}
    </PageShell>
  )
}

export default OutcomeRecordPage
