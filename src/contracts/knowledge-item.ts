import type { KnowledgeItemType } from './shared'

// ── KnowledgeItemStatus ──
export type KnowledgeItemStatus = 'draft' | 'published' | 'archived'

// ── KnowledgeItem ──
/**
 * AI 从闭环结果中提取的知识回流对象。
 * 商品知识、话术、策略沉淀。
 */
export interface KnowledgeItem {
  id: string
  /** 来源 Outcome */
  sourceOutcomeId: string
  type: KnowledgeItemType
  title: string
  summary: string
  content: string
  /** 关联商品 ID */
  relatedProductIds: string[]
  /** 关联 Lead ID */
  relatedLeadIds: string[]
  /** 标签 */
  tags: string[]
  status: KnowledgeItemStatus
  /** 创建人 */
  createdBy: 'ai' | 'manual'
  createdAt: string
  updatedAt: string
}
