/**
 * AuditEntry generator — 100-200 audit entries across all entities.
 */
import type { SeededRng } from './seeded-random'
import type { AuditEntry } from '../../../contracts'
import type { Lead } from '../../../contracts'
import type { Conversation } from '../../../contracts'
import type { InquiryDraft } from '../../../contracts'
import type { SolutionRecommendation } from '../../../contracts'
import type { ReplyDraft } from '../../../contracts'
import type { QuotationDraft } from '../../../contracts'
import type { Outcome } from '../../../contracts'

export function generateAuditEntries(
  rng: SeededRng,
  conversations: Conversation[],
  inquiryDrafts: InquiryDraft[],
  leads: Lead[],
  solutions: SolutionRecommendation[],
  replies: ReplyDraft[],
  quotations: QuotationDraft[],
  outcomes: Outcome[],
): AuditEntry[] {
  const entries: AuditEntry[] = []
  let entryIdx = 0

  function addEntry(action: AuditEntry['action'], targetType: AuditEntry['targetType'], targetId: string, leadId: string | undefined) {
    entryIdx++
    entries.push({
      id: `audit-${String(entryIdx).padStart(3, '0')}`,
      action,
      targetType,
      targetId,
      actor: rng.weighted([['ai', 65], ['human', 35]]),
      result: rng.weighted([['success', 75], ['failure', 10], ['review_required', 15]]),
      detail: `${action} on ${targetType} ${targetId}`,
      timestamp: new Date(2025, 0, rng.nextInt(1, 150), rng.nextInt(0, 23), rng.nextInt(0, 59)).toISOString(),
      leadId,
    })
  }

  // Per conversation: parse
  for (const conv of conversations.slice(0, 80)) {
    addEntry('parse', 'Conversation', conv.id, undefined)
  }

  // Per inquiry draft: parse, review
  for (const draft of inquiryDrafts.slice(0, 80)) {
    addEntry('parse', 'InquiryDraft', draft.id, undefined)
    if (draft.status === 'confirmed' || draft.status === 'rejected') {
      addEntry('review', 'InquiryDraft', draft.id, undefined)
    }
  }

  // Per lead: transitions
  for (const lead of leads) {
    if (lead.status !== 'new') {
      addEntry('transition', 'Lead', lead.id, lead.id)
    }
    if (lead.manualReviewRequired) {
      addEntry('review', 'Lead', lead.id, lead.id)
    }
  }

  // Per solution: recommend, review
  for (const sol of solutions) {
    addEntry('recommend', 'SolutionRecommendation', sol.id, sol.leadId)
    if (sol.status === 'reviewed' || sol.status === 'accepted') {
      addEntry('review', 'SolutionRecommendation', sol.id, sol.leadId)
    }
  }

  // Per reply: generate
  for (const reply of replies.slice(0, 60)) {
    addEntry('reply_generate', 'ReplyDraft', reply.id, reply.leadId)
  }

  // Per quotation: generate
  for (const quot of quotations.slice(0, 40)) {
    addEntry('quotation_generate', 'QuotationDraft', quot.id, quot.leadId)
  }

  // Per outcome: create
  for (const outcome of outcomes) {
    addEntry('outcome_create', 'Outcome', outcome.id, outcome.leadId)
  }

  return entries
}
