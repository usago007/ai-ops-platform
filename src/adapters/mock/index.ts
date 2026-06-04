/**
 * Mock Adapters — 统一从 in-memory store 读写
 *
 * 所有 CRUD 通过 store，不再调用 generateXxx()。
 * 延迟使用分层 mockDelay（read / mutation / aiAction / aggregate）。
 */
import { store } from './store'
import { mockDelay } from './latency'
import type { Conversation, InquiryDraft, Lead, ProductAsset,
  SolutionRecommendation, ReplyDraft, QuotationDraft,
  Outcome, KnowledgeItem, MetricSnapshot,
  AuditEntry, ModelConfig, AgentConfig } from '../../contracts'

// ── Conversation Adapter ──

export const mockConversationAdapter = {
  list: async (): Promise<Conversation[]> => {
    await mockDelay('read'); return store.conversations
  },
  getById: async (id: string): Promise<Conversation | undefined> => {
    await mockDelay('read'); return store.getConversation(id)
  },
  linkDraft: async (convId: string, draftId: string): Promise<Conversation> => {
    await mockDelay('mutation'); return store.linkDraftToConversation(convId, draftId)
  },
  linkLead: async (convId: string, leadId: string): Promise<Conversation> => {
    await mockDelay('mutation'); return store.linkLeadToConversation(convId, leadId)
  },
  updateStatus: async (id: string, status: Conversation['status']): Promise<Conversation> => {
    await mockDelay('mutation'); return store.updateConversation(id, { status })
  },
}

// ── InquiryDraft Adapter ──

export const mockInquiryDraftAdapter = {
  list: async (): Promise<InquiryDraft[]> => {
    await mockDelay('read'); return store.inquiryDrafts
  },
  getById: async (id: string): Promise<InquiryDraft | undefined> => {
    await mockDelay('read'); return store.getDraft(id)
  },
  getByConversationId: async (convId: string): Promise<InquiryDraft | undefined> => {
    await mockDelay('read'); return store.getDraftByConversation(convId)
  },
  create: async (data: Omit<InquiryDraft, 'id' | 'createdAt' | 'updatedAt'>): Promise<InquiryDraft> => {
    await mockDelay('mutation'); return store.createDraft(data)
  },
  confirm: async (id: string): Promise<InquiryDraft> => {
    await mockDelay('mutation'); return store.confirmDraft(id)
  },
  reject: async (id: string, reason: string): Promise<InquiryDraft> => {
    await mockDelay('mutation'); return store.rejectDraft(id, reason)
  },
  update: async (id: string, patch: Partial<InquiryDraft>): Promise<InquiryDraft> => {
    await mockDelay('mutation')
    const draft = store.getDraft(id)
    if (!draft) throw new Error(`Draft ${id} not found`)
    const idx = store.inquiryDrafts.findIndex(d => d.id === id)
    store.inquiryDrafts[idx] = { ...draft, ...patch, updatedAt: new Date().toISOString() }
    return store.inquiryDrafts[idx]
  },
}

// ── Lead Adapter ──

