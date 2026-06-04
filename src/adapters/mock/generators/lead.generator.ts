/**
 * Lead generator — 100-120 leads across 10 scenarios with proper status distributions.
 * Each lead links to a conversation + inquiry draft + products.
 */
import type { SeededRng } from './seeded-random'
import type { Lead } from '../../../contracts'
import type { Conversation } from '../../../contracts'
import type { InquiryDraft } from '../../../contracts'
import type { ProductAsset } from '../../../contracts'
import { SCENARIOS, STANDALONE_LEAD_COUNT } from './scenarios'
import type { ScenarioDefinition } from './scenarios'

// ── Lead summary templates ──
const SUMMARY_TEMPLATES: Record<string, string[]> = {
  inquiry: [
    '客户通过{channel}渠道发起产品询价，需求为{category}类产品，数量约{qty}台，预算{budget}。客户主要关注产品性价比和交期。',
    '新客户询价，公司为{company}，行业为制造业，需要{category}产品完成产线升级。需求明确，可快速推进。',
  ],
  technical_consult: [
    '客户现有{category}设备出现故障，需要技术支持。问题方向：兼容性和通讯协议对接，对技术人员能力要求较高。',
    '技术选型咨询——客户在做产线改造方案，需要{category}与现有系统集成的技术建议，对品牌和技术路线有偏好。',
  ],
  price_check: [
    '客户比价需求——已获得多家供应商报价，正在对比{pcount}个品牌的{category}产品价格。价格敏感度高，可能因价格流失。',
    '老客户重新询价，之前合作过，本次需求量大({qty}台)，但要求降价。竞品报价较低，面临价格战风险。',
  ],
  complaint: [
    '客户投诉——此前购买的{category}产品出现品质问题，需要售后服务跟进。客户情绪较负面，需优先处理避免舆情。',
    '售后投诉工单——设备故障导致客户产线停机，损失较大。需要紧急技术支持和可能的换货/退货处理。',
  ],
  aftersales: [
    '客户售后需求——已购{category}设备需要配件和耗材补充，同时咨询升级方案。客户关系稳定，有追加销售机会。',
    '老客户维护——定期回访了解设备运行状态，客户对现有产品满意但有新的自动化需求，可推荐方案升级。',
  ],
}

const ASSIGNEES = ['张工', '李经理', '王工', '陈工', '刘主管', '赵工', '周经理', '吴工', '孙工', '钱主管']

// ── Generator ──

