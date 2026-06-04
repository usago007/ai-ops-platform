import type { PaymentTerms, RiskFlag } from './shared'

// ── QuotationDraftStatus ──
export type QuotationDraftStatus = 'generated' | 'edited' | 'approved' | 'sent'

// ── QuotationProduct ──
export interface QuotationProduct {
  productId: string
  productName: string
  sku: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
  notes?: string
}

// ── QuotationDraft ──
/**
 * AI 生成的报价建议或报价草稿。
 * 报价必须是正式业务对象，不应只是一段文案。
 */
export interface QuotationDraft {
  id: string
  leadId: string
  /** 报价行项目 */
  products: QuotationProduct[]
  /** 费用明细 */
  priceItems: Array<{
    label: string
    amount: number
    type: 'product' | 'shipping' | 'tax' | 'discount' | 'other'
  }>
  /** 总金额 */
  totalAmount: number
  /** 币种 */
  currency: string
  /** 交期 */
  deliveryTerms: string
  /** 支付条款 */
  paymentTerms: PaymentTerms
  /** 报价有效期 */
  validUntil: string
  /** 报价备注 */
  quotationNotes: string
  /** 风险警告 */
  riskAlerts: RiskFlag[]
  /** 参考案例 */
  referenceCases: Array<{
    caseId: string
    title: string
    relevance: string
  }>
  /** 批准人 */
  approvedBy: string | null
  /** 编辑历史 */
  editHistory: Array<{
    editedBy: string
    editedAt: string
    changeDescription: string
  }>
  status: QuotationDraftStatus
  createdAt: string
  updatedAt: string
}
