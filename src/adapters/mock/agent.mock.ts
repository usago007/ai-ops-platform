import type { AgentConfig } from '../../../contracts/agent-config'

export function generateAgentConfigs(): AgentConfig[] {
  return [
    { id: 'agent-001', name: 'ParsingAgent', capability: '需求理解与字段提取', step: '需求理解',
      type: 'parsing', modelId: 'gpt-4o-mini', workflowId: 'wf-parse-001',
      promptTemplate: '从客户消息中提取商品、数量、交期、预算等关键字段...',
      enabled: true, successRate: 0.94, version: 'v2.1', updatedAt: '2025-03-01' },
    { id: 'agent-002', name: 'RecommendationAgent', capability: '商品匹配与方案推荐', step: '方案推荐',
      type: 'recommendation', modelId: 'gpt-4o', workflowId: 'wf-recommend-001',
      promptTemplate: '基于客户需求和商品库匹配最佳商品方案...',
      enabled: true, successRate: 0.88, version: 'v1.8', updatedAt: '2025-03-10' },
    { id: 'agent-003', name: 'ReplyAgent', capability: '客服回复与报价生成', step: '回复/报价生成',
      type: 'generation', modelId: 'claude-3-sonnet', workflowId: 'wf-reply-001',
      promptTemplate: '生成专业、友好的客户回复和准确报价...',
      enabled: true, successRate: 0.91, version: 'v3.0', updatedAt: '2025-03-12' },
    { id: 'agent-004', name: 'LoopbackAgent', capability: '结果分析与知识回流', step: '结果回流',
      type: 'loopback', modelId: 'gpt-4o-mini', workflowId: 'wf-loopback-001',
      promptTemplate: '分析业务结果，生成知识条目和更新指标...',
      enabled: true, successRate: 0.85, version: 'v1.5', updatedAt: '2025-03-05' },
    { id: 'agent-005', name: 'ReviewAgent', capability: '人工审核辅助', step: '人工审核',
      type: 'review', modelId: 'gpt-4o', workflowId: 'wf-review-001',
      promptTemplate: '对比AI建议与人工决策，记录审核结果...',
      enabled: true, successRate: 0.97, version: 'v2.0', updatedAt: '2025-03-08' },
  ]
}
