import { generateCSMessages, generateReplySuggestions, generateMarketingRecommendations, generateMarketingSessions } from '../mock/data/factory'

const sessions = [
  { id: 'cs-1', customer: '张先生', company: '苏州智造科技', status: 'active', lastMessage: 'FX3U的交期确认了吗？', unread: 2, intent: '催单' },
  { id: 'cs-2', customer: '李女士', company: '杭州自动化', status: 'active', lastMessage: '能提供技术参数表吗', unread: 0, intent: '技术咨询' },
  { id: 'cs-3', customer: '王总', company: '深圳工业集团', status: 'waiting', lastMessage: '你们的价格太贵了', unread: 1, intent: '议价' },
]

const orders = [
  { id: 'ORD-2024-0892', product: 'PLC控制器 FX3U-64MT', qty: 50, amount: 128000, status: '已发货', date: '2026-04-01' },
  { id: 'ORD-2024-0756', product: '温度传感器 PT100', qty: 200, amount: 36000, status: '已完成', date: '2026-03-15' },
]

export const csDataStore = {
  getSessions: () => ({ sessions: sessions.map(item => ({ ...item })) }),
  getMarketingSessions: () => ({
    sessions: generateMarketingSessions().map(item => ({
      id: item.id,
      customer: item.customer,
      company: item.campaign,
      status: item.status,
      lastMessage: `最近关注商品：${item.product}`,
      unread: 1,
      intent: item.intent,
      product: item.product,
    })),
  }),
  getMessages: () => ({ messages: generateCSMessages().map(item => ({ ...item })) }),
  getReplySuggestions: () => ({ suggestions: [...generateReplySuggestions()] }),
  getMarketingRecommendations: () => ({ recommendations: generateMarketingRecommendations().map(item => ({ ...item })) }),
  captureLead: () => ({ captured: true, leadId: 'LEAD-2026-0506', score: 85 }),
  getOrders: () => ({ orders: orders.map(item => ({ ...item })) }),
}
