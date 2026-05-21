import { http, delay, HttpResponse } from 'msw'
import { mockAiDelay, successResponse } from '../utils'
import { generateRules } from '../data/factory'

const rules = generateRules()
let ruleIdCounter = rules.length + 1

export const rulesHandlers = [
  http.get('/api/v1/rules', async () => {
    await delay(300)
    return successResponse({ items: rules, total: rules.length })
  }),

  http.post('/api/v1/rules', async ({ request }) => {
    await delay(400)
    const body = await request.json() as any
    const newRule = {
      id: `RULE-${String(100 + ruleIdCounter++)}`,
      name: body.name,
      description: body.description || '',
      condition: body.condition,
      action: body.action,
      priority: body.priority || 50,
      tags: body.tags || [],
      status: body.status || 'active',
      version: '1.0',
      creator: '当前用户',
      created_at: new Date().toISOString().slice(0, 10),
    }
    rules.unshift(newRule)
    return successResponse({ message: '规则已创建', rule: newRule })
  }),

  http.put('/api/v1/rules/:id', async ({ request, params }) => {
    await delay(400)
    const body = await request.json() as any
    const idx = rules.findIndex(r => r.id === params.id)
    if (idx >= 0) {
      rules[idx] = { ...rules[idx], ...body, version: String(parseFloat(rules[idx].version) + 0.1).toFixed(1) }
      return successResponse({ message: '规则已更新', rule: rules[idx] })
    }
    return successResponse({ message: '规则不存在' })
  }),

  http.post('/api/v1/rules/:id/toggle', async ({ params }) => {
    await delay(300)
    const idx = rules.findIndex(r => r.id === params.id)
    if (idx >= 0) {
      rules[idx].status = rules[idx].status === 'active' ? 'disabled' : 'active'
      return successResponse({ message: '状态已切换', status: rules[idx].status })
    }
    return successResponse({ message: '规则不存在' })
  }),

  http.post('/api/v1/rules/import', async () => {
    await mockAiDelay()
    return successResponse({ imported: 8, skipped: 2, conflicts: 1 })
  }),

  http.get('/api/v1/rules/:id/versions', async () => {
    await delay(200)
    return successResponse({
      versions: [
        { version: 'v1.3', date: '2025-04-10', author: '张三', change: '新增交期校验条件' },
        { version: 'v1.2', date: '2025-03-15', author: '李四', change: '修改路由目标' },
        { version: 'v1.1', date: '2025-02-20', author: '王五', change: '优化IF条件' },
        { version: 'v1.0', date: '2025-01-01', author: '张三', change: '初始版本' },
      ],
    })
  }),

  http.post('/api/v1/rules/:id/conflict-check', async () => {
    await mockAiDelay()
    return successResponse({
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
    })
  }),
]
