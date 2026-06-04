/**
 * SolutionRecommendation generator — 60-80 solution recommendations for qualified+ leads.
 */
import type { SeededRng } from './seeded-random'
import type { SolutionRecommendation, RecommendedProduct, MatchedCase, FaqMatch } from '../../../contracts'
import type { Lead } from '../../../contracts'
import type { ProductAsset } from '../../../contracts'

const REASONING_TEMPLATES = [
  '基于客户{company}的{category}需求，结合历史{won_count}个同类案例，推荐{primary_product}作为主方案。该方案在同类场景下成交率{win_rate}%，匹配分数{match_score}。替代方案可选{alt_product}以降低预算。',
  '客户需求明确({intent})，产品{primary_product}在参数和价格上最匹配。历史相似案例显示此方案可提升客户效率{percent}%。建议同时推荐{bundle_product}作为捆绑方案。',
  '经AI分析，客户{company}的询价特征与{matched_cases}个已成交案例高度相似(sim>{similarity})，推荐采用{primary_product}方案。如果预算受限，可选{alt_product}国产替代方案。',
]

const CASE_TEMPLATES: Array<{ title: string; outcome: 'won' | 'lost'; amount: number }> = [
  { title: '某汽车零部件厂商PLC升级项目', outcome: 'won', amount: 185000 },
  { title: '华南电子厂产线自动化改造', outcome: 'won', amount: 320000 },
  { title: '华东化工厂温控系统', outcome: 'won', amount: 95000 },
  { title: '食品饮料包装线传感器采购', outcome: 'won', amount: 45000 },
  { title: '华北某钢厂变频器节能改造', outcome: 'won', amount: 280000 },
  { title: '西南水泥厂DCS系统升级', outcome: 'lost', amount: 0 },
  { title: '医疗器械设备伺服方案', outcome: 'won', amount: 156000 },
  { title: '物流仓储分拣系统PLC采购', outcome: 'lost', amount: 0 },
  { title: '某注塑机厂伺服节能改造', outcome: 'won', amount: 72000 },
  { title: '华东纺织厂变频器批量采购', outcome: 'won', amount: 210000 },
  { title: '华南3C电子产线自动化方案', outcome: 'won', amount: 420000 },
  { title: '北方供热站PLC改造', outcome: 'lost', amount: 0 },
  { title: '船舶重工焊接机器人伺服方案', outcome: 'won', amount: 350000 },
  { title: '芯片封装设备精密伺服', outcome: 'won', amount: 580000 },
  { title: '新能源电池产线全自动化', outcome: 'won', amount: 650000 },
  { title: '某水处理厂变频泵站改造', outcome: 'lost', amount: 0 },
  { title: '石油钻机控制系统升级', outcome: 'won', amount: 890000 },
  { title: '饮料灌装线伺服驱动方案', outcome: 'won', amount: 175000 },
  { title: '造纸厂传动系统变频改造', outcome: 'won', amount: 410000 },
  { title: '某机场行李分拣PLC控制', outcome: 'lost', amount: 0 },
]

