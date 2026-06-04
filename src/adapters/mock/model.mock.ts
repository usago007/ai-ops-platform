import type { ModelConfig } from '../../../contracts/model-config'

export function generateModelConfigs(): ModelConfig[] {
  return [
    { id: 'model-001', name: '需求理解模型', step: '需求理解', modelId: 'gpt-4o-mini', provider: 'OpenAI',
      params: { temperature: 0.3, maxTokens: 2048 }, enabled: true, avgLatencyMs: 280, callCount: 340, version: 'v2.1', updatedAt: '2025-03-01' },
    { id: 'model-002', name: '方案推荐模型', step: '方案推荐', modelId: 'gpt-4o', provider: 'OpenAI',
      params: { temperature: 0.5, maxTokens: 4096 }, enabled: true, avgLatencyMs: 750, callCount: 285, version: 'v1.8', updatedAt: '2025-03-10' },
    { id: 'model-003', name: '回复生成模型', step: '回复生成', modelId: 'claude-3-sonnet', provider: 'Anthropic',
      params: { temperature: 0.7, maxTokens: 3072 }, enabled: true, avgLatencyMs: 520, callCount: 312, version: 'v3.0', updatedAt: '2025-03-12' },
    { id: 'model-004', name: '报价规则引擎', step: '报价生成', modelId: 'rule-engine-v2', provider: 'Internal',
      params: { precision: 2 }, enabled: true, avgLatencyMs: 120, callCount: 210, version: 'v2.3', updatedAt: '2025-02-28' },
    { id: 'model-005', name: '回流分析模型', step: '结果回流', modelId: 'gpt-4o-mini', provider: 'OpenAI',
      params: { temperature: 0.2, maxTokens: 1024 }, enabled: true, avgLatencyMs: 200, callCount: 100, version: 'v1.5', updatedAt: '2025-03-05' },
  ]
}
