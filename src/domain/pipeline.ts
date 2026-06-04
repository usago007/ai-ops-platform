/**
 * 主链路编排器 — 驱动完整的 Conversation → Outcome 闭环
 *
 * 每个 AI 介入点返回 { success, data, nextAction }，
 * 调用方据此推 UI 状态和下一步操作。
 */

import type { Conversation } from '../contracts'
import type { InquiryDraft } from '../contracts'
import type { Lead } from '../contracts'
import type { SolutionRecommendation } from '../contracts'
import type { ReplyDraft } from '../contracts'
import type { QuotationDraft } from '../contracts'
import type { Outcome } from '../contracts'
import { canTransitionConversation, canTransitionInquiryDraft, canTransitionLead } from './state-machine'

// ── Pipeline step result ──

export interface StepResult<T> {
  success: boolean
  data: T
  nextAction: string
  error?: string
}

// ── Pipeline context ──

export interface PipelineContext {
  conversation: Conversation | null
  inquiryDraft: InquiryDraft | null
  lead: Lead | null
  solutionRecommendation: SolutionRecommendation | null
  replyDraft: ReplyDraft | null
  quotationDraft: QuotationDraft | null
  outcome: Outcome | null
}

export type PipelineStage =
  | 'conversation'
  | 'inquiry_draft'
  | 'lead_creation'
  | 'solution_recommendation'
  | 'reply_generation'
  | 'quotation_generation'
  | 'outcome'
  | 'closed'

// ── Stage resolution from context ──

export function resolveCurrentStage(ctx: PipelineContext): PipelineStage {
  if (ctx.outcome) return 'outcome'
  if (ctx.quotationDraft && ctx.replyDraft) return 'quotation_generation'
  if (ctx.replyDraft) return 'reply_generation'
  if (ctx.solutionRecommendation) return 'solution_recommendation'
  if (ctx.lead) return 'lead_creation'
  if (ctx.inquiryDraft) return 'inquiry_draft'
  if (ctx.conversation) return 'conversation'
  return 'conversation'
}

// ── Stage progression checks ──

/**
 * 检查是否可以推进到下一个阶段。
 * 返回 null 表示可以推进，否则返回阻止原因。
 */
export function canAdvanceTo(ctx: PipelineContext, target: PipelineStage): string | null {
  const current = resolveCurrentStage(ctx)

  const stageOrder: PipelineStage[] = [
    'conversation',
    'inquiry_draft',
    'lead_creation',
    'solution_recommendation',
    'reply_generation',
    'quotation_generation',
    'outcome',
    'closed',
  ]

  const currentIndex = stageOrder.indexOf(current)
  const targetIndex = stageOrder.indexOf(target)

  if (targetIndex <= currentIndex) return `目标阶段 ${target} 不晚于当前阶段 ${current}`

  // Check prerequisites for each stage
  switch (target) {
    case 'inquiry_draft':
      if (!ctx.conversation) return '缺少 Conversation'
      if (ctx.conversation.status !== 'active') return 'Conversation 未处于 active 状态'
      break
    case 'lead_creation':
      if (!ctx.inquiryDraft) return '缺少 InquiryDraft'
      if (ctx.inquiryDraft.status !== 'confirmed') return 'InquiryDraft 未被确认'
      break
    case 'solution_recommendation':
      if (!ctx.lead) return '缺少 Lead'
      if (!['qualified', 'recommending'].includes(ctx.lead.status)) return 'Lead 尚未进入推荐阶段'
      break
    case 'reply_generation':
    case 'quotation_generation':
      if (!ctx.solutionRecommendation) return '缺少 SolutionRecommendation'
      if (ctx.solutionRecommendation.status !== 'accepted') return '方案推荐未被接受'
      break
    case 'outcome':
      if (!ctx.replyDraft && !ctx.quotationDraft) return '缺少 ReplyDraft 或 QuotationDraft'
      break
  }

  return null
}

// ── State advance helpers ──

export function advanceConversation(conv: Conversation, newStatus: Conversation['status']): StepResult<Conversation> {
  const result = canTransitionConversation(conv.status, newStatus)
  if (!result.allowed) {
    return { success: false, data: conv, nextAction: '', error: result.error }
  }
  return {
    success: true,
    data: { ...conv, status: newStatus },
    nextAction: `Conversation → ${newStatus}`,
  }
}

export function advanceInquiryDraft(draft: InquiryDraft, newStatus: InquiryDraft['status']): StepResult<InquiryDraft> {
  const result = canTransitionInquiryDraft(draft.status, newStatus)
  if (!result.allowed) {
    return { success: false, data: draft, nextAction: '', error: result.error }
  }
  return {
    success: true,
    data: { ...draft, status: newStatus, updatedAt: new Date().toISOString() },
    nextAction: `InquiryDraft → ${newStatus}`,
  }
}

export function advanceLead(lead: Lead, newStatus: Lead['status']): StepResult<Lead> {
  const result = canTransitionLead(lead.status, newStatus)
  if (!result.allowed) {
    return { success: false, data: lead, nextAction: '', error: result.error }
  }
  return {
    success: true,
    data: { ...lead, status: newStatus, updatedAt: new Date().toISOString() },
    nextAction: `Lead → ${newStatus}`,
  }
}
