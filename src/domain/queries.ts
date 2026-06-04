/**
 * Domain Queries — 纯查询/聚合能力
 *
 * 所有页面级 filter/map/reduce 聚合逻辑都应集中在这里。
 * 页面只负责展示 query 返回的结果。
 * 后续对接真实后端时，这些 query 可直接映射为 API 调用。
 */
import type {
  AgentConfig,
  AuditEntry,
  Lead,
  MetricSnapshot,
  ModelConfig,
  Outcome,
  KnowledgeItem,
  ProductAsset,
  SolutionRecommendation,
  ReplyDraft,
  QuotationDraft,
  SystemHealth,
} from '../contracts'
import { STEP_MAIN_CHAIN_MAP } from '../contracts/system-health'

// ── Engine Trace ──

export interface EngineTraceItem {
  step: string
  engine: string
  source: string
  status: 'used' | 'skipped' | 'pending'
  detail?: string
}

/**
 * 为一条线索生成完整的 AI 引擎调用链追踪。
 */
export function getEngineTrace(
  lead: Lead,
  solution: SolutionRecommendation | null,
  reply: ReplyDraft | null,
  quotation: QuotationDraft | null,
): EngineTraceItem[] {
  return [
    {
      step: '需求理解',
      engine: 'LLM + Rule Hybrid',
      source: lead.sourceDraftId ? `InquiryDraft(${lead.sourceDraftId})` : 'Conversation',
      status: 'used',
      detail: '字段提取 + 分类匹配 + 置信度评估',
    },
    {
      step: '方案推荐',
      engine: 'LLM + Knowledge Base',
      source: solution ? `SolutionRecommendation(${solution.id})` : '—',
      status: solution ? 'used' : 'pending',
      detail: solution ? `匹配${solution.recommendedProducts.length}商品 + ${solution.matchedCases.length}案例` : undefined,
    },
    {
      step: '回复生成',
      engine: 'LLM (Reply Gen)',
      source: reply ? `ReplyDraft(${reply.id})` : '—',
      status: reply ? 'used' : 'pending',
      detail: reply ? `${reply.replyScenario} | 风险提示 ${reply.riskWarnings.length} 条` : undefined,
    },
    {
      step: '报价生成',
      engine: 'Rule + LLM',
      source: quotation ? `QuotationDraft(${quotation.id})` : '—',
      status: quotation ? 'used' : 'pending',
      detail: quotation ? `${quotation.products.length} 行项目 | ¥${quotation.totalAmount.toLocaleString()}` : undefined,
    },
    {
      step: '结果回流',
      engine: 'Auto Loopback',
      source: lead.outcomeId ? `Outcome(${lead.outcomeId})` : '—',
      status: lead.outcomeId ? 'used' : 'pending',
      detail: lead.outcomeId ? 'Lead更新 + KnowledgeItem + Metric重算' : undefined,
    },
  ]
}

// ── Product Contribution ──

export interface ProductContribution {
  product: ProductAsset
  leadCount: number
  wonCount: number
  lostCount: number
  winRate: number
}

/**
 * 计算各商品的业务贡献：关联线索数、赢单数、丢单数、成交率。
 * 按线索数降序排列。
 */
export function getProductContributions(
  products: ProductAsset[],
  leads: Lead[],
): ProductContribution[] {
  return products
    .map(p => {
      const linkedLeads = leads.filter(l => l.relatedProductIds.includes(p.id))
      const won = linkedLeads.filter(l => l.status === 'won').length
      const lost = linkedLeads.filter(l => l.status === 'lost').length
      const closed = won + lost
      return {
        product: p,
        leadCount: linkedLeads.length,
        wonCount: won,
        lostCount: lost,
        winRate: closed > 0 ? won / closed : 0,
      }
    })
    .filter(c => c.leadCount > 0)
    .sort((a, b) => b.leadCount - a.leadCount)
}

// ── Lead Tracking Chain ──

export interface LeadTrackingChain {
  lead: Lead
  hasSolution: boolean
  hasReply: boolean
  hasQuotation: boolean
  hasOutcome: boolean
  /** 0-4: how many chain nodes are tracked */
  chainCompleteness: number
}

