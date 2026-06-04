// ── API Adapter Interface ──
// 定义所有领域对象的 API 接口类型。
// 当对接真实后端时，只需实现这些接口，无需修改任何业务代码。

import type {
  Conversation, InquiryDraft, Lead, ProductAsset,
  SolutionRecommendation, ReplyDraft, QuotationDraft,
  Outcome, KnowledgeItem, MetricSnapshot,
} from '../../contracts'

// ── Generic CRUD ──

export interface ReadAdapter<T> {
  list: () => Promise<T[]>
  getById: (id: string) => Promise<T | undefined>
}

// ── Domain-specific adapters ──

export interface ConversationApiAdapter extends ReadAdapter<Conversation> {
  create: (data: Omit<Conversation, 'id' | 'status' | 'createdAt'>) => Promise<Conversation>
  updateStatus: (id: string, status: Conversation['status']) => Promise<Conversation>
}

export interface InquiryDraftApiAdapter extends ReadAdapter<InquiryDraft> {
  getByConversationId: (conversationId: string) => Promise<InquiryDraft | undefined>
  create: (data: Omit<InquiryDraft, 'id' | 'createdAt' | 'updatedAt'>) => Promise<InquiryDraft>
  confirm: (id: string) => Promise<InquiryDraft>
  reject: (id: string, reason: string) => Promise<InquiryDraft>
  update: (id: string, data: Partial<InquiryDraft>) => Promise<InquiryDraft>
}

export interface LeadApiAdapter extends ReadAdapter<Lead> {
  create: (draft: InquiryDraft, conversation: Conversation) => Promise<Lead>
  transition: (id: string, newStatus: Lead['status']) => Promise<Lead>
  update: (id: string, data: Partial<Lead>) => Promise<Lead>
}

export interface ProductAssetApiAdapter extends ReadAdapter<ProductAsset> {
  search: (query: string) => Promise<ProductAsset[]>
  getByCategory: (category: string) => Promise<ProductAsset[]>
}

export interface SolutionRecommendationApiAdapter {
  getByLeadId: (leadId: string) => Promise<SolutionRecommendation | undefined>
  generate: (leadId: string, productIds: string[]) => Promise<SolutionRecommendation>
  review: (id: string, decision: 'accepted' | 'rejected', notes?: string) => Promise<SolutionRecommendation>
}

export interface ReplyDraftApiAdapter {
  getByLeadId: (leadId: string) => Promise<ReplyDraft[]>
  generate: (leadId: string, conversationId: string) => Promise<ReplyDraft>
  update: (id: string, data: Partial<ReplyDraft>) => Promise<ReplyDraft>
  approve: (id: string) => Promise<ReplyDraft>
}

export interface QuotationDraftApiAdapter {
  getByLeadId: (leadId: string) => Promise<QuotationDraft[]>
  generate: (leadId: string) => Promise<QuotationDraft>
  update: (id: string, data: Partial<QuotationDraft>) => Promise<QuotationDraft>
  approve: (id: string) => Promise<QuotationDraft>
}

export interface OutcomeApiAdapter {
  getByLeadId: (leadId: string) => Promise<Outcome | undefined>
  create: (data: Omit<Outcome, 'id' | 'createdAt'>) => Promise<Outcome>
  triggerLoopback: (outcomeId: string) => Promise<void>
}

export interface KnowledgeItemApiAdapter extends ReadAdapter<KnowledgeItem> {
  getByOutcomeId: (outcomeId: string) => Promise<KnowledgeItem[]>
}

export interface MetricSnapshotApiAdapter {
  history: (days?: number) => Promise<MetricSnapshot[]>
  latest: () => Promise<MetricSnapshot>
}
