/**
 * AgentConfig generator — 12 agent configurations.
 */
import type { SeededRng } from './seeded-random'
import type { AgentConfig } from '../../../contracts'

const AGENT_TEMPLATES = [
  { name: 'Parsing Agent', capability: 'Intent Parsing & Entity Extraction', step: 'intent_parse', type: 'parsing' as const, modelId: 'model-001', workflowId: 'wf-parse-v3' },
  { name: 'Recommendation Agent', capability: 'Product Matching & Solution Recommend', step: 'product_recommend', type: 'recommendation' as const, modelId: 'model-002', workflowId: 'wf-recommend-v2' },
  { name: 'Reply Agent', capability: 'Customer Reply Generation', step: 'reply_generate', type: 'generation' as const, modelId: 'model-003', workflowId: 'wf-reply-v2' },
  { name: 'Quotation Agent', capability: 'Auto Quotation Calculation', step: 'quotation_generate', type: 'generation' as const, modelId: 'model-004', workflowId: 'wf-quotation-v1' },
  { name: 'Loopback Agent', capability: 'Knowledge Extraction & Loopback', step: 'outcome_loopback', type: 'loopback' as const, modelId: 'model-005', workflowId: 'wf-loopback-v1' },
  { name: 'Review Agent', capability: 'Quality Review & Risk Detection', step: 'intent_parse', type: 'review' as const, modelId: 'model-006', workflowId: 'wf-review-v1' },
  { name: 'Technical Parsing Agent', capability: 'Technical Document Understanding', step: 'intent_parse', type: 'parsing' as const, modelId: 'model-007', workflowId: 'wf-tech-parse-v1' },
  { name: 'Chinese Optimized Agent', capability: 'Chinese Reply Optimization', step: 'reply_generate', type: 'generation' as const, modelId: 'model-009', workflowId: 'wf-reply-cn-v1' },
  { name: 'Fast Reply Agent', capability: 'Low-Latency Reply', step: 'reply_generate', type: 'generation' as const, modelId: 'model-011', workflowId: 'wf-reply-fast-v1' },
  { name: 'Bulk Quotation Agent', capability: 'Bulk Quotation Processing', step: 'quotation_generate', type: 'generation' as const, modelId: 'model-012', workflowId: 'wf-bulk-quote-v1' },
  { name: 'Multi-modal Agent', capability: 'Image & Document Multi-modal', step: 'intent_parse', type: 'parsing' as const, modelId: 'model-010', workflowId: 'wf-multimodal-v1' },
  { name: 'Knowledge Extractor', capability: 'Advanced Knowledge Mining', step: 'outcome_loopback', type: 'loopback' as const, modelId: 'model-013', workflowId: 'wf-knowledge-v2' },
]

export function generateAgentConfigs(rng: SeededRng): AgentConfig[] {
  return AGENT_TEMPLATES.map((t, i) => ({
    id: `agent-${String(i + 1).padStart(3, '0')}`,
    name: t.name,
    capability: t.capability,
    step: t.step,
    type: t.type,
    modelId: t.modelId,
    workflowId: t.workflowId,
    promptTemplate: `You are a specialized agent for ${t.capability}. Analyze the input carefully and provide accurate results.`,
    enabled: rng.next() > 0.08,
    successRate: Math.round(rng.nextFloat(0.82, 0.98) * 100) / 100,
    version: `v${rng.nextInt(1, 3)}.${rng.nextInt(0, 9)}`,
    updatedAt: new Date(2025, 0, rng.nextInt(1, 120)).toISOString(),
  }))
}