/**
 * 计算单条线索的对象追踪链完整度。
 */
export function getLeadTrackingChain(lead: Lead): LeadTrackingChain {
  const hasSolution = !!lead.selectedSolutionId
  const hasReply = !!lead.selectedReplyDraftId
  const hasQuotation = !!lead.selectedQuotationDraftId
  const hasOutcome = !!lead.outcomeId
  let completeness = 0
  if (hasSolution) completeness++
  if (hasReply) completeness++
  if (hasQuotation) completeness++
  if (hasOutcome) completeness++
  return { lead, hasSolution, hasReply, hasQuotation, hasOutcome, chainCompleteness: completeness }
}

// ── Recent Outcome Drivers ──

export interface OutcomeDriver {
  outcome: Outcome
  lead: Lead | undefined
  relatedProducts: ProductAsset[]
}

/**
 * 获取最近的结果驱动项（outcome + 关联 lead + 关联商品）。
 */
export function getRecentOutcomeDrivers(
  outcomes: Outcome[],
  leads: Lead[],
  products: ProductAsset[],
  limit = 3,
): OutcomeDriver[] {
  return outcomes
    .sort((a, b) => new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime())
    .slice(0, limit)
    .map(o => ({
      outcome: o,
      lead: leads.find(l => l.id === o.leadId),
      relatedProducts: products.filter(p => o.relatedProductIds.includes(p.id)),
    }))
}

// ── Recent Loopback Impacts ──

export interface LoopbackImpact {
  knowledgeItem: KnowledgeItem
  sourceOutcome: Outcome | undefined
}

/**
 * 获取最近的知识回流影响项。
 */
export function getRecentLoopbackImpacts(
  knowledgeItems: KnowledgeItem[],
  outcomes: Outcome[],
  limit = 3,
): LoopbackImpact[] {
  return knowledgeItems
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
    .map(ki => ({
      knowledgeItem: ki,
      sourceOutcome: outcomes.find(o => o.id === ki.sourceOutcomeId),
    }))
}

// ── Recent Leads ──

/**
 * 获取最近 N 条线索，按更新时间降序。
 */
export function getRecentLeads(leads: Lead[], limit = 5): Lead[] {
  return [...leads]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit)
}

// ── Overview Summary ──

export interface OverviewSummary {
  totalLeads: number
  activeLeads: number
  wonLeads: number
  lostLeads: number
  winRate: number
  totalOutcomes: number
  totalKnowledgeItems: number
  avgChainCompleteness: number
  topProduct: ProductContribution | null
}

/**
 * 计算经营总览摘要。
 */
export function getOverviewSummary(
  leads: Lead[],
  outcomes: Outcome[],
  knowledgeItems: KnowledgeItem[],
  productContributions: ProductContribution[],
): OverviewSummary {
  const won = leads.filter(l => l.status === 'won').length
  const lost = leads.filter(l => l.status === 'lost').length
  const closed = won + lost
  const chains = leads.map(getLeadTrackingChain)
  const avgCompleteness = chains.length > 0
    ? chains.reduce((s, c) => s + c.chainCompleteness, 0) / chains.length
    : 0

  return {
    totalLeads: leads.length,
    activeLeads: leads.filter(l => !['won', 'lost', 'closed_looped'].includes(l.status)).length,
    wonLeads: won,
    lostLeads: lost,
    winRate: closed > 0 ? won / closed : 0,
    totalOutcomes: outcomes.length,
    totalKnowledgeItems: knowledgeItems.length,
    avgChainCompleteness: avgCompleteness,
    topProduct: productContributions[0] || null,
  }
}

// ── System Foundation Overview ──

export interface SystemCapabilityNode {
  key: string
  step: string
  calls: number
  callShare: number
  modelCount: number
  enabledModelCount: number
  agentCount: number
  enabledAgentCount: number
  avgLatencyMs: number
  successRate: number
  status: 'normal' | 'warning' | 'critical'
}

export interface SystemFoundationOverview {
  healthScore: number
  enabledModels: number
  enabledAgents: number
  failureAudits: number
  reviewAudits: number
  publishedKnowledgeItems: number
  metricSnapshots: number
  capabilityNodes: SystemCapabilityNode[]
  providerDistribution: Array<{ name: string; value: number }>
  auditDistribution: Array<{ name: string; value: number }>
  agentDistribution: Array<{ name: string; value: number }>
}

