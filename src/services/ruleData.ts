import { generateRules } from '../mock/data/factory'

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value))

type RuleStatus = 'active' | 'disabled'

interface RuleRecord {
  id: string
  name: string
  description: string
  condition: string
  action: string
  priority: number
  tags: string[]
  status: RuleStatus
  version: string
  creator: string
  created_at: string
  conflictWith?: string | null
}

interface GeneratedRule {
  id: string
  name: string
  condition: string
  action: string
  status: 'active' | 'disabled'
  version: string
  createdAt: string
  conflictWith: string | null
}

interface CreateRulePayload {
  name: string
  description?: string
  condition: string
  action: string
  priority?: number
  tags?: string[]
  status?: string
}

let ruleIdCounter = 110

const rules: RuleRecord[] = generateRules().map((rule: GeneratedRule, index: number) => ({
  id: rule.id,
  name: rule.name,
  description: `${rule.name} 的业务执行规则`,
  condition: rule.condition,
  action: rule.action,
  priority: 40 + index * 5,
  tags: ['工业自动化', '规则引擎'].slice(0, 1 + (index % 2)),
  status: rule.status,
  version: String(rule.version).replace('v', ''),
  creator: ['陈明远', '林晓峰', '周思琪'][index % 3],
  created_at: new Date(Date.now() - index * 86400000 * 3).toISOString().slice(0, 10),
  conflictWith: rule.conflictWith,
}))

export const ruleDataStore = {
  getRules: () => ({ items: clone(rules), total: rules.length }),

  importRules: () => ({ imported: 8, skipped: 2, conflicts: 1 }),

  createRule: (payload: CreateRulePayload) => {
    const newRule: RuleRecord = {
      id: `RULE-${ruleIdCounter++}`,
      name: payload.name,
      description: payload.description || '',
      condition: payload.condition,
      action: payload.action,
      priority: Number(payload.priority || 50),
      tags: Array.isArray(payload.tags) ? payload.tags : [],
      status: payload.status === 'disabled' ? 'disabled' : 'active',
      version: '1.0',
      creator: '当前用户',
      created_at: new Date().toISOString().slice(0, 10),
      conflictWith: null,
    }
    rules.unshift(newRule)
    return { message: '规则已创建', rule: clone(newRule) }
  },

  updateRule: (id: string, payload: Partial<RuleRecord>) => {
    const index = rules.findIndex(rule => rule.id === id)
    if (index < 0) {
      return { message: '规则不存在' }
    }
    const current = rules[index]
    const nextVersion = (parseFloat(current.version) + 0.1).toFixed(1)
    rules[index] = {
      ...current,
      ...payload,
      priority: Number(payload.priority ?? current.priority),
      tags: Array.isArray(payload.tags) ? payload.tags : current.tags,
      version: nextVersion,
    }
    return { message: '规则已更新', rule: clone(rules[index]) }
  },

  toggleRule: (id: string) => {
    const rule = rules.find(item => item.id === id)
    if (!rule) {
      return { message: '规则不存在' }
    }
    rule.status = rule.status === 'active' ? 'disabled' : 'active'
    return { message: '状态已切换', status: rule.status }
  },

  getVersions: () => ({
    versions: [
      { version: 'v1.3', date: '2025-04-10', author: '陈明远', change: '新增交期校验条件' },
      { version: 'v1.2', date: '2025-03-15', author: '林晓峰', change: '修改路由目标' },
      { version: 'v1.1', date: '2025-02-20', author: '周思琪', change: '优化IF条件' },
      { version: 'v1.0', date: '2025-01-01', author: '陈明远', change: '初始版本' },
    ],
  }),

  checkConflict: () => ({
    hasConflict: true,
    conflicts: [
      {
        ruleA: { id: 'RULE-102', name: '价格异常检测规则', condition: 'IF 价格 > 历史均价 * 1.3' },
        ruleB: { id: 'RULE-105', name: '供应商匹配规则', condition: 'IF 价格 > 历史均价 * 1.5' },
        conflictType: 'overlap',
        severity: 'warning',
        description: '两条规则的价格阈值存在重叠，可能导致重复触发',
      },
    ],
  }),
}
