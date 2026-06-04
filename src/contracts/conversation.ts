import type { Channel } from './shared'

// ── ConversationStatus ──
export type ConversationStatus = 'new' | 'parsing' | 'active' | 'archived'

// ── RawMessage ──
export interface RawMessage {
  id: string
  role: 'customer' | 'agent' | 'system'
  content: string
  timestamp: string
  /** 可选意图标签（原始标注，非 AI 解析） */
  intent?: string
}

// ── Attachment ──
export interface Attachment {
  id: string
  fileName: string
  fileType: string
  url: string
  sizeBytes?: number
}

// ── Conversation ──
/**
 * 客户原始接触记录，系统入口真相源。
 * AI 不允许直接覆盖原始消息，所有理解必须基于 Conversation 生成派生对象。
 */
export interface Conversation {
  id: string
  channel: Channel
  customerName: string
  companyName: string
  contactInfo: string
  /** 原始消息数组（不可被 AI 覆盖） */
  rawMessages: RawMessage[]
  attachments: Attachment[]
  receivedAt: string
  ownerUserId: string
  status: ConversationStatus
  /** AI 识别的最新意图摘要 */
  latestIntent: string | null
  /** 关联的 Lead ID（解析确认后回填） */
  linkedLeadId: string | null
  /** 关联的 InquiryDraft ID */
  linkedDraftId: string | null
}
