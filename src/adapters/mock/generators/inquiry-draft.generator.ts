/**
 * InquiryDraft generator — 120 inquiry drafts linked to conversations.
 */
import type { SeededRng } from './seeded-random'
import type { InquiryDraft } from '../../../contracts'
import type { Conversation } from '../../../contracts'

export function generateInquiryDrafts(rng: SeededRng, conversations: Conversation[]): InquiryDraft[] {
  const drafts: InquiryDraft[] = []

  // Each conversation gets one inquiry draft
  for (let i = 0; i < conversations.length; i++) {
    const id = `draft-${String(i + 1).padStart(3, '0')}`
    const conv = conversations[i]

    const intentWeights: Array<[InquiryDraft['intentType'], number]> = [
      ['inquiry', 35], ['technical_consult', 25], ['price_check', 20], ['complaint', 10], ['aftersales', 10],
    ]

    const productKeywords = rng.shuffle([
      'PLC', '变频器', '伺服', '传感器', '触摸屏', '交换机', '温控',
      '控制器', '驱动器', '电机', '模块', '电源',
    ]).slice(0, rng.nextInt(1, 4))

    const candidateProducts = rng.shuffle(
      Array.from({ length: 60 }, (_, idx) => `prod-${String(idx + 1).padStart(3, '0')}`)
    ).slice(0, rng.nextInt(1, 4))

    const confidence = Math.round(rng.nextFloat(0.55, 0.98) * 100) / 100

    const riskFlags = confidence < 0.7
      ? [{ type: '低置信度', severity: 'medium' as const, description: 'AI解析置信度低于阈值，建议人工确认', suggestion: '请人工审核产品匹配和意图分类' }]
      : []

    const statusWeights: Array<[InquiryDraft['status'], number]> = [
      ['confirmed', 50], ['pending_review', 30], ['draft', 15], ['rejected', 5],
    ]

    drafts.push({
      id,
      conversationId: conv.id,
      intentType: rng.weighted(intentWeights),
      productKeywords,
      candidateProducts,
      modelNumbers: rng.next() > 0.4 ? rng.shuffle(['FX3U', 'FX5U', 'S7-1200', 'ACS580', 'PT100', 'MR-J4', 'SGD7S']).slice(0, rng.nextInt(1, 3)) : [],
      quantity: rng.next() > 0.3 ? rng.nextInt(1, 100) : null,
      unit: rng.next() > 0.3 ? rng.pick(['台', '套', '个', '米', '卷']) : null,
      deliveryRequirement: rng.next() > 0.4 ? rng.pick(['2周内', '1个月内', '3个月内', '紧急（3天）', '分批交货']) : null,
      region: rng.pick(['华南', '华东', '华北', '华中', '西南', '西北', '东北']),
      budgetRange: rng.next() > 0.3 ? rng.pick(['1-5万', '5-20万', '20-50万', '50-100万', '100万以上']) : null,
      paymentTerms: rng.next() > 0.5 ? rng.pick(['net30', 'net60', 'advance', 'cod']) : null,
      riskFlags,
      missingFields: confidence < 0.8
        ? rng.shuffle(['quantity', 'budgetRange', 'deliveryRequirement', 'paymentTerms']).slice(0, rng.nextInt(0, 2))
        : [],
      confidenceScore: confidence,
      parseTraceId: `trace-${id}`,
      parseEngine: rng.weighted([['hybrid' as const, 50], ['llm' as const, 35], ['rule' as const, 15]]),
      status: rng.weighted(statusWeights),
      manualCorrections: [],
      reviewedBy: rng.next() > 0.4 ? rng.pick(['user-001', 'user-002', 'user-003']) : null,
      createdAt: new Date(2025, 0, rng.nextInt(1, 150)).toISOString(),
      updatedAt: new Date(2025, 0, rng.nextInt(1, 150)).toISOString(),
    })
  }

  return drafts
}
