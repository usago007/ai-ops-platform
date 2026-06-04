import type { Lead } from '../../contracts'

export function generateLeads(): Lead[] {
  return [
    {
      id: 'lead-001',
      sourceConversationId: 'conv-001',
      sourceDraftId: 'draft-001',
      customerId: null,
      companyName: '苏州智汇自动化有限公司',
      leadSummary: '客户张工通过IM渠道询价三菱FX3U-64MT PLC控制器，需求数量50台，期望尽快交付。已通过AI解析确认需求核心信息，置信度82%。',
      leadType: 'inquiry',
      priorityLevel: 'high',
      businessValueScore: 72,
      riskLevel: 'medium',
      assignedTo: 'user-1',
      status: 'recommending',
      lastActionAt: '2025-01-15T10:45:00',
      nextAction: '审核AI方案推荐并生成报价',
      tags: ['PLC', '三菱', '批量采购', '急单'],
      relatedProductIds: ['prod-001'],
      selectedSolutionId: 'sol-001',
      selectedReplyDraftId: null,
      selectedQuotationDraftId: null,
      outcomeId: null,
      manualReviewRequired: false,
      followUpCount: 0,
      latestCustomerResponse: null,
      createdAt: '2025-01-15T10:35:00',
      updatedAt: '2025-01-15T10:45:00',
    },
    {
      id: 'lead-002',
      sourceConversationId: 'conv-002',
      sourceDraftId: 'draft-002',
      customerId: null,
      companyName: '深圳鹏飞传感器科技有限公司',
      leadSummary: '客户李经理通过邮件询价欧姆龙PT100温度传感器200个，发上海仓库，要求含税报价。AI解析置信度91%。',
      leadType: 'inquiry',
      priorityLevel: 'medium',
      businessValueScore: 65,
      riskLevel: 'low',
      assignedTo: 'user-1',
      status: 'new',
      lastActionAt: null,
      nextAction: '确认AI理解草稿并创建线索',
      tags: ['传感器', '欧姆龙', '批量'],
      relatedProductIds: ['prod-002'],
      selectedSolutionId: null,
      selectedReplyDraftId: null,
      selectedQuotationDraftId: null,
      outcomeId: null,
      manualReviewRequired: false,
      followUpCount: 0,
      latestCustomerResponse: null,
      createdAt: '2025-01-15T09:20:00',
      updatedAt: '2025-01-15T09:20:00',
    },
  ]
}

export function getLeadById(id: string): Lead | undefined {
  return generateLeads().find(l => l.id === id)
}
