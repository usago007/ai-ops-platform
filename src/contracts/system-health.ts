/** SystemHealth — 系统底座健康状态，映射到主链 AI 引擎调用 */
export interface SystemHealth {
  id: string
  /** 模型调用总数 */
  totalModelCalls: number
  /** 按步骤分布 */
  modelCallsByStep: Record<string, number>
  /** 工作流执行次数 */
  workflowRuns: number
  /** 审计条目数 */
  auditEntries: number
  /** 知识条目数 */
  knowledgeItemCount: number
  /** 指标快照数 */
  metricSnapshotCount: number
  /** 平均延迟(ms) */
  avgLatencyMs: number
  /** 错误率 */
  errorRate: number
  /** 最后更新时间 */
  updatedAt: string
  /** 活跃连接数 */
  activeConnections: number
}

/** 系统步骤与主链节点映射 */
export const STEP_MAIN_CHAIN_MAP: Record<string, string> = {
  intent_parse: '需求理解',
  product_recommend: '方案推荐',
  reply_generate: '回复生成',
  quotation_generate: '报价生成',
  outcome_loopback: '结果回流',
}