export const mockLeadAdapter = {
  list: async (): Promise<Lead[]> => {
    await mockDelay('read'); return store.leads
  },
  getById: async (id: string): Promise<Lead | undefined> => {
    await mockDelay('read'); return store.getLead(id)
  },
  getByProductId: async (productId: string): Promise<Lead[]> => {
    await mockDelay('read'); return store.getLeadsByProduct(productId)
  },
  create: async (data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> => {
    await mockDelay('mutation'); return store.createLead(data)
  },
  transition: async (id: string, newStatus: Lead['status']): Promise<Lead> => {
    await mockDelay('mutation'); return store.transitionLead(id, newStatus)
  },
  update: async (id: string, patch: Partial<Lead>): Promise<Lead> => {
    await mockDelay('mutation'); return store.updateLead(id, patch)
  },
}

// ── ProductAsset Adapter ──

export const mockProductAssetAdapter = {
  list: async (): Promise<ProductAsset[]> => {
    await mockDelay('read'); return store.productAssets
  },
  getById: async (id: string): Promise<ProductAsset | undefined> => {
    await mockDelay('read'); return store.getProduct(id)
  },
}

// ── SolutionRecommendation Adapter ──

export const mockSolutionRecommendationAdapter = {
  getByLeadId: async (leadId: string): Promise<SolutionRecommendation | undefined> => {
    await mockDelay('read'); return store.getSolutionByLead(leadId)
  },
  getById: async (id: string): Promise<SolutionRecommendation | undefined> => {
    await mockDelay('read'); return store.getSolution(id)
  },
  getByProductId: async (productId: string): Promise<SolutionRecommendation[]> => {
    await mockDelay('read')
    return store.solutionRecommendations.filter(s =>
      s.recommendedProducts.some(p => p.productId === productId)
    )
  },
  generate: async (leadId: string, productIds: string[]): Promise<SolutionRecommendation> => {
    await mockDelay('aiAction')
    const allProducts = store.productAssets
    const matched = productIds.length > 0
      ? allProducts.filter(p => productIds.includes(p.id))
      : allProducts.slice(0, 2)
    return store.createSolution({
      leadId,
      recommendedProducts: matched.map((p, i) => ({
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        reason: `匹配客户需求，${p.sellingPoints[0] || '历史成交率高'}`,
        matchScore: 85 + Math.floor(Math.random() * 14),
        isPrimary: i === 0,
      })),
      alternativeOptions: [],
      matchedCases: [],
      matchedFaqs: matched.flatMap(p => p.faqItems.map(f => ({ question: f.question, answer: f.answer, relevanceScore: 0.9 }))).slice(0, 3),
      pricingReference: matched.length > 0 ? { minPrice: 2000, maxPrice: 3000, avgPrice: 2560, currency: 'CNY' } : null,
      deliveryReference: '现货充足，7-10个工作日',
      reasoningSummary: `AI 基于 ${matched.length} 个匹配商品 + ${store.knowledgeItems.length} 条知识生成了推荐。推荐主推 ${matched[0]?.name || '匹配商品'}，同时提供了替代方案。`,
      confidenceScore: 0.75 + Math.random() * 0.2,
      humanReviewRequired: true,
      status: 'generated',
      reviewedBy: null,
      reviewNotes: null,
    })
  },
  review: async (id: string, status: SolutionRecommendation['status'], notes?: string): Promise<SolutionRecommendation> => {
    await mockDelay('mutation')
    const sol = store.reviewSolution(id, status, notes)
    if (status === 'accepted') {
      store.updateLead(sol.leadId, { selectedSolutionId: id })
    }
    return sol
  },
}

// ── ReplyDraft Adapter ──

export const mockReplyDraftAdapter = {
  getByLeadId: async (leadId: string): Promise<ReplyDraft[]> => {
    await mockDelay('read'); return store.getRepliesByLead(leadId)
  },
  generate: async (leadId: string, conversationId: string): Promise<ReplyDraft> => {
    await mockDelay('aiAction')
    const lead = store.getLead(leadId)
    const solution = store.getSolutionByLead(leadId)
    const products = solution?.recommendedProducts || []
    const productNames = products.map(p => p.productName).join('、')

    return store.createReply({
      leadId,
      conversationId,
      replyScenario: 'initial_response',
      draftContent: `尊敬的${lead?.companyName || '客户'}：

感谢您的询价！针对您所需的${productNames || '商品'}，我们为您整理了以下方案：

- 现货充足，可立即安排发货
- 提供专业技术支持和免费编程指导
- 批量采购可享受优惠折扣

请问您对支付方式和交期有什么偏好吗？期待您的回复！

AI Ops 客服团队`,
      finalContent: null,
      tone: 'professional',
      basedOnRecommendations: solution ? [solution.id] : [],
      riskWarnings: ['建议确认客户税率和支付方式'],
      editable: true,
      approvedBy: null,
      editHistory: [],
      status: 'generated',
    })
  },
  update: async (id: string, patch: Partial<ReplyDraft>): Promise<ReplyDraft> => {
    await mockDelay('mutation'); return store.updateReply(id, patch)
  },
  approve: async (id: string): Promise<ReplyDraft> => {
    await mockDelay('mutation'); return store.updateReply(id, { status: 'approved' })
  },
  send: async (id: string): Promise<ReplyDraft> => {
    await mockDelay('aiAction')
    const reply = store.sendReply(id)
    store.updateLead(reply.leadId, { selectedReplyDraftId: id })
    return reply
  },
}

// ── QuotationDraft Adapter ──

export const mockQuotationDraftAdapter = {
  getByLeadId: async (leadId: string): Promise<QuotationDraft[]> => {
    await mockDelay('read'); return store.getQuotationsByLead(leadId)
  },
  generate: async (leadId: string): Promise<QuotationDraft> => {
    await mockDelay('aiAction')
    const solution = store.getSolutionByLead(leadId)
    const products = solution?.recommendedProducts || []

    return store.createQuotation({
      leadId,
      products: products.map(p => ({
        productId: p.productId,
        productName: p.productName,
        sku: p.sku,
        quantity: 1,
        unit: '台',
        unitPrice: 2560,
        totalPrice: 2560,
      })),
      priceItems: [
        { label: '商品合计', amount: products.length * 2560, type: 'product' },
        { label: '运费', amount: 500, type: 'shipping' },
        { label: '增值税(13%)', amount: products.length * 2560 * 0.13, type: 'tax' },
      ],
      totalAmount: products.length * 2560 * 1.13 + 500,
      currency: 'CNY',
      deliveryTerms: '合同签订后7-10个工作日发货',
      paymentTerms: 'net30',
      validUntil: new Date(Date.now() + 15 * 86400000).toISOString(),
      quotationNotes: '报价有效期15天，含增值税专用发票',
      riskAlerts: [],
      referenceCases: [],
      approvedBy: null,
      editHistory: [],
      status: 'generated',
    })
  },
  update: async (id: string, patch: Partial<QuotationDraft>): Promise<QuotationDraft> => {
    await mockDelay('mutation')
    const quote = store.getQuotation(id)
    if (!quote) throw new Error(`Quotation ${id} not found`)
    const idx = store.quotationDrafts.findIndex(q => q.id === id)
    store.quotationDrafts[idx] = { ...quote, ...patch, updatedAt: new Date().toISOString() }
    return store.quotationDrafts[idx]
  },
  send: async (id: string): Promise<QuotationDraft> => {
    await mockDelay('aiAction')
    const quote = store.sendQuotation(id)
    store.updateLead(quote.leadId, { selectedQuotationDraftId: id })
    return quote
  },
}

// ── Outcome Adapter ──

export const mockOutcomeAdapter = {
  getByLeadId: async (leadId: string): Promise<Outcome | undefined> => {
    await mockDelay('read'); return store.getOutcomeByLead(leadId)
  },
  getById: async (id: string): Promise<Outcome | undefined> => {
    await mockDelay('read'); return store.getOutcome(id)
  },
  getByProductId: async (productId: string): Promise<Outcome[]> => {
    await mockDelay('read'); return store.getOutcomesByProduct(productId)
  },
  list: async (): Promise<Outcome[]> => {
    await mockDelay('read'); return store.outcomes
  },
  create: async (data: Omit<Outcome, 'id' | 'createdAt'>): Promise<Outcome> => {
    await mockDelay('aiAction')
    const solution = store.getSolutionByLead(data.leadId)
    const relatedProductIds = solution?.recommendedProducts.map(p => p.productId) || []
    const enrichedData = { ...data, relatedProductIds }
    const outcome = store.createOutcome(enrichedData)

    const targetStatus = data.resultType === 'won' ? 'won' as const : 'lost' as const
    store.transitionLead(data.leadId, targetStatus)
    store.updateLead(data.leadId, { outcomeId: outcome.id })

    const lead = store.getLead(data.leadId)
    const kiType = data.resultType === 'won' ? 'pricing_strategy' : 'loss_analysis'
    store.addKnowledgeItem({
      id: `ki-${Date.now()}`,
      sourceOutcomeId: outcome.id,
      type: kiType,
      title: data.resultType === 'won'
        ? `赢单分析：${lead?.companyName || data.leadId}`
        : `丢单分析：${lead?.companyName || data.leadId}`,
      summary: data.reasonDetail || (data.resultType === 'won' ? '客户确认成交' : '客户未回复/拒绝'),
      content: `## 结果\n${data.reasonDetail}\n\n## 金额\n${data.finalAmount ? `¥${data.finalAmount.toLocaleString()}` : '无'}\n\n## AI 贡献\n${data.aiContributionTags.join(', ')}`,
      relatedProductIds,
      relatedLeadIds: [data.leadId],
      tags: [kiType, data.resultType],
      status: 'published',
      createdBy: 'ai',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    store.recomputeMetrics()
    store.markOutcomeProcessed(outcome.id)
    return outcome
  },
}

// ── KnowledgeItem Adapter ──

export const mockKnowledgeItemAdapter = {
  list: async (): Promise<KnowledgeItem[]> => {
    await mockDelay('read'); return store.knowledgeItems
  },
  getByOutcomeId: async (outcomeId: string): Promise<KnowledgeItem[]> => {
    await mockDelay('read'); return store.getKnowledgeByOutcome(outcomeId)
  },
  getByProductId: async (productId: string): Promise<KnowledgeItem[]> => {
    await mockDelay('read'); return store.getKnowledgeByProduct(productId)
  },
  getById: async (id: string): Promise<KnowledgeItem | undefined> => {
    await mockDelay('read'); return store.getKnowledgeItem(id)
  },
}

// ── MetricSnapshot Adapter ──

export const mockMetricSnapshotAdapter = {
  latest: async (): Promise<MetricSnapshot> => {
    await mockDelay('read'); return store.getLatestMetrics()
  },
  history: async (): Promise<MetricSnapshot[]> => {
    await mockDelay('read'); return store.metricSnapshots
  },
  recompute: async (): Promise<MetricSnapshot> => {
    await mockDelay('aiAction'); return store.recomputeMetrics()
  },
}

// ── System Adapters ──

export const mockSystemHealthAdapter = {
  get: async () => { await mockDelay('read'); return store.systemHealth },
}

export const mockAuditAdapter = {
  list: async (): Promise<AuditEntry[]> => { await mockDelay('read'); return store.auditEntries },
  getByLeadId: async (leadId: string): Promise<AuditEntry[]> => {
    await mockDelay('read'); return store.auditEntries.filter(e => e.leadId === leadId)
  },
  getById: async (id: string): Promise<AuditEntry | undefined> => {
    await mockDelay('read'); return store.getAuditEntry(id)
  },
}

export const mockModelConfigAdapter = {
  list: async (): Promise<ModelConfig[]> => { await mockDelay('read'); return store.modelConfigs },
  getById: async (id: string): Promise<ModelConfig | undefined> => {
    await mockDelay('read'); return store.getModelConfig(id)
  },
}

export const mockAgentConfigAdapter = {
  list: async (): Promise<AgentConfig[]> => { await mockDelay('read'); return store.agentConfigs },
  getById: async (id: string): Promise<AgentConfig | undefined> => {
    await mockDelay('read'); return store.getAgentConfig(id)
  },
}
