/** ModelConfig — AI 模型配置，映射到主链步骤 */
export interface ModelConfig {
  id: string
  name: string
  /** 关联的主链步骤 */
  step: string
  /** 模型标识 */
  modelId: string
  /** 提供商 */
  provider: string
  /** 配置参数 */
  params: Record<string, string | number | boolean>
  /** 是否启用 */
  enabled: boolean
  /** 平均延迟(ms) */
  avgLatencyMs: number
  /** 调用次数 */
  callCount: number
  /** 版本 */
  version: string
  updatedAt: string
}
