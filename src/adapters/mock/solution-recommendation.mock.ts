import type { SolutionRecommendation } from '../../contracts'

export function generateSolutionRecommendations(): SolutionRecommendation[] {
  return [
    {
      id: 'sol-001',
      leadId: 'lead-001',
      recommendedProducts: [
        {
          productId: 'prod-001',
          productName: 'PLC控制器 FX3U-64MT',
          sku: 'SKU-1001',
          reason: '完全匹配客户型号需求，历史成交率高（72%），现货充足',
          matchScore: 98,
          isPrimary: true,
        },
      ],
      alternativeOptions: [
        {
          title: '升级方案：FX5U系列',
          products: [{
            productId: 'prod-001b',
            productName: 'PLC控制器 FX5U-64MT',
            sku: 'SKU-1002',
            reason: '新一代处理器，性能提升60%，支持更多通信协议',
            matchScore: 85,
            isPrimary: true,
          }],
          tradeoff: '价格高约30%，但性能和扩展性更优，适合未来升级需求',
        },
        {
          title: '国产替代方案',
          products: [{
            productId: 'prod-001c',
            productName: 'PLC控制器 H3U-64MT',
            sku: 'SKU-3001',
            reason: '功能兼容FX3U，价格低40%，本地化服务更好',
            matchScore: 78,
            isPrimary: true,
          }],
          tradeoff: '价格优势明显，但品牌影响力和生态系统不如三菱',
        },
      ],
      matchedCases: [
        { caseId: 'case-001', title: '某包装机械厂PLC采购', similarity: 0.92, outcome: 'won', amount: 128000 },
        { caseId: 'case-002', title: '某物流设备商PLC批量采购', similarity: 0.87, outcome: 'won', amount: 115000 },
        { caseId: 'case-003', title: '某自动化公司替代选型', similarity: 0.81, outcome: 'lost', amount: null },
      ],
      matchedFaqs: [
        { question: 'FX3U-64MT支持哪些编程软件？', answer: '支持GX Works2和GX Works3，推荐使用GX Works3。', relevanceScore: 0.95 },
      ],
      pricingReference: {
        minPrice: 2450,
        maxPrice: 2800,
        avgPrice: 2560,
        currency: 'CNY',
      },
      deliveryReference: '现货充足，预计7-10个工作日可发货',
      reasoningSummary: '客户需求明确（FX3U-64MT、50台），AI直接匹配到完全一致的库存商品。该型号成交率高、库存充足，建议主推。同时提供FX5U升级方案作为增值选项，以及国产替代方案供客户比价参考。风险点：客户未明确支付方式，报价时需列出现结和月结两种方案。',
      confidenceScore: 0.88,
      humanReviewRequired: true,
      status: 'generated',
      reviewedBy: null,
      reviewNotes: null,
      createdAt: '2025-01-15T10:40:00',
      updatedAt: '2025-01-15T10:40:00',
    },
  ]
}

export function getSolutionRecommendationById(id: string): SolutionRecommendation | undefined {
  return generateSolutionRecommendations().find(s => s.id === id)
}

export function getSolutionRecommendationByLeadId(leadId: string): SolutionRecommendation | undefined {
  return generateSolutionRecommendations().find(s => s.leadId === leadId)
}
