import type { IntentType, ParseEngine, RiskFlag } from './shared'

// ── InquiryDraftStatus ──
export type InquiryDraftStatus = 'draft' | 'pending_review' | 'confirmed' | 'rejected'

// ── InquiryDraft ──
/**
 * AI 对原始需求的第一次结构化理解，仍然是草稿，不是正式业务单。
 * 人工确认前不能直接进入报价流程。
 */
export interface InquiryDraft {
  id: string
  conversationId: string
  intentType: IntentType
  /** AI 提取的商品关键词 */
  productKeywords: string[]
  /** 候选商品 ID 列表 */
  candidateProducts: string[]
  /** AI 识别到的型号 */
  modelNumbers: string[]
  quantity: number | null
  unit: string | null
  deliveryRequirement: string | null
  region: string | null
  budgetRange: string | null
  paymentTerms: string | null
  /** 风险标记列表 */
  riskFlags: RiskFlag[]
  /** AI 标记的缺失字段 */
  missingFields: string[]
  /** 整体置信度 0-1 */
  confidenceScore: number
  /** 解析链路追踪 ID */
  parseTraceId: string
  /** 解析引擎 */
  parseEngine: ParseEngine
  status: InquiryDraftStatus
  /** 人工修正记录 */
  manualCorrections: string[]
  /** 审核人 */
  reviewedBy: string | null
  createdAt: string
  updatedAt: string
}