export function getSystemFoundationOverview(
  health: SystemHealth,
  models: ModelConfig[],
  agents: AgentConfig[],
  audits: AuditEntry[],
  knowledgeItems: KnowledgeItem[],
  metrics: MetricSnapshot[],
): SystemFoundationOverview {
  const totalCalls = health.totalModelCalls || 1
  const failureAudits = audits.filter(a => a.result === 'failure').length
  const reviewAudits = audits.filter(a => a.result === 'review_required').length
  const enabledModels = models.filter(m => m.enabled).length
  const enabledAgents = agents.filter(a => a.enabled).length
  const errorPenalty = Math.min(35, Math.round(health.errorRate * 1000))
  const latencyPenalty = health.avgLatencyMs > 500 ? 10 : health.avgLatencyMs > 350 ? 5 : 0
  const coveragePenalty = enabledModels === 0 || enabledAgents === 0 ? 18 : 0
  const healthScore = Math.max(0, Math.min(100, 100 - errorPenalty - latencyPenalty - coveragePenalty))

  const capabilityNodes = Object.entries(health.modelCallsByStep).map(([key, calls]) => {
    const stepModels = models.filter(m => m.step === key)
    const stepAgents = agents.filter(a => a.step === key)
    const avgLatencyMs = stepModels.length > 0
      ? Math.round(stepModels.reduce((sum, m) => sum + m.avgLatencyMs, 0) / stepModels.length)
      : health.avgLatencyMs
    const successRate = stepAgents.length > 0
      ? stepAgents.reduce((sum, a) => sum + a.successRate, 0) / stepAgents.length
      : 1 - health.errorRate
    const status = successRate < 0.86 || avgLatencyMs > 520
      ? 'critical'
      : successRate < 0.9 || avgLatencyMs > 380
        ? 'warning'
        : 'normal'
    return {
      key,
      step: STEP_MAIN_CHAIN_MAP[key] || key,
      calls,
      callShare: calls / totalCalls,
      modelCount: stepModels.length,
      enabledModelCount: stepModels.filter(m => m.enabled).length,
      agentCount: stepAgents.length,
      enabledAgentCount: stepAgents.filter(a => a.enabled).length,
      avgLatencyMs,
      successRate,
      status,
    }
  })

  const countBy = <T,>(items: T[], getKey: (item: T) => string) => {
    const result = new Map<string, number>()
    items.forEach(item => {
      const key = getKey(item)
      result.set(key, (result.get(key) || 0) + 1)
    })
    return Array.from(result.entries()).map(([name, value]) => ({ name, value }))
  }

  return {
    healthScore,
    enabledModels,
    enabledAgents,
    failureAudits,
    reviewAudits,
    publishedKnowledgeItems: knowledgeItems.filter(k => k.status === 'published').length,
    metricSnapshots: metrics.length,
    capabilityNodes,
    providerDistribution: countBy(models, m => m.provider),
    auditDistribution: countBy(audits, a => a.result),
    agentDistribution: countBy(agents, a => a.type),
  }
}

// ── Product cross-references (for ProductAssetDetailPage) ──

export interface ProductCrossReferences {
  leads: Lead[]
  solutions: Array<{ id: string; leadId: string; score: number }>
  outcomes: Outcome[]
  knowledgeItems: KnowledgeItem[]
}

/**
 * 获取商品的所有跨对象关联。
 * 每个关联都来自显式 relationship 字段，不做弱匹配。
 */
export function getProductCrossReferences(
  productId: string,
  leads: Lead[],
  solutions: Array<{ id: string; leadId: string; score: number }>,
  outcomes: Outcome[],
  knowledgeItems: KnowledgeItem[],
): ProductCrossReferences {
  return {
    leads: leads.filter(l => l.relatedProductIds.includes(productId)),
    solutions, // already filtered by caller
    outcomes: outcomes.filter(o => o.relatedProductIds.includes(productId)),
    knowledgeItems: knowledgeItems.filter(k => k.relatedProductIds.includes(productId)),
  }
}
