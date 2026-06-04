import type { Outcome } from '../../contracts'

export function generateOutcomes(): Outcome[] {
  return [
    {
      id: 'outcome-001',
      leadId: 'lead-001',
      resultType: 'won',
      reasonCode: 'price_competitive',
      reasonDetail: '客户最终接受了95折批量优惠价，AI推荐的捆绑编程电缆也被采纳。整体方案满足客户预算和交期要求。',
      finalAmount: 139739,
      customerFeedbackSummary: '客户对回复速度（<15分钟）和专业度表示满意，特别提到AI推荐的替代方案对比帮助他们快速决策。',
      aiContributionTags: ['intent_parsing', 'product_matching', 'reply_generation', 'quotation_generation'],
      manualOverrideNotes: '销售手动将最终折扣从95折调整为93折（经经理特批），其余采纳AI建议。',
      closedAt: '2025-01-16T16:00:00',
      loopbackStatus: 'pending',
      relatedProductIds: ['prod-001'],
      createdAt: '2025-01-16T16:00:00',
    },
    {
      id: 'outcome-002',
      leadId: 'lead-003',
      resultType: 'lost',
      reasonCode: 'competitor_price',
      reasonDetail: '客户最终选择了国产品牌替代方案（H3U-64MT），价格低约40%。我方FX3U虽然品质更优但客户预算有限。',
      finalAmount: null,
      customerFeedbackSummary: '客户认可我们的专业度，但表示目前项目预算紧张，未来如有高端需求会再联系。',
      aiContributionTags: ['intent_parsing', 'product_matching', 'reply_generation'],
      manualOverrideNotes: null,
      closedAt: '2025-01-14T11:00:00',
      loopbackStatus: 'processed',
      relatedProductIds: ['prod-001'],
      createdAt: '2025-01-14T11:00:00',
    },
  ]
}

export function getOutcomeById(id: string): Outcome | undefined {
  return generateOutcomes().find(o => o.id === id)
}

export function getOutcomeByLeadId(leadId: string): Outcome | undefined {
  return generateOutcomes().find(o => o.leadId === leadId)
}
