// ── MetricSnapshot ──
/**
 * 按日期聚合的经营指标快照。
 * 展示 AI 对周期、转化、人工工作量的影响。
 */
export interface MetricSnapshot {
  date: string
  /** 线索总量 */
  leadCount: number
  /** 合格率 (qualified / new) */
  qualifiedRate: number
  /** 回复采纳率 (sent replies / generated replies) */
  replyAdoptionRate: number
  /** 报价周期中位数（小时） */
  quotationCycleHours: number
  /** 成交率 (won / total) */
  winRate: number
  /** 平均成交金额 */
  avgDealAmount: number
  /** AI 自动化覆盖率 */
  automationCoverage: number
  /** 人工复核率 */
  manualReviewRate: number
  /** 高风险拦截率 */
  highRiskInterceptRate: number
  /** AI 节省工时（小时） */
  aiSavedHours: number
}
