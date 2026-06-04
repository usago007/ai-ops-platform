/** AgentConfig — Agent 编排配置，映射到业务能力 */
export interface AgentConfig {
  id: string
  name: string
  /** 关联的业务能力 */
  capability: string
  /** 关联的主链步骤 */
  step: string
  /** Agent 类型 */
  type: 'parsing' | 'recommendation' | 'generation' | 'loopback' | 'review'
  /** 模型 ID */
  modelId: string
  /** 工作流 ID */
  workflowId: string
  /** Prompt 模板 */
  promptTemplate: string
  /** 是否启用 */
  enabled: boolean
  /** 成功率 */
  successRate: number
  /** 版本 */
  version: string
  updatedAt: string
}

/** Agent 到主链步骤的映射 */
export const AGENT_STEP_MAP: Record<string, string> = {
  parsing: '需求理解',
  recommendation: '方案推荐',
  generation: '回复/报价生成',
  loopback: '结果回流',
  review: '人工审核',
}