export function generateSolutionRecommendations(
  rng: SeededRng,
  leads: Lead[],
  productAssets: ProductAsset[],
): SolutionRecommendation[] {
  const solutions: SolutionRecommendation[] = []
  let solIdx = 0

  // Only generate solutions for leads past 'new' status
  const eligibleLeads = leads.filter(l => l.status !== 'new')
  const shuffledLeads = rng.shuffle(eligibleLeads)

  for (const lead of shuffledLeads) {
    // ~85% of eligible leads get solutions
    if (rng.next() > 0.85 && solIdx >= 30) continue

    solIdx++
    const id = `sol-${String(solIdx).padStart(3, '0')}`

    // Pick 1-4 products as recommended
    const availableProducts = lead.relatedProductIds.length > 0
      ? productAssets.filter(p => lead.relatedProductIds.includes(p.id))
      : rng.pickN(productAssets, 3)

    const numProducts = Math.min(rng.nextInt(1, 4), availableProducts.length)
    const selectedProducts = rng.pickN(availableProducts, numProducts)

    const recommendedProducts: RecommendedProduct[] = selectedProducts.map((p, idx) => ({
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      reason: idx === 0
        ? `最匹配客户需求，历史成交率${Math.round((p.historicalWinRate || 0.7) * 100)}%`
        : `补充方案，覆盖客户{场景}需求`.replace('{场景}', rng.pick(p.applicationScenarios)),
      matchScore: idx === 0 ? rng.nextInt(85, 98) : rng.nextInt(60, 85),
      isPrimary: idx === 0,
    }))

    // Alternative options
    const altCount = rng.nextInt(0, 2)
    const alternativeOptions: SolutionRecommendation['alternativeOptions'] = []
    for (let a = 0; a < altCount; a++) {
      const altProducts = rng.pickN(
        productAssets.filter(p => !selectedProducts.some(sp => sp.productId === p.id) && p.category === selectedProducts[0].category),
        Math.min(2, rng.nextInt(1, 2)),
      )
      if (altProducts.length > 0) {
        alternativeOptions.push({
          title: rng.pick(['降本方案', '高端升级方案', '国产替代方案']),
          products: altProducts.map(p => ({
            productId: p.id, productName: p.name, sku: p.sku,
            reason: '替代方案', matchScore: rng.nextInt(55, 80), isPrimary: false,
          })),
          tradeoff: rng.pick(['价格降低20-30%，性能略有下降', '性能提升15%，成本增加约25%', '成本降低40%，交期缩短2周']),
        })
      }
    }

    // Matched cases
    const numCases = rng.nextInt(2, 4)
    const matchedCases: MatchedCase[] = rng.pickN(CASE_TEMPLATES, numCases).map(c => ({
      caseId: `case-${String(rng.nextInt(1, 100)).padStart(3, '0')}`,
      title: c.title,
      similarity: Math.round(rng.nextFloat(0.65, 0.97) * 100) / 100,
      outcome: c.outcome,
      amount: c.amount,
    }))

    // Matched FAQs
    const numFaqs = rng.nextInt(1, 3)
    const matchedFaqs: FaqMatch[] = selectedProducts.flatMap(p =>
      rng.pickN(p.faqItems, Math.min(numFaqs, p.faqItems.length)),
    ).slice(0, numFaqs).map(f => ({
      question: f.question,
      answer: f.answer,
      relevanceScore: Math.round(rng.nextFloat(0.7, 0.95) * 100) / 100,
    }))

    // Reasoning summary
    const primaryProduct = recommendedProducts[0]
    const altProduct = alternativeOptions[0]?.products[0]
    const reasoningSummary = rng.pick(REASONING_TEMPLATES)
      .replace('{company}', lead.companyName)
      .replace('{category}', primaryProduct.productName.split(' ')[1] || primaryProduct.productName)
      .replace('{won_count}', String(rng.nextInt(3, 15)))
      .replace('{primary_product}', primaryProduct.productName)
      .replace('{win_rate}', String(Math.round((primaryProduct.matchScore || 85)) + '%'))
      .replace('{match_score}', String(primaryProduct.matchScore))
      .replace('{alt_product}', altProduct?.productName || '无')
      .replace('{intent}', lead.leadType)
      .replace('{bundle_product}', rng.pick(recommendedProducts.slice(1).map(p => p.productName)) || '无')
      .replace('{percent}', String(rng.nextInt(15, 35)) + '%')
      .replace('{matched_cases}', String(matchedCases.length))
      .replace('{similarity}', String(Math.round(rng.nextFloat(0.75, 0.95) * 100) / 100))

    const confidenceScore = Math.round(rng.nextFloat(0.65, 0.96) * 100) / 100

    const statusWeights: Array<[SolutionRecommendation['status'], number]> = [
      ['generated', 45], ['reviewed', 30], ['accepted', 20], ['rejected', 5],
    ]

    solutions.push({
      id,
      leadId: lead.id,
      recommendedProducts,
      alternativeOptions,
      matchedCases,
      matchedFaqs,
      pricingReference: rng.next() > 0.2 ? {
        minPrice: rng.nextInt(500, 10000),
        maxPrice: rng.nextInt(15000, 500000),
        avgPrice: rng.nextInt(5000, 100000),
        currency: 'CNY',
      } : null,
      deliveryReference: rng.next() > 0.3 ? rng.pick(['2-4周', '4-6周', '6-8周', '8-12周', '现货']) : null,
      reasoningSummary,
      confidenceScore,
      humanReviewRequired: confidenceScore < 0.75 || lead.manualReviewRequired,
      status: rng.weighted(statusWeights),
      reviewedBy: rng.next() > 0.4 ? rng.pick(['张工', '李经理', '王工']) : null,
      reviewNotes: rng.next() > 0.6 ? rng.pick(['方案合理，批准', '价格偏高，建议增加替代方案', '技术参数需确认']) : null,
      createdAt: new Date(2025, 0, rng.nextInt(30, 140)).toISOString(),
      updatedAt: new Date(2025, 0, rng.nextInt(40, 150)).toISOString(),
    })
  }

  return solutions
}
