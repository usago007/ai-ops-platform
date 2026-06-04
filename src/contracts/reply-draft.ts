import type { ReplyScenario, Tone } from './shared'

// ── ReplyDraftStatus ──
export type ReplyDraftStatus = 'generated' | 'edited' | 'approved' | 'sent'

// ── ReplyDraft ──
/**
 * AI 生成的客服回复草稿。
 * 回复草稿永远不是最终发送记录，需明确 AI 生成 → 人类修改 → 最终发送三层。
 */
export interface ReplyDraft {
  id: string
  leadId: string
  conversationId: string
  replyScenario: ReplyScenario
  /** AI 生成草稿内容 */
  draftContent: string
  /** 最终发送内容（人工编辑后） */
  finalContent: string | null
  tone: Tone
  /** 基于哪个方案推荐 */
  basedOnRecommendations: string[]
  /** 风险警告 */
  riskWarnings: string[]
  /** 是否允许编辑 */
  editable: boolean
  /** 批准人 */
  approvedBy: string | null
  /** 编辑历史 */
  editHistory: Array<{
    editedBy: string
    editedAt: string
    changeDescription: string
  }>
  status: ReplyDraftStatus
  createdAt: string
  updatedAt: string
}
