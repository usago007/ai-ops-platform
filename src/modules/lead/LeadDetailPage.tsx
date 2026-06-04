/**
 * LeadDetailPage — 线索证据页（设计系统 v2）
 *
 * 结构：DetailHeader → 核心事实 → AI 追踪 → 人工动作 → 关联对象 → 回流证据
 */
import React, { useState, useEffect } from 'react'
import { Button, Tag, Space, Typography, Empty, Divider, Steps } from 'antd'
import {
  ThunderboltOutlined, CheckCircleOutlined,
  FileTextOutlined, CloseCircleOutlined, LinkOutlined,
} from '@/iconMap'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { mockLeadAdapter, mockSolutionRecommendationAdapter, mockReplyDraftAdapter, mockQuotationDraftAdapter } from '../../adapters'
import { advanceLead, getEngineTrace } from '../../domain'
import { PageShell } from '../shared/SharedUI'
import { DetailHeader } from '../shared/DetailHeader'
import { DecisionPanel } from '../shared/DecisionPanel'
import { EvidenceTimeline, type EvidenceItem } from '../shared/EvidenceTimeline'
import { PrimaryMetric } from '../shared/PrimaryMetric'
import sharedStyles from '../shared/SharedUI.module.css'
import type { Lead, SolutionRecommendation, ReplyDraft, QuotationDraft } from '../../contracts'

const { Text, Paragraph } = Typography

const LEAD_STEPS = [
  { status: 'new', title: '新线索' }, { status: 'qualified', title: '已确认' },
  { status: 'recommending', title: '方案推荐' }, { status: 'draft_ready', title: '草稿就绪' },
  { status: 'sent', title: '已发送' }, { status: 'following_up', title: '跟进中' },
  { status: 'won', title: '赢单' }, { status: 'lost', title: '丢单' },
]

const NEXT_ACTION: Record<string, { label: string; description: string }> = {
  new:        { label: '确认线索', description: '审核 AI 理解结果，确认后进入方案推荐' },
  qualified:  { label: 'AI 方案推荐', description: 'AI 基于商品库和案例为该线索生成推荐方案' },
  recommending: { label: '生成回复与报价', description: '基于已接受的方案生成客服回复和报价草稿' },
  draft_ready: { label: '审核并发送', description: '审核回复草稿和报价，确认后发送给客户' },
  sent:       { label: '开始跟进', description: '发送后进入跟进阶段，等待客户反馈' },
  following_up: { label: '记录结果', description: '根据客户反馈标记赢单或丢单' },
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: '新线索', color: 'default' }, qualified: { label: '已确认', color: 'blue' },
  recommending: { label: '推荐中', color: 'purple' }, draft_ready: { label: '草稿就绪', color: 'cyan' },
  sent: { label: '已发送', color: 'geekblue' }, following_up: { label: '跟进中', color: 'orange' },
  won: { label: '赢单', color: 'green' }, lost: { label: '丢单', color: 'red' },
}

