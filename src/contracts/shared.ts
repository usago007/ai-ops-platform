// ── Shared enums & base types used across all domain objects ──

/** 沟通渠道 */
export type Channel = 'wechat' | 'email' | 'form' | 'im' | 'phone_summary'

/** AI 解析引擎 */
export type ParseEngine = 'rule' | 'llm' | 'hybrid'

/** 置信度等级 */
export type ConfidenceLevel = 'high' | 'medium' | 'low'

/** 优先级 */
export type PriorityLevel = 'high' | 'medium' | 'low'

/** 风险等级 */
export type RiskLevel = 'high' | 'medium' | 'low'

/** 询价意图类型 */
export type IntentType =
  | 'inquiry'
  | 'technical_consult'
  | 'price_check'
  | 'complaint'
  | 'aftersales'

/** 支付条款 */
export type PaymentTerms = 'advance' | 'cod' | 'net30' | 'net60' | 'net90' | 'l/c' | 'tt'

/** 回复场景 */
export type ReplyScenario =
  | 'initial_response'
  | 'price_quote'
  | 'technical_answer'
  | 'follow_up'
  | 'complaint_handling'
  | 'negotiation'

/** 回复语气 */
export type Tone = 'professional' | 'friendly' | 'formal' | 'concise'

/** 结果类型 */
export type ResultType = 'won' | 'lost' | 'continue_followup' | 'invalid' | 'transferred'

/** 知识条目类型 */
export type KnowledgeItemType =
  | 'faq'
  | 'pricing_strategy'
  | 'loss_analysis'
  | 'product_note'
  | 'reply_pattern'

/** 商品属性状态（AI 提取 vs 人工确认） */
export type AttributeStatus = 'confirmed' | 'pending' | 'suggested'

/** 商品属性来源 */
export type AttributeSource = 'text' | 'ai' | 'ocr' | 'manual' | 'erp'

/** 单个商品属性 */
export interface ProductAttribute {
  name: string
  value: string
  confidence: number
  status: AttributeStatus
  source: AttributeSource
}

/** 产品规格项 */
export interface SpecItem {
  key: string
  label: string
  value: string
  unit?: string
}

/** FAQ 条目 */
export interface FaqItem {
  question: string
  answer: string
  tags: string[]
}

/** 内容资产 */
export interface ContentAsset {
  type: 'image' | 'video' | 'document' | 'link'
  url: string
  title: string
  description?: string
}

/** 风险标记 */
export interface RiskFlag {
  type: string
  severity: RiskLevel
  description: string
  suggestion?: string
}

/** AI 贡献标签 */
export type AIContributionTag =
  | 'intent_parsing'
  | 'product_matching'
  | 'reply_generation'
  | 'quotation_generation'
  | 'risk_detection'
  | 'knowledge_extraction'
  | 'metric_aggregation'
