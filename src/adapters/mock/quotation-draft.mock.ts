import type { QuotationDraft } from '../../contracts'

export function generateQuotationDrafts(): QuotationDraft[] {
  return [
    {
      id: 'quot-001',
      leadId: 'lead-001',
      products: [
        {
          productId: 'prod-001',
          productName: 'PLC控制器 FX3U-64MT',
          sku: 'SKU-1001',
          quantity: 50,
          unit: '台',
          unitPrice: 2560,
          totalPrice: 128000,
        },
        {
          productId: 'prod-010',
          productName: '编程电缆 USB-SC09',
          sku: 'SKU-1010',
          quantity: 5,
          unit: '根',
          unitPrice: 180,
          totalPrice: 900,
          notes: '建议配套采购',
        },
      ],
      priceItems: [
        { label: '商品合计', amount: 128900, type: 'product' },
        { label: '运费', amount: 500, type: 'shipping' },
        { label: '批量折扣(95折)', amount: -6445, type: 'discount' },
        { label: '增值税(13%)', amount: 16784, type: 'tax' },
      ],
      totalAmount: 139739,
      currency: 'CNY',
      deliveryTerms: '合同签订后7-10个工作日发货，物流约2-3天送达（苏州地区）',
      paymentTerms: 'net30',
      validUntil: '2025-01-30',
      quotationNotes: '1. 报价有效期15天\n2. 批量50台可申请95折优惠\n3. 含13%增值税专用发票\n4. 原厂质保18个月',
      riskAlerts: [
        {
          type: 'price_volatility',
          severity: 'low',
          description: '进口元器件价格受汇率波动影响，有效期后需重新报价',
          suggestion: '建议客户在有效期内确认订单',
        },
      ],
      referenceCases: [
        { caseId: 'case-001', title: '某包装机械厂PLC采购', relevance: '相同型号批量采购50台' },
      ],
      approvedBy: null,
      editHistory: [],
      status: 'generated',
      createdAt: '2025-01-15T10:45:00',
      updatedAt: '2025-01-15T10:45:00',
    },
  ]
}

export function getQuotationDraftById(id: string): QuotationDraft | undefined {
  return generateQuotationDrafts().find(q => q.id === id)
}

export function getQuotationDraftsByLeadId(leadId: string): QuotationDraft[] {
  return generateQuotationDrafts().filter(q => q.leadId === leadId)
}
