/**
 * ConversationWorkbench — 客服工作台主入口
 *
 * 职责：展示原始 Conversation → AI 解析生成 InquiryDraft → 人工审核修正 → 确认建 Lead
 * 这是整条主链的起点。
 */
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card, Button, Tag, Space, Typography, Empty, Descriptions, Alert,
  Badge, Divider, Steps, message,
} from 'antd'
import {
  InboxOutlined, ThunderboltOutlined, CheckCircleOutlined,
  LoadingOutlined, EditOutlined,
  CloseCircleOutlined, UserOutlined,
} from '@/iconMap'
import { mockConversationAdapter, mockInquiryDraftAdapter, mockLeadAdapter } from '../../adapters'
import { advanceConversation, advanceInquiryDraft } from '../../domain'
import { CardTitle, PageShell, FlowPanel, InsightCallout, InfoStrip } from '../shared/SharedUI'
import { PageLoader } from '../shared/PageLoader'
import sharedStyles from '../shared/SharedUI.module.css'
import { formatDateTime } from '../shared/formatters'
import formStyles from '../../styles/form.module.css'
import type { Conversation, InquiryDraft, Lead } from '../../contracts'

const { Text } = Typography

// ── Component ──

export const ConversationWorkbench: React.FC = () => {
  const navigate = useNavigate()

  // Conversations
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [convError, setConvError] = useState<string | null>(null)

  // InquiryDraft
  const [draft, setDraft] = useState<InquiryDraft | null>(null)
  const [parsing, setParsing] = useState(false)

  // Lead
  const [createdLead, setCreatedLead] = useState<Lead | null>(null)
  const [confirming, setConfirming] = useState(false)

  // Pipeline visual
  const [activeStep, setActiveStep] = useState(0)

  // Ref to track current conversation for race condition prevention
  const currentConvRef = useRef<string | null>(null)

  // Load conversations
  useEffect(() => {
    mockConversationAdapter.list()
      .then(data => {
        setConversations(data)
        setLoadingConvs(false)
      })
      .catch(err => {
        console.error('Failed to load conversations:', err)
        setConvError('加载会话列表失败，请刷新重试')
        setLoadingConvs(false)
      })
  }, [])

  // ── Select conversation ──
  const handleSelectConversation = async (conv: Conversation) => {
    const convId = conv.id
    currentConvRef.current = convId
    setSelectedConv(conv)
    setDraft(null)
    setCreatedLead(null)
    setActiveStep(0)

    // Load the latest conversation state from store (may have been updated by previous actions)
    const freshConv = await mockConversationAdapter.getById(convId)
    // Race guard: bail if user switched conversations during async fetch
    if (currentConvRef.current !== convId) return
    const effectiveConv = freshConv || conv

    // If already has a linked lead, load it
    if (effectiveConv.linkedLeadId) {
      try {
        const lead = await mockLeadAdapter.getById(effectiveConv.linkedLeadId)
        if (currentConvRef.current !== convId) return
        if (lead) {
          setCreatedLead(lead)
          setActiveStep(2)
        }
      } catch { /* lead fetch is best-effort */ }
    }

    // If already has a draft, load it
    if (effectiveConv.linkedDraftId) {
      try {
        const existing = await mockInquiryDraftAdapter.getById(effectiveConv.linkedDraftId)
        if (currentConvRef.current !== convId) return
        if (existing) {
          setDraft(existing)
          if (!effectiveConv.linkedLeadId) {
            setActiveStep(existing.status === 'confirmed' ? 2 : 1)
          }
        }
      } catch { /* draft fetch is best-effort */ }
    }

    // Ensure selectedConv reflects the fresh store state (only if still on same conv)
    if (currentConvRef.current === convId) {
      setSelectedConv(effectiveConv)
    }
  }

  // ── AI Parse → InquiryDraft ──
  const handleParse = async () => {
    if (!selectedConv) return
    const convId = selectedConv.id
    currentConvRef.current = convId
    setParsing(true)
    setActiveStep(0)

    try {
      // Simulate AI parsing stages
      await new Promise(r => setTimeout(r, 600))

      // Race condition guard: bail if user switched conversations
      if (currentConvRef.current !== convId) return

      setActiveStep(1)

      const drafts = await mockInquiryDraftAdapter.list()
      const match = drafts.find(d => d.conversationId === convId)
      if (match) {
        setDraft(match)
        setActiveStep(match.status === 'confirmed' ? 2 : 1)
      }
    } catch {
      message.error('AI 解析失败，请重试')
    } finally {
      // Only clear parsing if we're still on the same conversation
      if (currentConvRef.current === convId) {
        setParsing(false)
      }
    }
  }

  // ── Submit for review (draft → pending_review) ──
  const handleSubmitReview = async () => {
    if (!draft) return
    const result = advanceInquiryDraft(draft, 'pending_review')
    if (!result.success) {
      message.error(result.error)
      return
    }
    try {
      await mockInquiryDraftAdapter.update(draft.id, { status: 'pending_review', updatedAt: new Date().toISOString() })
      setDraft(result.data)
      message.success('已提交审核')
    } catch {
      message.error('状态更新失败，请重试')
    }
  }

  // ── Confirm draft → create Lead (works for both pending_review and already-confirmed drafts) ──
  const handleConfirm = async () => {
    if (!draft || !selectedConv) return
    setConfirming(true)

    let confirmed = draft

    // Only transition if not already confirmed
    if (draft.status !== 'confirmed') {
      const result = advanceInquiryDraft(draft, 'confirmed')
      if (!result.success) {
        message.error(result.error)
        setConfirming(false)
        return
      }
      confirmed = result.data

      try {
        // Persist draft confirmation to store
        await mockInquiryDraftAdapter.update(draft.id, { status: 'confirmed', updatedAt: new Date().toISOString() })
        setDraft(confirmed)
      } catch {
        message.error('状态更新失败，请重试')
        setConfirming(false)
        return
      }
    }

    try {
      // Advance Conversation status and persist to store
      if (selectedConv.status !== 'active') {
        const convResult = advanceConversation(selectedConv, 'active')
        if (convResult.success) {
          const updatedConv = await mockConversationAdapter.updateStatus(selectedConv.id, 'active')
          setSelectedConv(updatedConv)
        }
      }

      // Create Lead from confirmed draft via adapter
      const lead = await mockLeadAdapter.create({
        sourceConversationId: selectedConv.id,
        sourceDraftId: confirmed.id,
        customerId: null,
        companyName: selectedConv.companyName,
        leadSummary: `客户${selectedConv.customerName}通过${selectedConv.channel}渠道询价${confirmed.productKeywords.join('、')}，AI解析置信度${Math.round(confirmed.confidenceScore * 100)}%。`,
        leadType: confirmed.intentType,
        priorityLevel: confirmed.confidenceScore >= 0.8 ? 'high' : 'medium',
        businessValueScore: Math.round(confirmed.confidenceScore * 80),
        riskLevel: confirmed.riskFlags.length > 0 ? 'medium' : 'low',
        assignedTo: selectedConv.ownerUserId,
        status: 'new',
        lastActionAt: null,
        nextAction: '审核并推进线索',
        tags: confirmed.productKeywords.slice(0, 4),
        relatedProductIds: confirmed.candidateProducts,
        selectedSolutionId: null,
        selectedReplyDraftId: null,
        selectedQuotationDraftId: null,
        outcomeId: null,
        manualReviewRequired: confirmed.confidenceScore < 0.7 || confirmed.riskFlags.some(f => f.severity === 'high'),
        followUpCount: 0,
        latestCustomerResponse: null,
      })

      // Persist the link in the conversation
      await mockConversationAdapter.linkLead(selectedConv.id, lead.id)

      // Update local conversations array so sidebar shows "已有线索" immediately
      setConversations(prev => prev.map(c =>
        c.id === selectedConv.id
          ? { ...c, linkedLeadId: lead.id, linkedDraftId: confirmed.id, status: 'active' as const }
          : c,
      ))

      setCreatedLead(lead)
      setActiveStep(2)
      message.success('线索已创建！')
    } catch {
      message.error('创建线索失败，请重试')
    } finally {
      setConfirming(false)
    }
  }

  // ── Reject draft ──
  const handleReject = async () => {
    if (!draft) return
    const result = advanceInquiryDraft(draft, 'rejected')
    if (!result.success) {
      message.error(result.error)
      return
    }
    try {
      await mockInquiryDraftAdapter.reject(draft.id, '人工审核退回')
      setDraft(result.data)
      message.warning('已退回草稿，请修正后重新提交')
    } catch {
      message.error('操作失败，请重试')
    }
  }

  // ── Re-edit rejected draft ──
  const handleReEdit = async () => {
    if (!draft) return
    try {
      await mockInquiryDraftAdapter.update(draft.id, { status: 'draft', updatedAt: new Date().toISOString() })
      setDraft({ ...draft, status: 'draft' })
    } catch {
      message.error('操作失败，请重试')
    }
  }

  // ── Render ──

  return (
    <PageShell>
      <div className={sharedStyles.convContainer}>
        {/* LEFT: Conversation List */}
        <Card
          title={<CardTitle icon={<InboxOutlined />} title="客户会话" />}
          className={sharedStyles.convList}
          styles={{ body: { padding: 0 } }}
        >
        {convError ? (
          <div className={sharedStyles.emptyState}>
            <Alert type="error" title={convError} showIcon style={{ margin: 12 }} />
          </div>
        ) : loadingConvs ? (
          <PageLoader description="读取会话中..." variant="inline" />
        ) : conversations.length === 0 ? (
          <Empty description="暂无会话" className={sharedStyles.emptyState} />
        ) : (
          <div>
            {conversations.map((conv: Conversation) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={`${sharedStyles.convListItem} ${selectedConv?.id === conv.id ? sharedStyles.convListItemActive : sharedStyles.convListItemInactive}`}
              >
                <Space orientation="vertical" size={2} className={formStyles.fullWidth}>
                  <Space>
                    <Text strong>{conv.customerName}</Text>
                    <Tag color={conv.channel === 'wechat' ? 'green' : conv.channel === 'email' ? 'blue' : 'default'}>
                      {conv.channel}
                    </Tag>
                    <Badge status={conv.status === 'new' ? 'processing' : conv.status === 'active' ? 'success' : 'default'} />
                  </Space>
                  <Text type="secondary" className={sharedStyles.smallMutedText}>{conv.companyName}</Text>
                  <Text type="secondary" className={sharedStyles.smallMutedText}>
                    {conv.rawMessages.length > 0
                      ? `${conv.rawMessages[conv.rawMessages.length - 1]?.content.slice(0, 40)}...`
                      : '暂无消息'}
                  </Text>
                  {conv.linkedLeadId && (
                    <Tag color="blue" className={sharedStyles.tinyTag}>已有线索</Tag>
                  )}
                  {conv.linkedDraftId && !conv.linkedLeadId && (
                    <Tag color="orange" className={sharedStyles.tinyTag}>待确认</Tag>
                  )}
                </Space>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* RIGHT: Workspace */}
      <div className={sharedStyles.convWorkspace}>
        {/* Pipeline Steps */}
        <FlowPanel>
          <Steps
            current={activeStep}
            size="small"
            items={[
              { title: '原始消息', icon: <InboxOutlined /> },
              { title: 'AI 理解', icon: parsing ? <LoadingOutlined /> : <ThunderboltOutlined /> },
              { title: '建线索', icon: <CheckCircleOutlined /> },
            ]}
          />
        </FlowPanel>

        {!selectedConv ? (
          <Card>
            <Empty description="请从左侧选择一个客户会话" />
          </Card>
        ) : (
          <>
            {/* ── Step 0: Raw Messages ── */}
            <Card
              title={<CardTitle icon={<UserOutlined />} title="原始消息" extra={<Tag>{selectedConv.channel}</Tag>} />}
              extra={
                !draft && (
                  <Button type="primary" icon={<ThunderboltOutlined />} loading={parsing} onClick={handleParse}>
                    AI 智能解析
                  </Button>
                )
              }
            >
              <InfoStrip items={[
                { label: '客户', value: selectedConv.customerName },
                { label: '公司', value: selectedConv.companyName },
                { label: '联系方式', value: selectedConv.contactInfo },
                { label: '接收时间', value: formatDateTime(selectedConv.receivedAt) },
              ]} />
              <Divider className={sharedStyles.compactDivider} />
              <div>
                {selectedConv.rawMessages.length === 0 ? (
                  <Text type="secondary">暂无消息记录</Text>
                ) : (
                  selectedConv.rawMessages.map((msg, i) => (
                    <div key={msg.id || `msg-${i}`} className={sharedStyles.listItemBorderless}>
                      <Space align="start">
                        <Tag color={msg.role === 'customer' ? 'blue' : 'green'} className={sharedStyles.roleTag}>
                          {msg.role === 'customer' ? '客户' : '客服'}
                        </Tag>
                        <Text>{msg.content}</Text>
                      </Space>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* ── Step 1: AI InquiryDraft ── */}
            {draft && (
              <Card
                title={
                  <Space>
                    <span className={sharedStyles.bodyIcon}><ThunderboltOutlined className={sharedStyles.accentIcon} /></span>
                    <Text strong>AI 理解结果</Text>
                    <Tag color={draft.confidenceScore >= 0.8 ? 'green' : draft.confidenceScore >= 0.5 ? 'orange' : 'red'}>
                      置信度 {Math.round(draft.confidenceScore * 100)}%
                    </Tag>
                    <Tag>{draft.parseEngine === 'llm' ? 'LLM' : draft.parseEngine === 'rule' ? '规则' : '混合'}</Tag>
                    <Tag color={
                      draft.status === 'confirmed' ? 'green' :
                      draft.status === 'pending_review' ? 'blue' :
                      draft.status === 'rejected' ? 'red' : 'default'
                    }>
                      {draft.status === 'draft' ? '草稿' :
                       draft.status === 'pending_review' ? '待审核' :
                       draft.status === 'confirmed' ? '已确认' : '已退回'}
                    </Tag>
                  </Space>
                }
                extra={
                  <Space>
                    {draft.status === 'draft' && (
                      <Button icon={<CheckCircleOutlined />} onClick={handleSubmitReview}>
                        提交审核
                      </Button>
                    )}
                    {draft.status === 'pending_review' && (
                      <>
                        <Button danger icon={<CloseCircleOutlined />} onClick={handleReject}>
                          退回
                        </Button>
                        <Button type="primary" icon={<CheckCircleOutlined />} loading={confirming} onClick={handleConfirm}>
                          确认并建线索
                        </Button>
                      </>
                    )}
                    {draft.status === 'confirmed' && !createdLead && (
                      <Button type="primary" icon={<CheckCircleOutlined />} loading={confirming} onClick={handleConfirm}>
                        确认并建线索
                      </Button>
                    )}
                    {draft.status === 'rejected' && (
                      <Button icon={<EditOutlined />} onClick={handleReEdit}>
                        重新编辑
                      </Button>
                    )}
                  </Space>
                }
              >
                {/* Draft details */}
                <InfoStrip bordered items={[
                  { label: '意图类型', value: <Tag>{draft.intentType === 'inquiry' ? '询价' : draft.intentType}</Tag> },
                  { label: '解析引擎', value: draft.parseEngine },
                  { label: '商品关键词', value: <Space wrap>{draft.productKeywords.map(k => <Tag key={k}>{k}</Tag>)}</Space> },
                  { label: '型号', value: <Space wrap>{draft.modelNumbers.map(m => <Tag key={m} color="blue">{m}</Tag>)}</Space> },
                  { label: '数量', value: draft.quantity ? `${draft.quantity} ${draft.unit || ''}` : '未识别' },
                  { label: '区域', value: draft.region || '未识别' },
                  { label: '交期要求', value: draft.deliveryRequirement || '未提及' },
                  { label: '支付方式', value: draft.paymentTerms || '未提及' },
                ]} />

                {/* Low confidence alert */}
                {draft.confidenceScore < 0.7 && (
                  <InsightCallout type="warning" title="低置信度提醒" description={`AI 解析置信度仅 ${Math.round(draft.confidenceScore * 100)}%，建议人工重点复核关键字段。`} />
                )}

                {/* High risk alert */}
                {(draft.riskFlags.some(f => f.severity === 'high') || draft.riskLevel === 'high') && (
                  <InsightCallout type="error" title="高风险提示" description="此询价包含高风险标记，请在确认前仔细审查。" />
                )}

                {/* Missing fields */}
                {draft.missingFields.length > 0 && (
                  <InsightCallout type="warning" title="缺失字段">
                    <Space wrap>{draft.missingFields.map(f => <Tag key={f} color="orange">{f}</Tag>)}</Space>
                  </InsightCallout>
                )}

                {/* Risk flags */}
                {draft.riskFlags.length > 0 && (
                  <div className={sharedStyles.sectionTopMd}>
                    <Text type="secondary">风险标记：</Text>
                    {draft.riskFlags.map((flag, i) => (
                      <Alert
                        key={i}
                        type={flag.severity === 'high' ? 'error' : flag.severity === 'medium' ? 'warning' : 'info'}
                        title={flag.description}
                        description={flag.suggestion}
                        className={sharedStyles.sectionTopSm}
                      />
                    ))}
                  </div>
                )}

                {/* Manual corrections */}
                {draft.manualCorrections.length > 0 && (
                  <div className={sharedStyles.sectionTopMd}>
                    <Text type="secondary">人工修正记录：</Text>
                    <ul className={sharedStyles.noteList}>
                      {draft.manualCorrections.map((c, i) => <li key={i}><Text>{c}</Text></li>)}
                    </ul>
                  </div>
                )}
              </Card>
            )}

            {/* ── Existing Lead (resume flow) ── */}
            {createdLead && selectedConv?.linkedLeadId && (
              <Alert
                type="info"
                showIcon
                className={sharedStyles.noMargin}
                title="已有线索"
                description={`此会话已关联线索 ${createdLead.id}（状态：${createdLead.status}）。`}
                action={
                  <Button type="primary" onClick={() => navigate(`/leads/${createdLead.id}`)}>
                    进入线索详情 →
                  </Button>
                }
              />
            )}

            {/* ── Step 2: Created Lead (new) ── */}
            {createdLead && !selectedConv?.linkedLeadId && (
              <Card
                title={
                  <Space>
                    <span className={sharedStyles.bodyIcon}><CheckCircleOutlined className={sharedStyles.successIcon} /></span>
                    <Text strong>线索已创建 — {createdLead.id}</Text>
                  </Space>
                }
                className={sharedStyles.cardSuccessBorder}
              >
                <Descriptions column={2} size="small" bordered>
                  <Descriptions.Item label="状态">
                    <Tag color="blue">{createdLead.status}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="优先级">
                    <Tag color={createdLead.priorityLevel === 'high' ? 'red' : 'orange'}>
                      {createdLead.priorityLevel === 'high' ? '高' : createdLead.priorityLevel === 'medium' ? '中' : '低'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="业务价值">{createdLead.businessValueScore}/100</Descriptions.Item>
                  <Descriptions.Item label="负责人">{createdLead.assignedTo}</Descriptions.Item>
                </Descriptions>
                <div className={sharedStyles.centeredSection}>
                  <Text type="secondary" className={sharedStyles.blockNote}>
                    下一步：AI 将基于商品库为该线索生成方案推荐
                  </Text>
                  <Button type="primary" size="large" icon={<CheckCircleOutlined />} onClick={() => navigate(`/leads/${createdLead.id}`)}>
                    进入线索详情，开始方案推荐 →
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
      </div>
    </PageShell>
  )
}

export default ConversationWorkbench
