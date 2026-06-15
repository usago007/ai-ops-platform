/**
 * Unified In-Memory Mock Store
 *
 * 维护所有 10 个业务对象集合，seed 数据一次性从 generators 加载。
 * 所有 adapter 的 CRUD 操作都通过此 store 完成。
 * 同一 session 内所有页面看到的状态一致。
 */
import type { Conversation, InquiryDraft, Lead, ProductAsset,
  SolutionRecommendation, ReplyDraft, QuotationDraft,
  Outcome, KnowledgeItem, MetricSnapshot,
  SystemHealth, AuditEntry, ModelConfig, AgentConfig } from '../../../contracts'

import {
  createRng, GLOBAL_SEED,
  generateProductAssets,
  generateConversations,
  generateInquiryDrafts,
  generateLeads,
  generateSolutionRecommendations,
  generateReplyDrafts,
  generateQuotationDrafts,
  generateOutcomes,
  generateKnowledgeItems,
  generateMetricSnapshots,
  generateSystemHealth,
  generateAuditEntries,
  generateModelConfigs,
  generateAgentConfigs,
} from './generators'

// ── Store state (singleton) ──

let conversations: Conversation[] = []
let inquiryDrafts: InquiryDraft[] = []
let leads: Lead[] = []
let productAssets: ProductAsset[] = []
let solutionRecommendations: SolutionRecommendation[] = []
let replyDrafts: ReplyDraft[] = []
let quotationDrafts: QuotationDraft[] = []
let outcomes: Outcome[] = []
let knowledgeItems: KnowledgeItem[] = []
let metricSnapshots: MetricSnapshot[] = []
let systemHealth: SystemHealth | null = null
let auditEntries: AuditEntry[] = []
let modelConfigs: ModelConfig[] = []
let agentConfigs: AgentConfig[] = []

let initialized = false

// ── Init: seed once (dependency-ordered chain) ──

function ensureInit(): void {
  if (initialized) return

  const rng = createRng(GLOBAL_SEED)

  // Phase 1: Independent objects
  productAssets = generateProductAssets(rng)
  conversations = generateConversations(rng)
  modelConfigs = generateModelConfigs(rng)
  agentConfigs = generateAgentConfigs(rng)

  // Phase 2: Objects depending on Phase 1
  inquiryDrafts = generateInquiryDrafts(rng, conversations)
  leads = generateLeads(rng, conversations, inquiryDrafts, productAssets)

  // Phase 3: Objects depending on leads
  solutionRecommendations = generateSolutionRecommendations(rng, leads, productAssets)
  replyDrafts = generateReplyDrafts(rng, leads, conversations)
  quotationDrafts = generateQuotationDrafts(rng, leads, productAssets)

  // Phase 4: Terminal objects
  outcomes = generateOutcomes(rng, leads)
  knowledgeItems = generateKnowledgeItems(rng, outcomes)

  // Phase 5: Aggregate/computed objects
  auditEntries = generateAuditEntries(rng, conversations, inquiryDrafts, leads,
    solutionRecommendations, replyDrafts, quotationDrafts, outcomes)
  metricSnapshots = generateMetricSnapshots(rng, leads, outcomes, replyDrafts)

  const totalModelCalls = modelConfigs.reduce((sum, m) => sum + m.callCount, 0)
  systemHealth = generateSystemHealth(
    leads, outcomes, knowledgeItems, metricSnapshots,
    auditEntries.length, totalModelCalls,
  )

  initialized = true
}

// ── Generic CRUD helpers ──

function nextId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

function now(): string {
  return new Date().toISOString()
}

// ── Exported store API ──

