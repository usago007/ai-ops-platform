import type { ConversationStatus } from './conversation'
import type { InquiryDraftStatus } from './inquiry-draft'
import type { LeadStatus } from './lead'
import type { SolutionRecommendationStatus } from './solution-recommendation'
import type { ReplyDraftStatus } from './reply-draft'
import type { QuotationDraftStatus } from './quotation-draft'

// ── 状态转移定义 ──

/** 主状态转移映射：from → allowed to[] */
export const STATE_TRANSITIONS: Record<string, string[]> = {
  // Conversation
  'conversation:new': ['conversation:parsing'],
  'conversation:parsing': ['conversation:active'],
  'conversation:active': ['conversation:archived'],
  'conversation:archived': [],

  // InquiryDraft
  'inquiry-draft:draft': ['inquiry-draft:pending_review'],
  'inquiry-draft:pending_review': ['inquiry-draft:confirmed', 'inquiry-draft:rejected'],
  'inquiry-draft:confirmed': [],
  'inquiry-draft:rejected': ['inquiry-draft:draft'],

  // Lead
  'lead:new': ['lead:qualified'],
  'lead:qualified': ['lead:recommending'],
  'lead:recommending': ['lead:draft_ready'],
  'lead:draft_ready': ['lead:sent'],
  'lead:sent': ['lead:following_up'],
  'lead:following_up': ['lead:won', 'lead:lost'],
  'lead:won': ['lead:closed_looped'],
  'lead:lost': ['lead:closed_looped'],
  'lead:closed_looped': [],

  // SolutionRecommendation
  'solution:generated': ['solution:reviewed'],
  'solution:reviewed': ['solution:accepted', 'solution:rejected'],
  'solution:accepted': [],
  'solution:rejected': ['solution:generated'],

  // ReplyDraft
  'reply:generated': ['reply:edited'],
  'reply:edited': ['reply:approved'],
  'reply:approved': ['reply:sent'],
  'reply:sent': [],

  // QuotationDraft
  'quotation:generated': ['quotation:edited'],
  'quotation:edited': ['quotation:approved'],
  'quotation:approved': ['quotation:sent'],
  'quotation:sent': [],
}

// ── 转移守卫 ──

/** 转移守卫：在特定转移发生前必须满足的条件 */
export interface TransitionGuard {
  /** 转移标识 from → to */
  transition: string
  /** 条件描述 */
  description: string
  /** 条件检查函数 */
  check: () => boolean
}

// ── 转移事件类型 ──

export type ConversationTransition = 'parse' | 'activate' | 'archive'
export type InquiryDraftTransition = 'submit_review' | 'confirm' | 'reject' | 'revise'
export type LeadTransition =
  | 'qualify'
  | 'start_recommendation'
  | 'drafts_ready'
  | 'send'
  | 'start_followup'
  | 'mark_won'
  | 'mark_lost'
  | 'close_loop'
export type SolutionTransition = 'review' | 'accept' | 'reject' | 'regenerate'
export type ReplyTransition = 'edit' | 'approve' | 'send'
export type QuotationTransition = 'edit' | 'approve' | 'send'

// ── 转移事件 → 状态映射 ──

export const CONVERSATION_TRANSITION_MAP: Record<ConversationTransition, ConversationStatus> = {
  parse: 'parsing',
  activate: 'active',
  archive: 'archived',
}

export const INQUIRY_DRAFT_TRANSITION_MAP: Record<InquiryDraftTransition, InquiryDraftStatus> = {
  submit_review: 'pending_review',
  confirm: 'confirmed',
  reject: 'rejected',
  revise: 'draft',
}

export const LEAD_TRANSITION_MAP: Record<LeadTransition, LeadStatus> = {
  qualify: 'qualified',
  start_recommendation: 'recommending',
  drafts_ready: 'draft_ready',
  send: 'sent',
  start_followup: 'following_up',
  mark_won: 'won',
  mark_lost: 'lost',
  close_loop: 'closed_looped',
}

export const SOLUTION_TRANSITION_MAP: Record<SolutionTransition, SolutionRecommendationStatus> = {
  review: 'reviewed',
  accept: 'accepted',
  reject: 'rejected',
  regenerate: 'generated',
}

export const REPLY_TRANSITION_MAP: Record<ReplyTransition, ReplyDraftStatus> = {
  edit: 'edited',
  approve: 'approved',
  send: 'sent',
}

export const QUOTATION_TRANSITION_MAP: Record<QuotationTransition, QuotationDraftStatus> = {
  edit: 'edited',
  approve: 'approved',
  send: 'sent',
}
