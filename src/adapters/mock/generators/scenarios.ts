/**
 * Fixed business scenario definitions for mock data generation.
 * Each scenario controls the distribution of leads and their attributes.
 */
import type { LeadStatus, PriorityLevel, RiskLevel } from '../../../contracts'

export interface ScenarioDefinition {
  id: string
  label: string
  /** How many leads to generate for this scenario */
  leadCount: number
  /** Weighted distribution of final lead statuses */
  statusWeights: Partial<Record<LeadStatus, number>>
  /** Number of product IDs to assign (drawn from the product pool) */
  productsPerLead: [number, number] // [min, max]
  /** Priority level bias */
  priorityBias: PriorityLevel
  /** Risk level bias */
  riskBias: RiskLevel
  /** Business value score range */
  valueRange: [number, number]
  /** Deal amount range (for outcomes) */
  amountRange: [number, number]
  /** Bias towards specific result types for terminal leads */
  resultBias: 'won' | 'lost' | 'mixed'
  /** Tags to apply */
  tags: string[]
  /** Whether leads in this scenario need manual review more often */
  manualReviewRate: number // 0-1
  /** Average follow-up count */
  followUpRange: [number, number]
  /** Intent type distribution */
  intentWeights: [string, number][]
}

export const SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'high-value',
    label: 'High Value Quick Win',
    leadCount: 15,
    statusWeights: { won: 0.6, sent: 0.2, following_up: 0.1, recommending: 0.1 },
    productsPerLead: [1, 3],
    priorityBias: 'high',
    riskBias: 'low',
    valueRange: [75, 98],
    amountRange: [50000, 500000],
    resultBias: 'won',
    tags: ['高价值', '快速成交', '重点客户'],
    manualReviewRate: 0.1,
    followUpRange: [0, 2],
    intentWeights: [['inquiry', 0.5], ['technical_consult', 0.3], ['price_check', 0.2]],
  },
  {
    id: 'low-confidence',
    label: 'Low Confidence Review',
    leadCount: 12,
    statusWeights: { recommending: 0.3, qualified: 0.3, following_up: 0.2, won: 0.1, lost: 0.1 },
    productsPerLead: [1, 3],
    priorityBias: 'medium',
    riskBias: 'medium',
    valueRange: [35, 70],
    amountRange: [10000, 150000],
    resultBias: 'mixed',
    tags: ['低置信度', '需复核', 'AI不确定'],
    manualReviewRate: 0.7,
    followUpRange: [1, 3],
    intentWeights: [['technical_consult', 0.4], ['inquiry', 0.3], ['complaint', 0.2], ['aftersales', 0.1]],
  },
  {
    id: 'high-risk',
    label: 'High Risk Intercept',
    leadCount: 10,
    statusWeights: { lost: 0.3, following_up: 0.3, qualified: 0.2, recommending: 0.1, won: 0.1 },
    productsPerLead: [1, 2],
    priorityBias: 'high',
    riskBias: 'high',
    valueRange: [40, 80],
    amountRange: [20000, 300000],
    resultBias: 'lost',
    tags: ['高风险', '需拦截', '信用预警', '合规风险'],
    manualReviewRate: 0.8,
    followUpRange: [2, 5],
    intentWeights: [['complaint', 0.3], ['price_check', 0.3], ['inquiry', 0.2], ['technical_consult', 0.2]],
  },
  {
    id: 'followup',
    label: 'Continue Follow-up',
    leadCount: 15,
    statusWeights: { following_up: 0.5, sent: 0.25, recommending: 0.15, draft_ready: 0.1 },
    productsPerLead: [1, 3],
    priorityBias: 'medium',
    riskBias: 'low',
    valueRange: [40, 75],
    amountRange: [15000, 200000],
    resultBias: 'mixed',
    tags: ['跟进中', '待回复', '长期客户'],
    manualReviewRate: 0.3,
    followUpRange: [2, 6],
    intentWeights: [['inquiry', 0.4], ['technical_consult', 0.3], ['aftersales', 0.2], ['price_check', 0.1]],
  },
  {
    id: 'won',
    label: 'Won Deals',
    leadCount: 15,
    statusWeights: { won: 0.8, closed_looped: 0.2 },
    productsPerLead: [1, 4],
    priorityBias: 'high',
    riskBias: 'low',
    valueRange: [65, 95],
    amountRange: [30000, 400000],
    resultBias: 'won',
    tags: ['已赢单', '成交', '标杆案例'],
    manualReviewRate: 0.05,
    followUpRange: [0, 2],
    intentWeights: [['inquiry', 0.4], ['technical_consult', 0.3], ['price_check', 0.2], ['aftersales', 0.1]],
  },
  {
    id: 'lost',
    label: 'Lost Deals',
    leadCount: 10,
    statusWeights: { lost: 0.8, closed_looped: 0.2 },
    productsPerLead: [1, 3],
    priorityBias: 'medium',
    riskBias: 'medium',
    valueRange: [30, 80],
    amountRange: [10000, 250000],
    resultBias: 'lost',
    tags: ['已丢单', '竞品流失', '复盘分析'],
    manualReviewRate: 0.1,
    followUpRange: [1, 4],
    intentWeights: [['price_check', 0.4], ['inquiry', 0.3], ['technical_consult', 0.2], ['complaint', 0.1]],
  },
  {
    id: 'price-sensitive',
    label: 'Price Sensitive Churn',
    leadCount: 8,
    statusWeights: { lost: 0.5, following_up: 0.25, sent: 0.15, won: 0.1 },
    productsPerLead: [1, 2],
    priorityBias: 'low',
    riskBias: 'high',
    valueRange: [20, 55],
    amountRange: [5000, 80000],
    resultBias: 'lost',
    tags: ['价格敏感', '流失风险', '竞品低价'],
    manualReviewRate: 0.4,
    followUpRange: [3, 7],
    intentWeights: [['price_check', 0.6], ['inquiry', 0.3], ['complaint', 0.1]],
  },
  {
    id: 'loopback',
    label: 'Knowledge Loopback',
    leadCount: 8,
    statusWeights: { closed_looped: 0.6, won: 0.3, lost: 0.1 },
    productsPerLead: [1, 3],
    priorityBias: 'medium',
    riskBias: 'low',
    valueRange: [50, 85],
    amountRange: [20000, 200000],
    resultBias: 'mixed',
    tags: ['知识回流', '经验沉淀', '话术优化'],
    manualReviewRate: 0.15,
    followUpRange: [0, 2],
    intentWeights: [['technical_consult', 0.35], ['inquiry', 0.3], ['aftersales', 0.2], ['price_check', 0.15]],
  },
  {
    id: 'cost-anomaly',
    label: 'Cost Anomaly',
    leadCount: 4,
    statusWeights: { recommending: 0.3, qualified: 0.3, sent: 0.2, following_up: 0.2 },
    productsPerLead: [1, 2],
    priorityBias: 'medium',
    riskBias: 'high',
    valueRange: [30, 65],
    amountRange: [80000, 500000],
    resultBias: 'mixed',
    tags: ['成本异常', '报价偏离', '需审查'],
    manualReviewRate: 0.6,
    followUpRange: [1, 3],
    intentWeights: [['price_check', 0.5], ['technical_consult', 0.3], ['inquiry', 0.2]],
  },
  {
    id: 'observability-failure',
    label: 'Observability Failure',
    leadCount: 3,
    statusWeights: { new: 0.3, qualified: 0.3, lost: 0.2, following_up: 0.2 },
    productsPerLead: [1, 2],
    priorityBias: 'high',
    riskBias: 'high',
    valueRange: [50, 90],
    amountRange: [30000, 200000],
    resultBias: 'lost',
    tags: ['系统异常', '观测失败', '需排查'],
    manualReviewRate: 0.9,
    followUpRange: [2, 5],
    intentWeights: [['complaint', 0.4], ['technical_consult', 0.3], ['inquiry', 0.2], ['aftersales', 0.1]],
  },
]

/** Extra standalone leads that don't fit into a specific scenario */
export const STANDALONE_LEAD_COUNT = 10

/** Total expected leads across all scenarios */
export const TOTAL_LEAD_COUNT =
  SCENARIOS.reduce((sum, s) => sum + s.leadCount, 0) + STANDALONE_LEAD_COUNT