export const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [lead, setLead] = useState<Lead | null>(null)
  const [solution, setSolution] = useState<SolutionRecommendation | null>(null)
  const [replyDraft, setReplyDraft] = useState<ReplyDraft | null>(null)
  const [quotationDraft, setQuotationDraft] = useState<QuotationDraft | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!id) { setLoading(false); return }
    const [l, s, replies, quotes] = await Promise.all([
      mockLeadAdapter.getById(id),
      mockSolutionRecommendationAdapter.getByLeadId(id),
      mockReplyDraftAdapter.getByLeadId(id),
      mockQuotationDraftAdapter.getByLeadId(id),
    ])
    setLead(l || null)
    if (s) setSolution(s)
    if (replies.length > 0) setReplyDraft(replies[0])
    if (quotes.length > 0) setQuotationDraft(quotes[0])
    setLoading(false)
  }

  useEffect(() => { if (id) { loadData() } }, [id]) // eslint-disable-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps

  const stepIndex = LEAD_STEPS.findIndex(s => s.status === lead?.status)
  const action = lead && NEXT_ACTION[lead.status]
  const isTerminal = lead?.status === 'won' || lead?.status === 'lost'
  const statusInfo = lead ? STATUS_LABELS[lead.status] : null

  const doTransition = async (to: Lead['status']) => {
    if (!lead) return
    const result = advanceLead(lead, to)
    if (!result.success) return
    const updated = await mockLeadAdapter.transition(lead.id, to)
    setLead(updated)
  }

  const handleNextAction = async () => {
    if (!lead) return
    switch (lead.status) {
      case 'new': await doTransition('qualified'); break
      case 'qualified': {
        const sol = await mockSolutionRecommendationAdapter.generate(lead.id, [])
        setSolution(sol); await doTransition('recommending'); break
      }
      case 'recommending': {
        const [reply, quote] = await Promise.all([
          mockReplyDraftAdapter.generate(lead.id, lead.sourceConversationId),
          mockQuotationDraftAdapter.generate(lead.id),
        ])
        setReplyDraft(reply); setQuotationDraft(quote); await doTransition('draft_ready'); break
      }
      case 'draft_ready': await doTransition('sent'); break
      case 'sent': await doTransition('following_up'); break
    }
  }

  const handleWon = async () => { await doTransition('won') }
  const handleLost = async () => { await doTransition('lost') }

  // Evidence timeline from AI engine trace
  const traceEvidence: EvidenceItem[] = lead
    ? getEngineTrace(lead, solution, replyDraft, quotationDraft).map(t => ({
        title: t.step,
        description: t.detail || `${t.engine} — ${t.source}`,
        status: t.status === 'used' ? 'positive' as const : t.status === 'skipped' ? 'neutral' as const : 'neutral' as const,
        tags: [{ label: t.engine }, { label: t.status === 'used' ? '已调用' : t.status === 'skipped' ? '跳过' : '待执行' }],
      }))
    : []

  if (loading) return <PageShell loading />
  if (!lead) return <PageShell><Empty description="线索未找到" /></PageShell>

  return (
    <PageShell>
      <DetailHeader
        backTo={{ label: '返回工作台', path: '/cs/workspace' }}
        title={<>{lead.companyName}</>}
        status={statusInfo ? { label: statusInfo.label, color: statusInfo.color } : undefined}
        actions={
          <Space size={8}>
            {solution && <Link to={`/leads/${lead.id}/solution`}><Button size="small" icon={<ThunderboltOutlined />}>方案</Button></Link>}
            {replyDraft && <Link to={`/leads/${lead.id}/reply`}><Button size="small" icon={<FileTextOutlined />}>回复</Button></Link>}
            {isTerminal && <Link to={`/leads/${lead.id}/outcome`}><Button size="small" icon={<CheckCircleOutlined />}>结果</Button></Link>}
          </Space>
        }
      />

      {/* State progress */}
      <div style={{ marginBottom: 16 }}>
        <Steps
          current={stepIndex}
          size="small"
          status={lead.status === 'lost' ? 'error' : lead.status === 'won' ? 'finish' : 'process'}
          items={LEAD_STEPS.map(s => ({ title: s.title }))}
        />
      </div>

      {/* Core facts + Action */}
      <div className={sharedStyles.gridSplit}>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <PrimaryMetric label="业务价值" value={`${lead.businessValueScore}/100`} color="var(--brand-primary)" />
            <PrimaryMetric label="优先级" value={lead.priorityLevel} color={lead.priorityLevel === 'high' ? 'var(--error)' : 'var(--warning)'} />
            <PrimaryMetric label="风险等级" value={lead.riskLevel} color={lead.riskLevel === 'high' ? 'var(--error)' : 'var(--text-secondary)'} />
          </div>
          <div style={{ marginTop: 12 }}>
            <Text strong>线索摘要</Text>
            <Paragraph style={{ marginTop: 4 }}>{lead.leadSummary}</Paragraph>
          </div>
          <div style={{ marginTop: 12 }}>
            <Space wrap>
              {lead.tags.map(t => <Tag key={t}>{t}</Tag>)}
            </Space>
          </div>
        </div>

        <div>
          {!isTerminal && action && (
            <DecisionPanel
              title={`当前步骤：${action.label}`}
              variant="info"
              action={{ label: action.label, onClick: handleNextAction }}
            >
              {action.description}
            </DecisionPanel>
          )}

          {lead.manualReviewRequired && !isTerminal && (
            <DecisionPanel title="需要人工复核" variant="warning">
              此线索被标记为需要人工复核（低置信度或高风险）。请在推进前确认关键信息无误。
            </DecisionPanel>
          )}

          {lead.status === 'following_up' && (
            <DecisionPanel title="选择结果" variant="warning">
              <Space>
                <Button type="primary" onClick={handleWon} icon={<CheckCircleOutlined />}>标记赢单</Button>
                <Button danger onClick={handleLost} icon={<CloseCircleOutlined />}>标记丢单</Button>
              </Space>
            </DecisionPanel>
          )}

          {isTerminal && (
            <DecisionPanel title={lead.status === 'won' ? '此线索已赢单' : '此线索已丢单'} variant={lead.status === 'won' ? 'success' : 'warning'}
              action={{ label: '查看结果记录', onClick: () => navigate(`/leads/${lead.id}/outcome`) }}
            >
              结果已记录，可进入结果页查看回流知识和指标影响。
            </DecisionPanel>
          )}
        </div>
      </div>

      {/* AI Engine Trace */}
      {traceEvidence.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 10 }}>AI 引擎追踪</h3>
          <EvidenceTimeline items={traceEvidence} />
        </div>
      )}

      {/* Solution Recommendation summary */}
      {solution && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 10 }}>方案推荐</h3>
          <Text type="secondary">{solution.reasoningSummary}</Text>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
            {solution.recommendedProducts.slice(0, 4).map(p => (
              <div key={p.productId} style={{ padding: '8px 12px', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-sm)' }}>
                <Space><Text strong>{p.productName}</Text><Tag color="blue">{p.matchScore}分</Tag></Space>
                <br /><Text type="secondary" style={{ fontSize: 'var(--font-size-sm)' }}>{p.reason}</Text>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reply & Quotation drafts */}
      {replyDraft && quotationDraft && (
        <div className={sharedStyles.gridSplit} style={{ marginTop: 20 }}>
          <div style={{ padding: 12, border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)' }}>
            <Text strong>AI 回复草稿</Text>
            <Paragraph ellipsis={{ rows: 6, expandable: true }} className={sharedStyles.preWrap} style={{ marginTop: 6 }}>{replyDraft.draftContent.slice(0, 300)}...</Paragraph>
          </div>
          <div style={{ padding: 12, border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)' }}>
            <Text strong>AI 报价草稿</Text>
            {quotationDraft.products.map(p => (
              <div key={p.productId} style={{ marginTop: 4 }}><Text>{p.productName} × {p.quantity}{p.unit} ¥{p.unitPrice}</Text></div>
            ))}
            <Divider style={{ margin: '8px 0' }} />
            <Text strong>合计：¥{quotationDraft.totalAmount.toLocaleString()}</Text>
          </div>
        </div>
      )}

      {/* Object tracking chain */}
      {(lead.selectedSolutionId || lead.selectedReplyDraftId || lead.selectedQuotationDraftId || lead.outcomeId) && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 10 }}>
            <LinkOutlined /> 对象追踪链
          </h3>
          <EvidenceTimeline
            items={[
              ...(lead.selectedSolutionId ? [{ title: '方案推荐', description: lead.selectedSolutionId, status: 'positive' as const, onClick: () => navigate(`/leads/${lead.id}/solution`) }] : []),
              ...(lead.selectedReplyDraftId ? [{ title: '回复草稿', description: lead.selectedReplyDraftId, status: 'positive' as const, onClick: () => navigate(`/leads/${lead.id}/reply`) }] : []),
              ...(lead.selectedQuotationDraftId ? [{ title: '报价草稿', description: lead.selectedQuotationDraftId, status: 'positive' as const }] : []),
              ...(lead.outcomeId ? [{ title: '结果记录', description: lead.outcomeId, status: 'positive' as const, onClick: () => navigate(`/leads/${lead.id}/outcome`) }] : []),
            ]}
          />
        </div>
      )}
    </PageShell>
  )
}

export default LeadDetailPage
