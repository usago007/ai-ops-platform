/**
 * Mock Latency System — 按场景分层的可控模拟延迟
 *
 * 替代旧的全随机延迟规则，改为按操作类型分区间：
 *  - read:      120–360ms  列表/详情/查询
 *  - aggregate: 180–520ms  页面聚合（多数据组合）
 *  - mutation:  240–640ms  状态写入/变更（非 AI）
 *  - aiAction:  600–1200ms AI 生成/发送/回流/重计算
 *
 * 保留随机抖动保证真实感，但必须受场景区间约束。
 */

export type LatencyTier = 'read' | 'aggregate' | 'mutation' | 'aiAction'

const TIERS: Record<LatencyTier, { min: number; max: number }> = {
  read:      { min: 120, max: 360 },
  aggregate: { min: 180, max: 520 },
  mutation:  { min: 240, max: 640 },
  aiAction:  { min: 600, max: 1200 },
}

/** Random delay within tier bounds */
export function mockDelay(tier: LatencyTier): Promise<void> {
  const { min, max } = TIERS[tier]
  const ms = min + Math.random() * (max - min)
  return new Promise(resolve => setTimeout(resolve, ms))
}
