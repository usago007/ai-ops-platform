import type { ResultType, AIContributionTag } from './shared'

// ── Outcome ──
/**
 * 业务结果与回流起点。
 * 没有 Outcome，就没有真实 ROI。所有复盘、归因、知识沉淀从这里开始。
 */
export interface Outcome {
  id: string
  leadId: string
  resultType: ResultType
  /** 原因编码 */
  reasonCode: string
  /** 原因详情 */
  reasonDetail: string
  /** 最终成交金额 */
  finalAmount: number | null
  /** 客户反馈摘要 */
  customerFeedbackSummary: string | null
  /** AI 贡献标签 */
  aiContributionTags: AIContributionTag[]
  /** 人工覆盖备注 */
  manualOverrideNotes: string | null
  /** 结单时间 */
  closedAt: string
  /** 回流处理状态 */
  loopbackStatus: 'pending' | 'processed'
  /** 关联商品 ID（来自方案的推荐商品） */
  relatedProductIds: string[]
  createdAt: string
}
