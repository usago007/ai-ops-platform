// ── SolutionRecommendationStatus ──
export type SolutionRecommendationStatus = 'generated' | 'reviewed' | 'accepted' | 'rejected'

// ── RecommendedProduct ──
export interface RecommendedProduct {
  productId: string
  productName: string
  sku: string
  /** 推荐理由 */
  reason: string
  /** 匹配分数 0-100 */
  matchScore: number
  /** 是否为 AI 主推方案 */
  isPrimary: boolean
}

// ── MatchedCase ──
export interface MatchedCase {
  caseId: string
  title: string
  similarity: number
  outcome: 'won' | 'lost'
  amount: number | null
}

// ── SolutionRecommendation ──
/**
 * AI 基于商品库、案例、规则、知识库给出的方案建议。
 * 必须保留"为什么推荐"的摘要，便于人工判断。
 */
export interface SolutionRecommendation {
  id: string
  leadId: string
  /** 主推商品列表 */
  recommendedProducts: RecommendedProduct[]
  /** 替代方案 */
  alternativeOptions: Array<{
    title: string
    products: RecommendedProduct[]
    tradeoff: string
  }>
  /** 匹配的历史案例 */
  matchedCases: MatchedCase[]
  /** 匹配的 FAQ */
  matchedFaqs: FaqMatch[]
  /** 价格参考 */
  pricingReference: {
    minPrice: number
    maxPrice: number
    avgPrice: number
    currency: string
  } | null
  /** 交期参考 */
  deliveryReference: string | null
  /** 推荐理由摘要 */
  reasoningSummary: string
  /** 整体置信度 0-1 */
  confidenceScore: number
  /** 是否需要人工复核 */
  humanReviewRequired: boolean
  status: SolutionRecommendationStatus
  /** 审核人 */
  reviewedBy: string | null
  /** 审核备注 */
  reviewNotes: string | null
  createdAt: string
  updatedAt: string
}

// ── FaqMatch ──
export interface FaqMatch {
  question: string
  answer: string
  relevanceScore: number
}