export function generateLeads(
  rng: SeededRng,
  conversations: Conversation[],
  inquiryDrafts: InquiryDraft[],
  productAssets: ProductAsset[],
): Lead[] {
  const leads: Lead[] = []
  const productIds = productAssets.map(p => p.id)
  let leadIdx = 0

  function makeLead(convIdx: number, scenario?: ScenarioDefinition): Lead {
    const id = `lead-${String(leadIdx + 1).padStart(3, '0')}`
    const conv = conversations[convIdx]
    const draft = inquiryDrafts[convIdx]
    const intentType = draft?.intentType || 'inquiry'

    leadIdx++

    // Determine status from scenario weights or balanced default
    let status: Lead['status']
    if (scenario) {
      const weights = Object.entries(scenario.statusWeights) as [Lead['status'], number][]
      status = rng.weighted(weights)
    } else {
      // Balanced standalone distribution
      status = rng.weighted([
        ['new', 10], ['qualified', 20], ['recommending', 25], ['draft_ready', 15],
        ['sent', 10], ['following_up', 10], ['won', 5], ['lost', 3], ['closed_looped', 2],
      ])
    }

    // Pick products
    const [minP, maxP] = scenario?.productsPerLead || [1, 3]
    const numProducts = rng.nextInt(minP, maxP)
    const relatedProductIds = rng.pickN(productIds, Math.min(numProducts, productIds.length))

    // Priority and risk
    const priorityBias = scenario?.priorityBias || rng.pick(['high', 'medium', 'low'] as const)
    const riskBias = scenario?.riskBias || rng.pick(['high', 'medium', 'low'] as const)

    const priorityLevel = rng.weighted(
      priorityBias === 'high' ? [['high' as const, 60], ['medium' as const, 30], ['low' as const, 10]] :
        priorityBias === 'low' ? [['low' as const, 60], ['medium' as const, 30], ['high' as const, 10]] :
          [['medium' as const, 50], ['high' as const, 25], ['low' as const, 25]],
    )

    const riskLevel = rng.weighted(
      riskBias === 'high' ? [['high' as const, 60], ['medium' as const, 30], ['low' as const, 10]] :
        riskBias === 'low' ? [['low' as const, 60], ['medium' as const, 30], ['high' as const, 10]] :
          [['medium' as const, 50], ['high' as const, 25], ['low' as const, 25]],
    )

    // Value score from scenario range
    const [vMin, vMax] = scenario?.valueRange || [30, 80]
    const businessValueScore = rng.nextInt(vMin, vMax)

    // Follow-up count
    const [fMin, fMax] = scenario?.followUpRange || [0, 3]
    const followUpCount = rng.nextInt(fMin, fMax)

    // Manual review
    const manualReviewRate = scenario?.manualReviewRate ?? 0.3
    const manualReviewRequired = rng.next() < manualReviewRate

    // Tags — combine scenario tags with lead-specific tags
    const tags = [
      ...(scenario?.tags || []),
      ...(priorityLevel === 'high' ? ['重点关注'] : []),
      ...(riskLevel === 'high' ? ['风险预警'] : []),
      ...(manualReviewRequired ? ['需人工复核'] : []),
      ...(intentType === 'complaint' ? ['客诉'] : []),
    ]

    // Summary
    const templates = SUMMARY_TEMPLATES[intentType] || SUMMARY_TEMPLATES['inquiry']
    const template = rng.pick(templates)
    const product = productAssets.find(p => p.id === relatedProductIds[0])
    const leadSummary = template
      .replace('{channel}', conv.channel)
      .replace('{category}', product?.category || '自动化')
      .replace('{company}', conv.companyName)
      .replace('{qty}', String(draft?.quantity || rng.nextInt(1, 50)))
      .replace('{budget}', draft?.budgetRange || '待确认')
      .replace('{pcount}', String(rng.nextInt(2, 5)))

    // Dates
    const createdAt = new Date(2025, 0, rng.nextInt(1, 150)).toISOString()
    const updatedAt = new Date(new Date(createdAt).getTime() + rng.nextInt(1, 30) * 86400000).toISOString()

    return {
      id,
      sourceConversationId: conv.id,
      sourceDraftId: draft.id,
      customerId: rng.next() > 0.3 ? `cust-${String(rng.nextInt(1, 50)).padStart(3, '0')}` : null,
      companyName: conv.companyName,
      leadSummary,
      leadType: intentType,
      priorityLevel,
      businessValueScore,
      riskLevel,
      assignedTo: rng.pick(ASSIGNEES),
      status,
      lastActionAt: status !== 'new' ? updatedAt : null,
      nextAction: status === 'following_up' ? rng.pick(['电话跟进', '发送报价', '安排技术交流', '发送产品资料', '邀约参观']) :
        status === 'qualified' ? '生成方案推荐' :
          status === 'recommending' ? '审核推荐方案' :
            status === 'draft_ready' ? '发送报价和回复' : null,
      tags,
      relatedProductIds,
      selectedSolutionId: null,     // Set later
      selectedReplyDraftId: null,  // Set later
      selectedQuotationDraftId: null, // Set later
      outcomeId: null,             // Set later
      manualReviewRequired,
      followUpCount,
      latestCustomerResponse: followUpCount > 0
        ? rng.pick(['客户表示有兴趣，等内部讨论', '客户要求降价后再谈', '客户已收到报价，在对比中', '客户表示暂不需要', '客户要求安排技术交流'])
        : null,
      createdAt,
      updatedAt,
    }
  }

  // Generate leads per scenario
  let convOffset = 0
  for (const scenario of SCENARIOS) {
    for (let j = 0; j < scenario.leadCount; j++) {
      if (convOffset < conversations.length) {
        leads.push(makeLead(convOffset, scenario))
        convOffset++
      }
    }
  }

  // Generate standalone leads (balanced, no specific scenario bias)
  for (let j = 0; j < STANDALONE_LEAD_COUNT; j++) {
    if (convOffset < conversations.length) {
      leads.push(makeLead(convOffset))
      convOffset++
    }
  }

  return leads
}
