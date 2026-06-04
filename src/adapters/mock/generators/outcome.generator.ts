/**
 * Outcome generator — 40-50 outcomes for terminal leads (won/lost/closed_looped).
 */
import type { SeededRng } from './seeded-random'
import type { Outcome } from '../../../contracts'
import type { Lead } from '../../../contracts'

const WON_REASONS: Array<{ code: string; detail: string }> = [
  { code: 'PRODUCT_MATCH', detail: '产品参数与客户需求高度匹配，技术方案获得客户认可' },
  { code: 'PRICE_COMPETITIVE', detail: '报价在客户预算范围内，性价比优势明显' },
  { code: 'BRAND_TRUST', detail: '客户长期使用该品牌，信任度高，决策链路短' },
  { code: 'SERVICE_WIN', detail: '技术支持和售后服务响应快，客户体验好' },
  { code: 'QUICK_DELIVERY', detail: '交期满足客户紧急需求，比竞品快2周以上' },
  { code: 'RELATIONSHIP', detail: '老客户关系维护良好，复购意愿强' },
]

const LOST_REASONS: Array<{ code: string; detail: string }> = [
  { code: 'PRICE_TOO_HIGH', detail: '报价高于竞品15%以上，客户选择竞品低价方案' },
  { code: 'DELIVERY_TOO_LONG', detail: '交期无法满足客户要求，竞品承诺更短交期' },
  { code: 'TECHNICAL_GAP', detail: '产品在某些技术参数上不满足客户要求' },
  { code: 'COMPETITOR_RELATIONSHIP', detail: '客户与竞品有长期合作协议，转换成本高' },
  { code: 'BUDGET_CUT', detail: '客户项目预算缩减或暂停' },
  { code: 'SERVICE_CONCERN', detail: '客户担心售后支持不到位，选择本地服务商' },
]

export function generateOutcomes(
  rng: SeededRng,
  leads: Lead[],
): Outcome[] {
  const outcomes: Outcome[] = []
  let outcomeIdx = 0

  const terminalLeads = leads.filter(l =>
    ['won', 'lost', 'closed_looped'].includes(l.status),
  )

  for (const lead of terminalLeads) {
    outcomeIdx++
    const id = `outcome-${String(outcomeIdx).padStart(3, '0')}`

    const resultType: Outcome['resultType'] = lead.status === 'won' ? 'won'
      : lead.status === 'lost' ? 'lost'
        : lead.status === 'closed_looped' ? rng.weighted([['won' as const, 70], ['lost' as const, 30]])
          : 'won'

    const reasons = resultType === 'won' ? WON_REASONS : LOST_REASONS
    const reason = rng.pick(reasons)
    const finalAmount = resultType === 'won' ? rng.nextInt(5000, 500000) : null

    const aiContributions: Outcome['aiContributionTags'] = rng.shuffle([
      'intent_parsing', 'product_matching', 'reply_generation',
      'quotation_generation', 'risk_detection', 'knowledge_extraction', 'metric_aggregation',
    ] as const).slice(0, rng.nextInt(2, 5))

    outcomes.push({
      id,
      leadId: lead.id,
      resultType,
      reasonCode: reason.code,
      reasonDetail: reason.detail,
      finalAmount,
      customerFeedbackSummary: rng.next() > 0.3
        ? rng.pick([
          '客户对产品方案满意，表示后续有需求会继续合作',
          '客户反馈交付及时，产品质量稳定',
          '客户认为价格仍有优化空间，但整体可以接受',
          '客户对技术团队的专业性给予高度评价',
          '客户反馈售后跟进及时，问题解决效率高',
          '客户表示竞品在某个功能上更有优势，希望改进',
        ])
        : null,
      aiContributionTags: aiContributions,
      manualOverrideNotes: rng.next() > 0.7
        ? rng.pick(['销售经理手动调整了报价折扣', '技术方案经人工审核后修改了产品配置'])
        : null,
      closedAt: new Date(2025, 0, rng.nextInt(60, 150)).toISOString(),
      loopbackStatus: resultType === 'won' && rng.next() > 0.3 ? 'pending' : 'processed',
      relatedProductIds: lead.relatedProductIds,
      createdAt: new Date(2025, 0, rng.nextInt(60, 150)).toISOString(),
    })
  }

  return outcomes
}
