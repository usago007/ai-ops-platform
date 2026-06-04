import type {
  ProductAttribute,
  SpecItem,
  FaqItem,
  ContentAsset,
} from './shared'

// ── ProductAsset ──
/**
 * 可被 AI 和业务调用的商品资产，不只是主数据。
 * AI 不能脱离 ProductAsset 凭空生成业务建议。
 */
export interface ProductAsset {
  id: string
  sku: string
  name: string
  brand: string
  category: string
  model: string
  /** 规格参数 */
  specs: SpecItem[]
  /** 基础属性（AI 提取 + 人工确认） */
  baseAttributes: ProductAttribute[]
  /** 应用场景 */
  applicationScenarios: string[]
  /** AI 提炼卖点 */
  sellingPoints: string[]
  /** AI 提取 FAQ */
  faqItems: FaqItem[]
  /** 替代型号 */
  alternativeModels: string[]
  /** 捆绑推荐 */
  bundleRecommendations: Array<{
    productId: string
    productName: string
    reason: string
  }>
  /** 风险提示 */
  riskNotes: string[]
  /** 合规提示 */
  complianceNotes: string[]
  /** 历史成交率 0-1 */
  historicalWinRate: number | null
  /** 历史流失原因 */
  historicalLossReasons: string[]
  /** 内容资产 */
  contentAssets: ContentAsset[]
  /** 最后更新时间 */
  lastUpdatedAt: string
}
