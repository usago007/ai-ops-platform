/**
 * Generators barrel — all 14 domain object generators.
 * Each generator receives a seeded RNG for deterministic output.
 */
export { createRng, GLOBAL_SEED } from './seeded-random'
export type { SeededRng } from './seeded-random'

export { generateProductAssets } from './product-asset.generator'
export { generateConversations } from './conversation.generator'
export { generateInquiryDrafts } from './inquiry-draft.generator'
export { generateLeads } from './lead.generator'
export { generateSolutionRecommendations } from './solution-recommendation.generator'
export { generateReplyDrafts } from './reply-draft.generator'
export { generateQuotationDrafts } from './quotation-draft.generator'
export { generateOutcomes } from './outcome.generator'
export { generateKnowledgeItems } from './knowledge-item.generator'
export { generateMetricSnapshots } from './metric-snapshot.generator'
export { generateSystemHealth } from './system-health.generator'
export { generateAuditEntries } from './audit-entry.generator'
export { generateModelConfigs } from './model-config.generator'
export { generateAgentConfigs } from './agent-config.generator'
