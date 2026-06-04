/**
 * ModelConfig generator — 15 model configurations.
 */
import type { SeededRng } from './seeded-random'
import type { ModelConfig } from '../../../contracts'

const MODEL_TEMPLATES = [
  { name: 'GPT-4o-mini (需求解析)', step: 'intent_parse', modelId: 'gpt-4o-mini-2025-01', provider: 'OpenAI', latency: 180, version: '2025-01' },
  { name: 'GPT-4o (方案推荐)', step: 'product_recommend', modelId: 'gpt-4o-2025-01', provider: 'OpenAI', latency: 450, version: '2025-01' },
  { name: 'Claude 3.5 Sonnet (回复生成)', step: 'reply_generate', modelId: 'claude-3-5-sonnet-20241022', provider: 'Anthropic', latency: 380, version: 'v1.0' },
  { name: 'Rule Engine V2 (报价引擎)', step: 'quotation_generate', modelId: 'rule-engine-v2', provider: 'Internal', latency: 50, version: 'v2.3' },
  { name: 'GPT-4o-mini (知识回流)', step: 'outcome_loopback', modelId: 'gpt-4o-mini-2025-01', provider: 'OpenAI', latency: 220, version: '2025-01' },
  { name: 'GPT-4o (意图解析-高精度)', step: 'intent_parse', modelId: 'gpt-4o-2025-01', provider: 'OpenAI', latency: 520, version: '2025-01' },
  { name: 'Claude 3.5 Sonnet (方案推荐)', step: 'product_recommend', modelId: 'claude-3-5-sonnet-20241022', provider: 'Anthropic', latency: 410, version: 'v1.0' },
  { name: 'DeepSeek V3 (回复生成)', step: 'reply_generate', modelId: 'deepseek-v3-2025-01', provider: 'DeepSeek', latency: 290, version: '2025-01' },
  { name: 'Qwen 2.5 (需求解析-中文)', step: 'intent_parse', modelId: 'qwen-2.5-72b', provider: 'Azure', latency: 350, version: 'v2.5' },
  { name: 'Gemini 2.0 (多模态理解)', step: 'intent_parse', modelId: 'gemini-2.0-flash', provider: 'Google', latency: 200, version: 'v2.0' },
  { name: 'Claude 3.5 Haiku (快速回复)', step: 'reply_generate', modelId: 'claude-3-5-haiku-20241022', provider: 'Anthropic', latency: 150, version: 'v1.0' },
  { name: 'GPT-4o-mini (批量报价)', step: 'quotation_generate', modelId: 'gpt-4o-mini-2025-01', provider: 'OpenAI', latency: 160, version: '2025-01' },
  { name: 'Mistral Medium (知识提取)', step: 'outcome_loopback', modelId: 'mistral-medium-2025-01', provider: 'Mistral', latency: 280, version: '2025-01' },
  { name: 'Embedding V3 (向量匹配)', step: 'product_recommend', modelId: 'text-embedding-3-large', provider: 'OpenAI', latency: 45, version: 'v3' },
  { name: 'Reranker V2 (结果排序)', step: 'product_recommend', modelId: 'bge-reranker-v2-m3', provider: 'Internal', latency: 30, version: 'v2.0' },
]

export function generateModelConfigs(rng: SeededRng): ModelConfig[] {
  return MODEL_TEMPLATES.map((t, i) => ({
    id: `model-${String(i + 1).padStart(3, '0')}`,
    name: t.name,
    step: t.step,
    modelId: t.modelId,
    provider: t.provider,
    params: {
      temperature: t.provider === 'Internal' ? 0 : Math.round(rng.nextFloat(0.1, 0.8) * 10) / 10,
      maxTokens: rng.pick([2048, 4096, 8192, 16384]),
      topP: 0.95,
    },
    enabled: rng.next() > 0.05,
    avgLatencyMs: Math.round(t.latency * rng.nextFloat(0.9, 1.2)),
    callCount: rng.nextInt(500, 50000),
    version: t.version,
    updatedAt: new Date(2025, 0, rng.nextInt(1, 120)).toISOString(),
  }))
}
