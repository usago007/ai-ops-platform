import type { PriorityLevel, RiskLevel } from './shared'

// ── LeadStatus ──
export type LeadStatus =
  | 'new'
  | 'qualified'
  | 'recommending'
  | 'draft_ready'
  | 'sent'
  | 'following_up'
  | 'won'
  | 'lost'
  | 'closed_looped'

// ── LeadType ──
export type LeadType = 'inquiry' | 'technical_consult' | 'price_check' | 'complaint' | 'aftersales'

// ── Lead ──
/**
 * 确认后的标准业务线索，是后续流转核心对象。
 * 客服、销售、报价、跟进共享此标准对象。
 */
export interface Lead {
  id: string
  sourceConversationId: string
  sourceDraftId: string
  customerId: string | null
  companyName: string
  /** AI 生成的线索摘要 */
  leadSummary: string
  leadType: LeadType
  priorityLevel: PriorityLevel
  /** 业务价值评分 0-100 */
  businessValueScore: number
  riskLevel: RiskLevel
  assignedTo: string
  status: LeadStatus
  lastActionAt: string | null
  nextAction: string | null
  tags: string[]
  /** 关联商品 ID（来自方案推荐的匹配商品） */
  relatedProductIds: string[]
  /** 选定的方案推荐 ID */
  selectedSolutionId: string | null
  /** 选定的回复草稿 ID（通常为最终发送的回复） */
  selectedReplyDraftId: string | null
  /** 选定的报价草稿 ID */
  selectedQuotationDraftId: string | null
  /** 关联的结果记录 ID */
  outcomeId: string | null
  /** 是否需要人工复核（低置信度或高风险触发） */
  manualReviewRequired: boolean
  /** 跟进次数 */
  followUpCount: number
  /** 最近一次客户响应摘要 */
  latestCustomerResponse: string | null
  createdAt: string
  updatedAt: string
}
