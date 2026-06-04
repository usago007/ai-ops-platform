import {
  STATE_TRANSITIONS,
  type ConversationStatus,
  type InquiryDraftStatus,
  type LeadStatus,
  type SolutionRecommendationStatus,
  type ReplyDraftStatus,
  type QuotationDraftStatus,
} from '../contracts'

// ── State transition validation ──

export interface TransitionResult {
  allowed: boolean
  from: string
  to: string
  error?: string
}

/**
 * 校验状态转移是否合法。
 * 返回 { allowed: true } 或 { allowed: false, error: '...' }
 */
export function canTransition(
  entityType: string,
  from: string,
  to: string,
): TransitionResult {
  const key = `${entityType}:${from}`
  const allowed = STATE_TRANSITIONS[key]

  if (!allowed) {
    return { allowed: false, from, to, error: `未知源状态: ${key}` }
  }

  if (!allowed.includes(`${entityType}:${to}`)) {
    return {
      allowed: false,
      from,
      to,
      error: `不允许从 "${from}" 转移到 "${to}"。允许的目标状态: ${allowed.map(s => s.split(':')[1]).join(', ')}`,
    }
  }

  return { allowed: true, from, to }
}

// ── Convenience wrappers ──

export const canTransitionConversation = (from: ConversationStatus, to: ConversationStatus) =>
  canTransition('conversation', from, to)

export const canTransitionInquiryDraft = (from: InquiryDraftStatus, to: InquiryDraftStatus) =>
  canTransition('inquiry-draft', from, to)

export const canTransitionLead = (from: LeadStatus, to: LeadStatus) =>
  canTransition('lead', from, to)

export const canTransitionSolution = (from: SolutionRecommendationStatus, to: SolutionRecommendationStatus) =>
  canTransition('solution', from, to)

export const canTransitionReply = (from: ReplyDraftStatus, to: ReplyDraftStatus) =>
  canTransition('reply', from, to)

export const canTransitionQuotation = (from: QuotationDraftStatus, to: QuotationDraftStatus) =>
  canTransition('quotation', from, to)
