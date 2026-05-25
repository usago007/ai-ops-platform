import { http, delay } from 'msw'
import { mockAiDelay, successResponse } from '../utils'
import { generateCSMessages, generateReplySuggestions, generateMarketingSessions, generateMarketingRecommendations } from '../data/factory'

export const csHandlers = [
  http.get('/api/v1/cs/sessions', async () => {
    await delay(300)
    return successResponse({
      sessions: [
        { id: 'cs-1', customer: '陈先生', company: '苏州智造科技', status: 'active', lastMessage: 'FX3U的交期确认了吗？', unread: 2, intent: '催单' },
        { id: 'cs-2', customer: '林女士', company: '杭州自动化', status: 'active', lastMessage: '能提供技术参数表吗', unread: 0, intent: '技术咨询' },
        { id: 'cs-3', customer: '周总', company: '深圳工业集团', status: 'waiting', lastMessage: '你们的价格太贵了', unread: 1, intent: '议价' },
      ],
    })
  }),

  http.get('/api/v1/cs/sessions/:id/messages', async () => {
    await delay(300)
    return successResponse({ messages: generateCSMessages() })
  }),

  http.post('/api/v1/cs/sessions/:id/reply-suggestions', async () => {
    await mockAiDelay()
    return successResponse({ suggestions: generateReplySuggestions() })
  }),

  http.get('/api/v1/cs/sessions/:id/orders', async () => {
    await delay(200)
    return successResponse({
      orders: [
        { id: 'ORD-2024-0892', product: 'PLC控制器 FX3U-64MT', qty: 50, amount: 128000, status: '已发货', date: '2025-04-01' },
        { id: 'ORD-2024-0756', product: '温度传感器 PT100', qty: 200, amount: 36000, status: '已完成', date: '2025-03-15' },
      ],
    })
  }),

  http.get('/api/v1/cs/marketing/sessions', async () => {
    await delay(300)
    return successResponse({ sessions: generateMarketingSessions() })
  }),

  http.post('/api/v1/cs/marketing/recommend', async () => {
    await mockAiDelay()
    return successResponse({ recommendations: generateMarketingRecommendations() })
  }),

  http.post('/api/v1/cs/marketing/lead-capture', async () => {
    await delay(300)
    return successResponse({ captured: true, leadId: 'LEAD-2025-0417', score: 85 })
  }),
]
