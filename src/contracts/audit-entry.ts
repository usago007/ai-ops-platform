/** AuditEntry — 审计记录，每条映射到主链动作 */
export interface AuditEntry {
  id: string
  /** 动作类型 */
  action: 'parse' | 'recommend' | 'reply_generate' | 'quotation_generate' | 'outcome_create' | 'transition' | 'review'
  /** 关联的主链对象 */
  targetType: 'Conversation' | 'InquiryDraft' | 'Lead' | 'SolutionRecommendation' | 'ReplyDraft' | 'QuotationDraft' | 'Outcome'
  targetId: string
  /** 操作人 (ai / human) */
  actor: string
  /** 操作结果 */
  result: 'success' | 'failure' | 'review_required'
  /** 详情 */
  detail: string
  /** 时间 */
  timestamp: string
  /** 关联的 lead ID（用于追溯整条链） */
  leadId?: string
}
