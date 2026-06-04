import type { AuditEntry } from '../../../contracts/audit-entry'

export function generateAuditEntries(): AuditEntry[] {
  return [
    {
      id: 'audit-001', action: 'parse', targetType: 'Conversation', targetId: 'conv-001',
      actor: 'ai', result: 'success', detail: 'AI 完成需求理解，置信度 0.87',
      timestamp: '2025-03-15T10:30:00', leadId: 'lead-001',
    },
    {
      id: 'audit-002', action: 'recommend', targetType: 'SolutionRecommendation', targetId: 'sol-001',
      actor: 'ai', result: 'success', detail: '方案推荐生成，匹配 2 个商品',
      timestamp: '2025-03-15T10:31:00', leadId: 'lead-001',
    },
    {
      id: 'audit-003', action: 'review', targetType: 'SolutionRecommendation', targetId: 'sol-001',
      actor: 'human', result: 'success', detail: '人工审核通过方案推荐',
      timestamp: '2025-03-15T10:35:00', leadId: 'lead-001',
    },
    {
      id: 'audit-004', action: 'reply_generate', targetType: 'ReplyDraft', targetId: 'reply-001',
      actor: 'ai', result: 'success', detail: 'AI 生成初次回复草稿',
      timestamp: '2025-03-15T10:36:00', leadId: 'lead-001',
    },
    {
      id: 'audit-005', action: 'transition', targetType: 'Lead', targetId: 'lead-001',
      actor: 'human', result: 'success', detail: '线索状态 new → sent',
      timestamp: '2025-03-15T10:40:00', leadId: 'lead-001',
    },
    {
      id: 'audit-006', action: 'outcome_create', targetType: 'Outcome', targetId: 'outcome-001',
      actor: 'ai', result: 'success', detail: '结果记录创建，触发回流',
      timestamp: '2025-03-16T16:00:00', leadId: 'lead-001',
    },
  ]
}
