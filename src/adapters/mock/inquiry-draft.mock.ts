import type { InquiryDraft } from '../../contracts'

export function generateInquiryDrafts(): InquiryDraft[] {
  return [
    {
      id: 'draft-001',
      conversationId: 'conv-001',
      intentType: 'inquiry',
      productKeywords: ['PLC控制器', 'FX3U', '三菱', '64点'],
      candidateProducts: ['prod-001'],
      modelNumbers: ['FX3U-64MT'],
      quantity: 50,
      unit: '台',
      deliveryRequirement: '尽快，未明确',
      region: '苏州',
      budgetRange: null,
      paymentTerms: null,
      riskFlags: [
        { type: 'missing_payment_terms', severity: 'medium', description: '未提及支付方式，报价时需确认', suggestion: '建议在报价中列出月结和现结两种方案' },
      ],
      missingFields: ['paymentTerms', 'targetPrice', 'deliveryDeadline'],
      confidenceScore: 0.82,
      parseTraceId: 'trace-20250115-001',
      parseEngine: 'hybrid',
      status: 'confirmed',
      manualCorrections: ['补充了区域信息：苏州'],
      reviewedBy: 'user-1',
      createdAt: '2025-01-15T10:30:05',
      updatedAt: '2025-01-15T10:35:00',
    },
    {
      id: 'draft-002',
      conversationId: 'conv-002',
      intentType: 'inquiry',
      productKeywords: ['温度传感器', 'PT100', '欧姆龙', '200个'],
      candidateProducts: ['prod-002'],
      modelNumbers: ['PT100'],
      quantity: 200,
      unit: '个',
      deliveryRequirement: '发上海仓库',
      region: '上海',
      budgetRange: null,
      paymentTerms: '含税',
      riskFlags: [],
      missingFields: ['targetPrice'],
      confidenceScore: 0.91,
      parseTraceId: 'trace-20250115-002',
      parseEngine: 'rule',
      status: 'pending_review',
      manualCorrections: [],
      reviewedBy: null,
      createdAt: '2025-01-15T09:15:03',
      updatedAt: '2025-01-15T09:15:03',
    },
    {
      id: 'draft-003',
      conversationId: 'conv-003',
      intentType: 'inquiry',
      productKeywords: ['变频器', 'ACS580', 'ABB', '恒压供水'],
      candidateProducts: ['prod-003'],
      modelNumbers: ['ACS580-01-062A-4'],
      quantity: 3,
      unit: '台',
      deliveryRequirement: null,
      region: '杭州',
      budgetRange: null,
      paymentTerms: null,
      riskFlags: [
        { type: 'specific_comm_module', severity: 'low', description: '需要带Profibus通讯模块的特殊版本，库存可能有限', suggestion: '确认库存后再报价' },
      ],
      missingFields: ['deliveryRequirement', 'paymentTerms'],
      confidenceScore: 0.76,
      parseTraceId: 'trace-20250115-003',
      parseEngine: 'llm',
      status: 'draft',
      manualCorrections: [],
      reviewedBy: null,
      createdAt: '2025-01-15T11:00:02',
      updatedAt: '2025-01-15T11:00:02',
    },
  ]
}

export function getInquiryDraftById(id: string): InquiryDraft | undefined {
  return generateInquiryDrafts().find(d => d.id === id)
}

export function getInquiryDraftByConversationId(conversationId: string): InquiryDraft | undefined {
  return generateInquiryDrafts().find(d => d.conversationId === conversationId)
}