export const store = {
  // ── Conversations ──
  get conversations(): Conversation[] {
    ensureInit()
    return conversations
  },
  getConversation(id: string): Conversation | undefined {
    ensureInit()
    return this.conversations.find(c => c.id === id)
  },
  updateConversation(id: string, patch: Partial<Conversation>): Conversation {
    ensureInit()
    const idx = conversations.findIndex(c => c.id === id)
    if (idx === -1) throw new Error(`Conversation ${id} not found`)
    conversations[idx] = { ...conversations[idx], ...patch }
    return conversations[idx]
  },
  linkDraftToConversation(convId: string, draftId: string): Conversation {
    return this.updateConversation(convId, { linkedDraftId: draftId })
  },
  linkLeadToConversation(convId: string, leadId: string): Conversation {
    return this.updateConversation(convId, { linkedLeadId: leadId, status: 'active' })
  },

  // ── InquiryDrafts ──
  get inquiryDrafts(): InquiryDraft[] {
    ensureInit()
    return inquiryDrafts
  },
  getDraft(id: string): InquiryDraft | undefined {
    ensureInit()
    return inquiryDrafts.find(d => d.id === id)
  },
  getDraftByConversation(convId: string): InquiryDraft | undefined {
    ensureInit()
    return inquiryDrafts.find(d => d.conversationId === convId)
  },
  createDraft(data: Omit<InquiryDraft, 'id' | 'createdAt' | 'updatedAt'>): InquiryDraft {
    ensureInit()
    const draft: InquiryDraft = { ...data, id: nextId('draft'), createdAt: now(), updatedAt: now() }
    inquiryDrafts.push(draft)
    return draft
  },
  confirmDraft(id: string): InquiryDraft {
    ensureInit()
    const idx = inquiryDrafts.findIndex(d => d.id === id)
    if (idx === -1) throw new Error(`Draft ${id} not found`)
    inquiryDrafts[idx] = { ...inquiryDrafts[idx], status: 'confirmed', updatedAt: now() }
    return inquiryDrafts[idx]
  },
  rejectDraft(id: string, reason: string): InquiryDraft {
    ensureInit()
    const idx = inquiryDrafts.findIndex(d => d.id === id)
    if (idx === -1) throw new Error(`Draft ${id} not found`)
    inquiryDrafts[idx] = {
      ...inquiryDrafts[idx], status: 'rejected',
      manualCorrections: [...inquiryDrafts[idx].manualCorrections, reason],
      updatedAt: now(),
    }
    return inquiryDrafts[idx]
  },

  // ── Leads ──
  get leads(): Lead[] {
    ensureInit()
    return leads
  },
  getLead(id: string): Lead | undefined {
    ensureInit()
    return leads.find(l => l.id === id)
  },
  createLead(data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Lead {
    ensureInit()
    const lead: Lead = { ...data, id: nextId('lead'), createdAt: now(), updatedAt: now() }
    leads.push(lead)
    return lead
  },
  transitionLead(id: string, newStatus: Lead['status']): Lead {
    ensureInit()
    const idx = leads.findIndex(l => l.id === id)
    if (idx === -1) throw new Error(`Lead ${id} not found`)
    leads[idx] = { ...leads[idx], status: newStatus, lastActionAt: now(), updatedAt: now() }
    return leads[idx]
  },
  updateLead(id: string, patch: Partial<Lead>): Lead {
    ensureInit()
    const idx = leads.findIndex(l => l.id === id)
    if (idx === -1) throw new Error(`Lead ${id} not found`)
    leads[idx] = { ...leads[idx], ...patch, updatedAt: now() }
    return leads[idx]
  },

  // ── ProductAssets ──
  get productAssets(): ProductAsset[] {
    ensureInit()
    return productAssets
  },
  getProduct(id: string): ProductAsset | undefined {
    ensureInit()
    return productAssets.find(p => p.id === id)
  },

  // ── SolutionRecommendations ──
  get solutionRecommendations(): SolutionRecommendation[] {
    ensureInit()
    return solutionRecommendations
  },
  getSolution(id: string): SolutionRecommendation | undefined {
    ensureInit()
    return solutionRecommendations.find(s => s.id === id)
  },
  getSolutionByLead(leadId: string): SolutionRecommendation | undefined {
    ensureInit()
    return solutionRecommendations.find(s => s.leadId === leadId)
  },
  createSolution(data: Omit<SolutionRecommendation, 'id' | 'createdAt' | 'updatedAt'>): SolutionRecommendation {
    ensureInit()
    const sol: SolutionRecommendation = { ...data, id: nextId('sol'), createdAt: now(), updatedAt: now() }
    solutionRecommendations.push(sol)
    return sol
  },
  reviewSolution(id: string, status: SolutionRecommendation['status'], notes?: string): SolutionRecommendation {
    ensureInit()
    const idx = solutionRecommendations.findIndex(s => s.id === id)
    if (idx === -1) throw new Error(`Solution ${id} not found`)
    solutionRecommendations[idx] = { ...solutionRecommendations[idx], status, reviewNotes: notes || null, updatedAt: now() }
    return solutionRecommendations[idx]
  },

  // ── ReplyDrafts ──
  get replyDrafts(): ReplyDraft[] {
    ensureInit()
    return replyDrafts
  },
  getReply(id: string): ReplyDraft | undefined {
    ensureInit()
    return replyDrafts.find(r => r.id === id)
  },
  getRepliesByLead(leadId: string): ReplyDraft[] {
    ensureInit()
    return replyDrafts.filter(r => r.leadId === leadId)
  },
  createReply(data: Omit<ReplyDraft, 'id' | 'createdAt' | 'updatedAt'>): ReplyDraft {
    ensureInit()
    const reply: ReplyDraft = { ...data, id: nextId('reply'), createdAt: now(), updatedAt: now() }
    replyDrafts.push(reply)
    return reply
  },
  updateReply(id: string, patch: Partial<ReplyDraft>): ReplyDraft {
    ensureInit()
    const idx = replyDrafts.findIndex(r => r.id === id)
    if (idx === -1) throw new Error(`Reply ${id} not found`)
    replyDrafts[idx] = { ...replyDrafts[idx], ...patch, updatedAt: now() }
    return replyDrafts[idx]
  },
  sendReply(id: string): ReplyDraft {
    return this.updateReply(id, { status: 'sent' })
  },

  // ── QuotationDrafts ──
  get quotationDrafts(): QuotationDraft[] {
    ensureInit()
    return quotationDrafts
  },
  getQuotation(id: string): QuotationDraft | undefined {
    ensureInit()
    return quotationDrafts.find(q => q.id === id)
  },
  getQuotationsByLead(leadId: string): QuotationDraft[] {
    ensureInit()
    return quotationDrafts.filter(q => q.leadId === leadId)
  },
  createQuotation(data: Omit<QuotationDraft, 'id' | 'createdAt' | 'updatedAt'>): QuotationDraft {
    ensureInit()
    const quote: QuotationDraft = { ...data, id: nextId('quot'), createdAt: now(), updatedAt: now() }
    quotationDrafts.push(quote)
    return quote
  },
  sendQuotation(id: string): QuotationDraft {
    ensureInit()
    const idx = quotationDrafts.findIndex(q => q.id === id)
    if (idx === -1) throw new Error(`Quotation ${id} not found`)
    quotationDrafts[idx] = { ...quotationDrafts[idx], status: 'sent', updatedAt: now() }
    return quotationDrafts[idx]
  },

  // ── Outcomes ──
  get outcomes(): Outcome[] {
    ensureInit()
    return outcomes
  },
  getOutcome(id: string): Outcome | undefined {
    ensureInit()
    return outcomes.find(o => o.id === id)
  },
  getOutcomeByLead(leadId: string): Outcome | undefined {
    ensureInit()
    return outcomes.find(o => o.leadId === leadId)
  },
  createOutcome(data: Omit<Outcome, 'id' | 'createdAt'>): Outcome {
    ensureInit()
    const outcome: Outcome = { ...data, id: nextId('outcome'), createdAt: now() }
    outcomes.push(outcome)
    return outcome
  },
  markOutcomeProcessed(id: string): Outcome {
    ensureInit()
    const idx = outcomes.findIndex(o => o.id === id)
    if (idx === -1) throw new Error(`Outcome ${id} not found`)
    outcomes[idx] = { ...outcomes[idx], loopbackStatus: 'processed' }
    return outcomes[idx]
  },

  // ── KnowledgeItems ──
  get knowledgeItems(): KnowledgeItem[] {
    ensureInit()
    return knowledgeItems
  },
  addKnowledgeItem(item: KnowledgeItem): void {
    ensureInit()
    knowledgeItems.push(item)
  },
  getKnowledgeItem(id: string): KnowledgeItem | undefined {
    ensureInit()
    return knowledgeItems.find(k => k.id === id)
  },
  getKnowledgeByOutcome(outcomeId: string): KnowledgeItem[] {
    ensureInit()
    return knowledgeItems.filter(k => k.sourceOutcomeId === outcomeId)
  },
  getLeadsByProduct(productId: string): Lead[] {
    ensureInit()
    return leads.filter(l => l.relatedProductIds.includes(productId))
  },
  getOutcomesByProduct(productId: string): Outcome[] {
    ensureInit()
    return outcomes.filter(o => o.relatedProductIds.includes(productId))
  },
  getSolutionsByProduct(productId: string): SolutionRecommendation[] {
    ensureInit()
    return solutionRecommendations.filter(s =>
      s.recommendedProducts.some(p => p.productId === productId)
    )
  },
  getKnowledgeByProduct(productId: string): KnowledgeItem[] {
    ensureInit()
    return knowledgeItems.filter(k => k.relatedProductIds.includes(productId))
  },

  // ── MetricSnapshots ──
  get metricSnapshots(): MetricSnapshot[] {
    ensureInit()
    return metricSnapshots
  },
  getLatestMetrics(): MetricSnapshot {
    ensureInit()
    return metricSnapshots[0]
  },

  // ── Composite: recompute metrics ──
  recomputeMetrics(): MetricSnapshot {
    ensureInit()
    const total = leads.length
    const won = leads.filter(l => l.status === 'won').length
    const lost = leads.filter(l => l.status === 'lost').length
    const closed = won + lost
    const qualified = leads.filter(l =>
      ['qualified', 'recommending', 'draft_ready', 'sent', 'following_up', 'won', 'lost', 'closed_looped'].includes(l.status)
    ).length
    const automated = leads.filter(l =>
      ['recommending', 'draft_ready', 'sent', 'following_up', 'won', 'lost'].includes(l.status)
    ).length

    const wonOutcomes = outcomes.filter(o => o.resultType === 'won')
    const avgDeal = wonOutcomes.length > 0
      ? wonOutcomes.reduce((sum, o) => sum + (o.finalAmount || 0), 0) / wonOutcomes.length
      : 0

    const metric: MetricSnapshot = {
      date: now().slice(0, 10),
      leadCount: total,
      qualifiedRate: total > 0 ? qualified / total : 0,
      replyAdoptionRate: replyDrafts.length > 0 ? replyDrafts.filter(r => r.status === 'sent').length / replyDrafts.length : 0,
      quotationCycleHours: 2.5,
      winRate: closed > 0 ? won / closed : 0,
      avgDealAmount: avgDeal,
      automationCoverage: total > 0 ? automated / total : 0,
      manualReviewRate: 0.35,
      highRiskInterceptRate: 0.12,
      aiSavedHours: total * 0.7,
    }

    metricSnapshots.unshift(metric)
    return metric
  },

  // ── System ──
  get systemHealth(): SystemHealth {
    ensureInit()
    return systemHealth!
  },
  get auditEntries(): AuditEntry[] {
    ensureInit()
    return auditEntries
  },
  getAuditEntry(id: string): AuditEntry | undefined {
    ensureInit()
    return auditEntries.find(e => e.id === id)
  },
  get modelConfigs(): ModelConfig[] {
    ensureInit()
    return modelConfigs
  },
  getModelConfig(id: string): ModelConfig | undefined {
    ensureInit()
    return modelConfigs.find(m => m.id === id)
  },
  get agentConfigs(): AgentConfig[] {
    ensureInit()
    return agentConfigs
  },
  getAgentConfig(id: string): AgentConfig | undefined {
    ensureInit()
    return agentConfigs.find(a => a.id === id)
  },
}
